import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiHealthResponse } from '../types';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach business tenant ID & Auth token when available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    const activeBusinessId = localStorage.getItem('activeBusinessId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (activeBusinessId) {
      // Multi-tenant header for SaaS isolation
      config.headers['x-business-id'] = activeBusinessId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const checkApiHealth = async (): Promise<{
  isOnline: boolean;
  data?: ApiHealthResponse;
  error?: string;
}> => {
  try {
    const res = (await api.get('/health')) as unknown as ApiHealthResponse;
    return { isOnline: true, data: res };
  } catch (error: any) {
    return { isOnline: false, error: error.message };
  }
};

export default api;
