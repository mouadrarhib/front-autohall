// src/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined in environment variables');
}

console.log('API Base URL:', API_BASE_URL);

// Flag to prevent multiple logout attempts
let isLoggingOut = false;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with auto-logout on 401
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;
    
    console.error('API Error Response:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    
    // Handle 401 Unauthorized - Session expired
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      console.log('Session expired (401), performing automatic logout...');
      
      // Import auth store dynamically to avoid circular dependencies
      const { useAuthStore } = await import('../store/authStore');
      const logout = useAuthStore.getState().logout;
      
      // Clear auth state
      await logout();
      
      // Show notification (if toast is available)
      try {
        const { toast } = await import('react-toastify');
        toast.error('Your session has expired. Please login again.', {
          position: 'top-center',
          autoClose: 5000,
        });
      } catch (e) {
        // Fallback if toast is not available
        console.warn('Session expired. Please login again.');
      }
      
      // Redirect to login page
      window.location.href = '/login';
      
      // Reset flag after a delay
      setTimeout(() => {
        isLoggingOut = false;
      }, 1000);
    }
    
    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.log('Access forbidden (403)');
      try {
        const { toast } = await import('react-toastify');
        toast.error('You do not have permission to perform this action.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } catch (e) {
        console.warn('Access forbidden');
      }
    }
    
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  stack?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}
