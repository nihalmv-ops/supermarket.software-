import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, Business, LoginFormData, RegisterFormData } from '../types/auth.types';
import { authService } from '../services/authService';
import { setAccessToken } from '../services/api';

export interface AuthContextType {
  user: User | null;
  business: Business | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session via HttpOnly refresh cookie on application load
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const data = await authService.refresh();
      setUser(data.user);
      setBusiness(data.business || null);
      setToken(data.accessToken);

      if (data.business?._id) {
        localStorage.setItem('activeBusinessId', data.business._id);
      }
      return true;
    } catch {
      setUser(null);
      setBusiness(null);
      setToken(null);
      setAccessToken(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);
      setUser(result.user);
      setBusiness(result.business || null);
      setToken(result.accessToken);

      if (result.business?._id) {
        localStorage.setItem('activeBusinessId', result.business._id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      setUser(result.user);
      setBusiness(result.business || null);
      setToken(result.accessToken);

      if (result.business?._id) {
        localStorage.setItem('activeBusinessId', result.business._id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setBusiness(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
