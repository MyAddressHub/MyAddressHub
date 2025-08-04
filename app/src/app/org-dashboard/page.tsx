'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { addressesAPI } from '@/shared/api/addresses';

interface Address {
  id: string;
  addressName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addressBreakdown?: {
    address: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
}

interface LookupRecord {
  addressId: string | null;
  lookupDate: string;
  reason: string;
}

// Move this function out of the component
async function loadLookupHistory(
  setIsLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>,
  setLookupHistory: React.Dispatch<React.SetStateAction<LookupRecord[]>>
): Promise<void> {
  try {
    setIsLoadingHistory(true);
    const response = await addressesAPI.getOrganizationLookupHistory();
    if (response.success) {
      setLookupHistory(response.data);
    }
  } catch (error: any) {
    console.error('Error loading lookup history:', error);
  } finally {
    setIsLoadingHistory(false);
  }
}

export default function OrgDashboardPage() {
  // All hooks at the top!
  const { user } = useAuth();
  const [addressUuid, setAddressUuid] = useState('');
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lookupHistory, setLookupHistory] = useState<LookupRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // useEffect must also be before any return
  useEffect(() => {
    if (user) {
      loadLookupHistory(setIsLoadingHistory, setLookupHistory);
    }
  }, [user]);

  // Now do early returns
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Please log in to access your dashboard
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!user.profile || user.profile.user_type !== 'organization') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Denied
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              This dashboard is only available for organization users.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLookupAddress = async () => {
    if (!addressUuid.trim()) {
      setError('Please enter an address UUID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAddress(null);

    try {
      const response = await addressesAPI.lookupAddressByUuid(addressUuid.trim());
      
      if (response.success) {
        setAddress(response.data);
        setSuccessMessage('Address found successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        // Refresh lookup history after successful lookup
        loadLookupHistory(setIsLoadingHistory, setLookupHistory);
      } else {
        setError(response.error || 'Failed to find address');
      }
    } catch (error: any) {
      console.error('Error looking up address:', error);
      setError(error.response?.data?.error || 'Failed to look up address');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMessage('UUID copied to clipboard!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Organization Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Welcome, {user.profile?.organization?.name || 'Organization User'}!
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Look up addresses by UUID to view their details. Organization users can only view addresses, not modify them.
              </p>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Address Lookup Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Look Up Address by UUID
          </h2>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="addressUuid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address UUID
              </label>
              <input
                type="text"
                id="addressUuid"
                value={addressUuid}
                onChange={(e) => setAddressUuid(e.target.value)}
                placeholder="Enter address UUID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleLookupAddress}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Looking up...' : 'Look Up'}
              </button>
            </div>
          </div>
        </div>

        {/* Address Details */}
        {address && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Address Details
              </h2>
              <button
                onClick={() => copyToClipboard(address.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Copy UUID"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {address.addressName || 'Unnamed Address'} -- <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{address.id}</span>
                </h3>
                {address.isDefault && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-2">
                    Default
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Address details are restricted for organization users. Only basic information is shown.
              </p>
              
              {address.addressBreakdown && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address Breakdown</h4>
                  <dl className="space-y-1">
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Address:</dt>
                      <dd className="text-gray-900 dark:text-white">{address.addressBreakdown.address}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Street:</dt>
                      <dd className="text-gray-900 dark:text-white">{address.addressBreakdown.street}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Suburb:</dt>
                      <dd className="text-gray-900 dark:text-white">{address.addressBreakdown.suburb}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">State:</dt>
                      <dd className="text-gray-900 dark:text-white">{address.addressBreakdown.state}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Postcode:</dt>
                      <dd className="text-gray-900 dark:text-white">{address.addressBreakdown.postcode}</dd>
                    </div>
                  </dl>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address Breakdown</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Address details are restricted for organization users. Only basic information is shown.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Metadata</h4>
                  <dl className="space-y-1">
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Created:</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {(() => {
                          try {
                            const date = new Date(address.createdAt);
                            if (isNaN(date.getTime())) {
                              return 'Recently';
                            }
                            return date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch (error) {
                            return 'Recently';
                          }
                        })()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Status:</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {address.isActive ? 'Active' : 'Inactive'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lookup History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Lookup History
            </h2>
            <button
              onClick={() => loadLookupHistory(setIsLoadingHistory, setLookupHistory)}
              disabled={isLoadingHistory}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingHistory ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading lookup history...</p>
            </div>
          ) : lookupHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      UUID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {lookupHistory.map((record) => (
                    <tr key={record.addressId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.addressId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(record.lookupDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {record.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No lookup history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 