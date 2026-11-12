export type BusinessStatus = 'active' | 'suspended' | 'inactive';
export type BusinessPlan = 'Starter' | 'Professional' | 'Business';
export type MembershipRole = 'owner' | 'admin' | 'staff';

export interface BusinessItem {
  _id: string;
  businessName: string;
  businessSlug: string;
  businessType: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gstNumber?: string;
  logo?: string;
  status: BusinessStatus;
  subscriptionPlan: BusinessPlan;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled';
  currency?: string;
  role?: MembershipRole;
  permissions?: string[];
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessMembershipData {
  _id?: string;
  userId: string;
  businessId: string;
  role: MembershipRole;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface CreateBusinessInput {
  businessName: string;
  businessType?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gstNumber?: string;
  subscriptionPlan?: BusinessPlan;
}

export interface UpdateBusinessProfileInput {
  businessName?: string;
  businessType?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gstNumber?: string;
  logo?: string;
}

export interface SuperAdminBusinessItem extends BusinessItem {
  ownerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
  };
  memberCount: number;
}

export interface SuperAdminBusinessesResponse {
  businesses: SuperAdminBusinessItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    active: number;
    suspended: number;
    inactive: number;
  };
}

export interface SuperAdminMetricsResponse {
  users: number;
  businesses: {
    total: number;
    active: number;
    suspended: number;
  };
  plans: Array<{ _id: string; count: number }>;
}
