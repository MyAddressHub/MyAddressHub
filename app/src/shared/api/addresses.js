import axios from './axios';

const ADDRESSES_API = '/api/addresses/';

// Utility function to convert snake_case to camelCase
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      newObj[camelKey] = toCamelCase(obj[key]);
    });
    return newObj;
  }
  return obj;
};

// Utility function to convert camelCase to snake_case
const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = toSnakeCase(obj[key]);
    });
    return newObj;
  }
  return obj;
};

export const addressesAPI = {
  // Get all addresses for the current user
  getUserAddresses: async () => {
    console.log('Calling getUserAddresses API...');
    try {
      const response = await axios.get(`${ADDRESSES_API}user/`);
      console.log('getUserAddresses response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('getUserAddresses error:', error);
      throw error;
    }
  },

  // Get a specific address by UUID
  getAddress: async (addressId) => {
    console.log('Calling getAddress API...', addressId);
    try {
      const response = await axios.get(`${ADDRESSES_API}${addressId}/`);
      console.log('getAddress response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('getAddress error:', error);
      throw error;
    }
  },

  // Create a new address
  createAddress: async (addressData) => {
    console.log('Calling createAddress API...', addressData);
    try {
      // Convert camelCase to snake_case for backend
      const requestData = toSnakeCase(addressData);
      console.log('Sending snake_case data:', requestData);
      const response = await axios.post(ADDRESSES_API, requestData);
      console.log('createAddress response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('createAddress error:', error);
      throw error;
    }
  },

  // Update an existing address
  updateAddress: async (addressId, addressData) => {
    console.log('Calling updateAddress API...', addressId, addressData);
    try {
      // Convert camelCase to snake_case for backend
      const requestData = toSnakeCase(addressData);
      console.log('Sending snake_case data:', requestData);
      const response = await axios.put(`${ADDRESSES_API}${addressId}/`, requestData);
      console.log('updateAddress response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('updateAddress error:', error);
      throw error;
    }
  },

  // Delete an address (soft delete)
  deleteAddress: async (addressId) => {
    console.log('Calling deleteAddress API...', addressId);
    try {
      const response = await axios.delete(`${ADDRESSES_API}${addressId}/`);
      console.log('deleteAddress response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('deleteAddress error:', error);
      throw error;
    }
  },

  // Get address breakdown by UUID
  getAddressBreakdown: async (addressId) => {
    console.log('Calling getAddressBreakdown API...', addressId);
    try {
      const response = await axios.get(`${ADDRESSES_API}${addressId}/breakdown/`);
      console.log('getAddressBreakdown response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('getAddressBreakdown error:', error);
      throw error;
    }
  },

  // Set an address as default
  setDefaultAddress: async (addressId) => {
    console.log('Calling setDefaultAddress API...', addressId);
    try {
      const response = await axios.post(`${ADDRESSES_API}${addressId}/set-default/`);
      console.log('setDefaultAddress response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('setDefaultAddress error:', error);
      throw error;
    }
  },

  // Get the default address for the current user
  getDefaultAddress: async () => {
    console.log('Calling getDefaultAddress API...');
    try {
      const response = await axios.get(`${ADDRESSES_API}default/`);
      console.log('getDefaultAddress response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('getDefaultAddress error:', error);
      throw error;
    }
  },

  // Look up address by UUID (for organization users)
  lookupAddressByUuid: async (addressUuid) => {
    console.log('Calling lookupAddressByUuid API...', addressUuid);
    try {
      const response = await axios.get(`${ADDRESSES_API}lookup/${addressUuid}/`);
      console.log('lookupAddressByUuid response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('lookupAddressByUuid error:', error);
      throw error;
    }
  },

  // Grant permission to an organization
  grantAddressPermission: async (addressId, organizationId) => {
    console.log('Calling grantAddressPermission API...', addressId, organizationId);
    try {
      const response = await axios.post(`${ADDRESSES_API}${addressId}/grant-permission/`, {
        organization_id: organizationId
      });
      console.log('grantAddressPermission response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('grantAddressPermission error:', error);
      throw error;
    }
  },

  // Revoke permission from an organization
  revokeAddressPermission: async (addressId, organizationId) => {
    console.log('Calling revokeAddressPermission API...', addressId, organizationId);
    try {
      const response = await axios.delete(`${ADDRESSES_API}${addressId}/revoke-permission/${organizationId}/`);
      console.log('revokeAddressPermission response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('revokeAddressPermission error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // List all organizations (for individual users)
  listOrganizations: async () => {
    console.log('Calling listOrganizations API...');
    try {
      const response = await axios.get(`${ADDRESSES_API}organizations/`);
      console.log('listOrganizations response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('listOrganizations error:', error);
      throw error;
    }
  },

  // Get current permissions for an address
  getAddressPermissions: async (addressId) => {
    console.log('Calling getAddressPermissions API...', addressId);
    try {
      const response = await axios.get(`${ADDRESSES_API}${addressId}/permissions/`);
      console.log('getAddressPermissions response:', response.data);
      // Convert snake_case to camelCase for frontend
      return toCamelCase(response.data);
    } catch (error) {
      console.error('getAddressPermissions error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Organization lookup history
  getOrganizationLookupHistory: async () => {
    try {
      console.log('Getting organization lookup history...');
      const response = await axios.get(`${ADDRESSES_API}lookup-history/`);
      console.log('Organization lookup history response:', response.data);
      return toCamelCase(response.data);
    } catch (error) {
      console.error('Error getting organization lookup history:', error);
      throw error;
    }
  },
}; 