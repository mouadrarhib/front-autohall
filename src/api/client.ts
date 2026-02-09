// src/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined in environment variables');
}

console.log('API Base URL:', API_BASE_URL);

// Flag to prevent multiple logout attempts
let isLoggingOut = false;

const SUCCESS_TOAST_IGNORED_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/logout',
]);

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const shouldShowMutationSuccessToast = (method?: string, url?: string): boolean => {
  if (!method || !url) {
    return false;
  }

  const normalizedMethod = method.toLowerCase();
  if (!MUTATION_METHODS.has(normalizedMethod)) {
    return false;
  }

  const normalizedUrl = url.split('?')[0].toLowerCase();
  if (SUCCESS_TOAST_IGNORED_PATHS.has(normalizedUrl)) {
    return false;
  }

  return true;
};

const getActionVerb = (method: string, url: string): string => {
  const normalizedMethod = method.toLowerCase();
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes('/activate')) {
    return 'activated';
  }
  if (normalizedUrl.includes('/deactivate')) {
    return 'deactivated';
  }

  if (normalizedMethod === 'post') {
    return 'created';
  }
  if (normalizedMethod === 'put' || normalizedMethod === 'patch') {
    return 'updated';
  }

  return 'deleted';
};

const formatResourceName = (url?: string): string => {
  if (!url) {
    return 'Record';
  }

  const segments = url
    .split('?')[0]
    .split('/')
    .filter((segment) => segment && segment !== 'api' && !/^\d+$/.test(segment));

  const cleanedSegments = segments.filter(
    (segment) => segment !== 'activate' && segment !== 'deactivate'
  );

  const fallbackSegment = cleanedSegments[cleanedSegments.length - 1];
  if (!fallbackSegment) {
    return 'Record';
  }

  const aliasMap: Record<string, string> = {
    auth: 'User',
    users: 'User',
    usersite: 'User site',
    usersites: 'User site',
    role: 'Role',
    roles: 'Role',
    permissions: 'Permission',
    'create-user-complete': 'User',
    'roles-permissions': 'Roles and permissions',
    ventes: 'Vente',
    objectifs: 'Objectif',
    periode: 'Periode',
    'type-ventes': 'Type vente',
    'type-objectifs': 'Type objectif',
    'type-periode': 'Type periode',
    filiales: 'Filiale',
    succursales: 'Succursale',
    marques: 'Marque',
    modeles: 'Modele',
    versions: 'Version',
    groupements: 'Groupement',
  };

  const lowered = fallbackSegment.toLowerCase();
  if (aliasMap[lowered]) {
    return aliasMap[lowered];
  }

  const normalized = lowered.replace(/[-_]/g, ' ').trim();
  if (!normalized) {
    return 'Record';
  }

  const singular = normalized.endsWith('s') ? normalized.slice(0, -1) : normalized;
  return singular.charAt(0).toUpperCase() + singular.slice(1);
};

type SuccessToastResponse = Pick<AxiosResponse, 'config'> & {
  data?: {
    message?: unknown;
  };
};

const getSuccessToastMessage = (response: SuccessToastResponse): string => {
  const backendMessage = response?.data?.message;
  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }

  const actionVerb = getActionVerb(response.config?.method ?? '', response.config?.url ?? '');
  const resourceName = formatResourceName(response.config?.url);
  return `${resourceName} ${actionVerb} successfully.`;
};

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

    if (shouldShowMutationSuccessToast(response.config?.method, response.config?.url)) {
      toast.success(getSuccessToastMessage(response), {
        position: 'top-right',
        autoClose: 2500,
      });
    }

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
      toast.error('Your session has expired. Please login again.', {
        position: 'top-center',
        autoClose: 5000,
      });
      
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
      toast.error('You do not have permission to perform this action.', {
        position: 'top-right',
        autoClose: 3000,
      });
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
