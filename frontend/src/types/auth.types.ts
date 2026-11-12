export type UserRole = 'super_admin' | 'business_owner';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  _id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'Starter' | 'Professional' | 'Business';
  currency?: string;
  gstin?: string;
}

export interface AuthResponseData {
  user: User;
  business?: Business;
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  business: Business | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RegisterFormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}
