import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { ApiHealthResponse } from '../types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
}

// In-memory access token storage (short-lived 15m JWT)
let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  currentAccessToken = token;
  if (token) {
    sessionStorage.setItem('has_active_session', 'true');
  } else {
    sessionStorage.removeItem('has_active_session');
  }
};

export const getAccessToken = (): string | null => currentAccessToken;

const api: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000, // 30-second timeout for cloud database operations
  withCredentials: true, // Send and receive HttpOnly cookies (refreshToken)
});

// Request Interceptor: Attach in-memory access token and business tenant ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }

    const activeBusinessId = localStorage.getItem('activeBusinessId');
    if (activeBusinessId) {
      config.headers['x-business-id'] = activeBusinessId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Centralized error normalization with silent token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried and not an auth endpoint
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{
          success: boolean;
          data: { accessToken: string };
        }>(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    let message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected server communication error occurred';

    if (error.code === 'ECONNABORTED' || message.toLowerCase().includes('timeout')) {
      message =
        'Connection timed out. Please check if the backend server is running on http://localhost:5000 and MongoDB Atlas is connected.';
    } else if (
      message.toLowerCase().includes('network error') ||
      error.code === 'ERR_NETWORK' ||
      !error.response
    ) {
      message =
        'Cannot reach backend server. Please verify the backend is running (`cd backend && npm run dev`) on http://localhost:5000.';
    }

    return Promise.reject(new Error(message));
  }
);

/**
 * Diagnostic health check pinging GET /api/health
 */
export const checkApiHealth = async (): Promise<{
  isOnline: boolean;
  data?: ApiHealthResponse;
  error?: string;
}> => {
  try {
    const res = (await api.get('/health')) as unknown as ApiHealthResponse;
    return {
      isOnline: res.success || res.database !== undefined,
      data: res,
    };
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : 'Failed to reach API server';
    return { isOnline: false, error: errMessage };
  }
};

export default api;
