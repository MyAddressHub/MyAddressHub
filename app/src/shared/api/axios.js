import axios from 'axios';
import humps from 'humps';
import settings from '../config/settings';

// Create axios instance
const instance = axios.create({
    baseURL: settings.apiBaseURL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
instance.interceptors.request.use((request) => {
    console.log('Making API request to:', request.url);
    console.log('Request method:', request.method);
    console.log('Request data:', request.data);
    
    // Add auth token if available
    const authToken = localStorage.getItem('accessToken');
    console.log('Auth token available:', !!authToken);
    if (authToken) {
        request.headers.Authorization = `Bearer ${authToken}`;
        console.log('Added Authorization header');
    } else {
        console.log('No auth token found');
    }
    
    // Transform request data to snake_case
    if (request.data) {
        request.data = humps.decamelizeKeys(request.data);
        console.log('Transformed request data:', request.data);
    }
    
    return request;
});

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        console.log('API response received:', response.status, response.data);
        // Transform response data to camelCase
        if (response.data) {
            response.data = humps.camelizeKeys(response.data);
        }
        return response;
    },
    async (error) => {
        console.error('API error:', error.response?.status, error.response?.data);
        if (error.response) {
            // Handle authentication errors
            if (error.response.status === 401) {
                console.log('401 Unauthorized - attempting token refresh');
                // Try to refresh token if available
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    try {
                        const response = await axios.post(`${settings.apiBaseURL}/api/auth/token/refresh/`, {
                            refresh: refreshToken
                        });
                        if (response.data.access) {
                            localStorage.setItem('accessToken', response.data.access);
                            console.log('Token refreshed successfully');
                            // Retry the original request
                            const config = error.config;
                            config.headers.Authorization = `Bearer ${response.data.access}`;
                            return axios(config);
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/auth/login';
                        return Promise.reject(error);
                    }
                } else {
                    console.log('No refresh token available');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
            }
            
            // Transform error response data to camelCase
            if (error.response.data) {
                error.response.data = humps.camelizeKeys(error.response.data);
            }
        }
        return Promise.reject(error);
    }
);

export default instance; 