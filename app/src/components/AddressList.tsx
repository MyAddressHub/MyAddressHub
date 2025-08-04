'use client';

import React, { useState } from 'react';
import { addressesAPI } from '@/shared/api/addresses';

interface Address {
  id: string;
  addressName: string;
  address: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fullAddress: string;
  addressBreakdown: {
    address: string;
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
}

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
  onViewBreakdown: (addressId: string) => void;
  onManagePermissions: (address: Address) => void;
  isLoading?: boolean;
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
  onViewBreakdown,
  onManagePermissions,
  isLoading = false,
}) => {
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const toggleExpanded = (addressId: string) => {
    setExpandedAddress(expandedAddress === addressId ? null : addressId);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium">No addresses found</h3>
          <p className="mt-2">Get started by adding your first address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {address.addressName || 'Unnamed Address'} -- <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{address.id}</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(address.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Copy UUID"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Default
                    </span>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {address.fullAddress}
                </p>
                
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Added {(() => {
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
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleExpanded(address.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="View details"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedAddress === address.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address Breakdown</h4>
                    <dl className="space-y-1">
                      <div>
                        <dt className="text-gray-500 dark:text-gray-400">Address:</dt>
                        <dd className="text-gray-900 dark:text-white">{address.address}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 dark:text-gray-400">Street:</dt>
                        <dd className="text-gray-900 dark:text-white">{address.street}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 dark:text-gray-400">Suburb:</dt>
                        <dd className="text-gray-900 dark:text-white">{address.suburb}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 dark:text-gray-400">State:</dt>
                        <dd className="text-gray-900 dark:text-white">{address.state}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500 dark:text-gray-400">Postcode:</dt>
                        <dd className="text-gray-900 dark:text-white">{address.postcode}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => onViewBreakdown(address.id)}
                        className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        View Full Breakdown
                      </button>
                      <button
                        onClick={() => onManagePermissions(address)}
                        className="w-full text-left px-3 py-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        Manage Permissions
                      </button>
                      {!address.isDefault && (
                        <button
                          onClick={() => onSetDefault(address.id)}
                          className="w-full text-left px-3 py-2 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(address)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Edit Address
                      </button>
                      <button
                        disabled
                        title="Delete is disabled"
                        className="w-full text-left px-3 py-2 text-sm text-red-400 cursor-not-allowed rounded-md bg-red-50 dark:bg-red-900/20"
                      >
                        Delete Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Copy Toast Notification */}
      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>UUID copied to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  );
}; 