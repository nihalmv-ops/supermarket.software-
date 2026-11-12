import api, { setAccessToken } from './api';
import {
  AuthResponseData,
  RegisterFormData,
  LoginFormData,
  User,
  Business,
} from '../types/auth.types';

export const authService = {
  /**
   * Register a new Business & Owner
   */
  register: async (
    data: RegisterFormData
  ): Promise<{ user: User; business?: Business; accessToken: string }> => {
    const response = (await api.post('/auth/register', data)) as unknown as {
      success: boolean;
      data: AuthResponseData;
    };
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  /**
   * Log in user with credentials
   */
  login: async (
    data: LoginFormData
  ): Promise<{ user: User; business?: Business; accessToken: string }> => {
    const response = (await api.post('/auth/login', data)) as unknown as {
      success: boolean;
      data: AuthResponseData;
    };
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  /**
   * Refresh session using HttpOnly cookie
   */
  refresh: async (): Promise<{
    user: User;
    business?: Business;
    accessToken: string;
  }> => {
    const response = (await api.post('/auth/refresh')) as unknown as {
      success: boolean;
      data: AuthResponseData;
    };
    setAccessToken(response.data.accessToken);
    return response.data;
  },

  /**
   * Log out active user session
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      localStorage.removeItem('activeBusinessId');
    }
  },

  /**
   * Fetch current authenticated user & business
   */
  getMe: async (): Promise<{ user: User; business?: Business }> => {
    const response = (await api.get('/auth/me')) as unknown as {
      success: boolean;
      data: { user: User; business?: Business };
    };
    return response.data;
  },

  /**
   * Request password reset instructions
   */
  forgotPassword: async (email: string): Promise<string> => {
    const response = (await api.post('/auth/forgot-password', {
      email,
    })) as unknown as {
      success: boolean;
      message: string;
    };
    return response.message;
  },

  /**
   * Reset password with reset token
   */
  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<string> => {
    const response = (await api.post('/auth/reset-password', {
      token,
      newPassword,
    })) as unknown as {
      success: boolean;
      message: string;
    };
    return response.message;
  },
};
