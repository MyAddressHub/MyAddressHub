'use client';

import React, { useState, useEffect } from 'react';
import { addressesAPI } from '@/shared/api/addresses';

interface Organization {
  id: string;
  name: string;
  description: string;
}

interface AddressPermission {
  id: string;
  organization: Organization;
  organizationId: string;
  addressName: string;
  grantedByUsername: string;
  isActive: boolean;
  createdAt: string;
}

interface PermissionManagerProps {
  address: Address;
  onClose: () => void;
  onPermissionChange: () => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  address,
  onClose,
  onPermissionChange,
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentPermissions, setCurrentPermissions] = useState<AddressPermission[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
    loadCurrentPermissions();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await addressesAPI.listOrganizations();
      if (response.success) {
        setOrganizations(response.data);
      } else {
        setError('Failed to load organizations');
      }
    } catch (error: any) {
      console.error('Error loading organizations:', error);
      setError('Failed to load organizations');
    }
  };

  const loadCurrentPermissions = async () => {
    console.log('loadCurrentPermissions called for address:', address.id);
    try {
      const response = await addressesAPI.getAddressPermissions(address.id);
      console.log('getAddressPermissions response:', response);
      if (response.success) {
        console.log('Setting current permissions:', response.data);
        setCurrentPermissions(response.data);
      } else {
        console.log('Failed to load current permissions:', response.error);
        setError('Failed to load current permissions');
      }
    } catch (error: any) {
      console.error('Error loading current permissions:', error);
      setError('Failed to load current permissions');
    }
  };

  const handleGrantPermission = async () => {
    if (!selectedOrganization) {
      setError('Please select an organization');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await addressesAPI.grantAddressPermission(address.id, selectedOrganization);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Permission granted successfully!');
        setSelectedOrganization('');
        onPermissionChange();
        loadCurrentPermissions(); // Refresh current permissions
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Failed to grant permission');
      }
    } catch (error: any) {
      console.error('Error granting permission:', error);
      setError(error.response?.data?.error || 'Failed to grant permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokePermission = async (organizationId: string, organizationName: string) => {
    console.log('handleRevokePermission called with:', { organizationId, organizationName });
    
    if (!confirm(`Are you sure you want to revoke permission from ${organizationName}?`)) {
      console.log('User cancelled revoke operation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling revokeAddressPermission API...');
      const response = await addressesAPI.revokeAddressPermission(address.id, organizationId);
      console.log('revokeAddressPermission response:', response);
      
      if (response.success) {
        console.log('Revoke successful, refreshing permissions...');
        setSuccessMessage(response.message || 'Permission revoked successfully!');
        onPermissionChange();
        await loadCurrentPermissions(); // Refresh current permissions
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log('Revoke failed:', response.error);
        setError(response.error || 'Failed to revoke permission');
      }
    } catch (error: any) {
      console.error('Error revoking permission:', error);
      setError(error.response?.data?.error || 'Failed to revoke permission');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Manage Permissions for "{address.addressName}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
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
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
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

        {/* Grant Permission Form */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Grant Permission to Organization
          </h4>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Organization
              </label>
              <select
                id="organization"
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Choose an organization...</option>
                {organizations
                  .filter(org => !currentPermissions.some(perm => perm.organizationId === org.id))
                  .map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGrantPermission}
                disabled={isLoading || !selectedOrganization}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Granting...' : 'Grant Permission'}
              </button>
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div>
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Organizations with Access
          </h4>
          
          {currentPermissions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No organizations currently have access to this address.
            </p>
          ) : (
            <div className="space-y-2">
              {currentPermissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{permission.organization.name}</h5>
                    {permission.organization.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{permission.organization.description}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Granted by {permission.grantedByUsername} on {new Date(permission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokePermission(permission.organizationId, permission.organization.name)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 