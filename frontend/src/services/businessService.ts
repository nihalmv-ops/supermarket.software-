import api, { ApiResponse } from './api';
import {
  BusinessItem,
  BusinessMembershipData,
  CreateBusinessInput,
  UpdateBusinessProfileInput,
  SuperAdminBusinessesResponse,
  SuperAdminMetricsResponse,
  BusinessStatus,
} from '../types/business.types';

export const businessService = {
  /**
   * Get all businesses user has active membership in
   */
  getMyBusinesses: async (): Promise<BusinessItem[]> => {
    const response = await api.get<ApiResponse<BusinessItem[]>>('/business/my-businesses');
    return response.data.data || [];
  },

  /**
   * Get currently active business and user's membership
   */
  getActiveBusiness: async (): Promise<{
    business: BusinessItem;
    membership: BusinessMembershipData;
  }> => {
    const response = await api.get<
      ApiResponse<{ business: BusinessItem; membership: BusinessMembershipData }>
    >('/business/active');
    return response.data.data!;
  },

  /**
   * Switch the active business context
   */
  switchBusiness: async (
    businessId: string
  ): Promise<{
    business: BusinessItem;
    membership: BusinessMembershipData;
  }> => {
    const response = await api.patch<
      ApiResponse<{ business: BusinessItem; membership: BusinessMembershipData }>
    >(`/business/switch/${businessId}`);

    // Update localStorage active tenant identifier
    localStorage.setItem('activeBusinessId', businessId);
    return response.data.data!;
  },

  /**
   * Register a new additional business
   */
  registerBusiness: async (
    data: CreateBusinessInput
  ): Promise<{
    business: BusinessItem;
    membership: BusinessMembershipData;
  }> => {
    const response = await api.post<
      ApiResponse<{ business: BusinessItem; membership: BusinessMembershipData }>
    >('/business/register', data);

    if (response.data.data?.business?._id) {
      localStorage.setItem('activeBusinessId', response.data.data.business._id);
    }
    return response.data.data!;
  },

  /**
   * Get Active Business Profile
   */
  getProfile: async (): Promise<BusinessItem> => {
    const response = await api.get<ApiResponse<{ business: BusinessItem }>>('/business/profile');
    return response.data.data!.business;
  },

  /**
   * Update Active Business Profile
   */
  updateProfile: async (data: UpdateBusinessProfileInput): Promise<BusinessItem> => {
    const response = await api.put<ApiResponse<{ business: BusinessItem }>>('/business/profile', data);
    return response.data.data!.business;
  },

  // -------------------------------------------------------------
  // Super Admin API Operations
  // -------------------------------------------------------------

  /**
   * List all businesses across all tenants (Super Admin only)
   */
  getSuperAdminBusinesses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    plan?: string;
  }): Promise<SuperAdminBusinessesResponse> => {
    const response = await api.get<ApiResponse<SuperAdminBusinessesResponse>>(
      '/super-admin/businesses',
      { params }
    );
    return response.data.data!;
  },

  /**
   * Inspect a specific tenant business and its members (Super Admin only)
   */
  getSuperAdminBusinessById: async (
    businessId: string
  ): Promise<{ business: BusinessItem; members: BusinessMembershipData[] }> => {
    const response = await api.get<
      ApiResponse<{ business: BusinessItem; members: BusinessMembershipData[] }>
    >(`/super-admin/businesses/${businessId}`);
    return response.data.data!;
  },

  /**
   * Update Business status (Suspend / Reactivate / Inactive)
   */
  updateBusinessStatus: async (
    businessId: string,
    status: BusinessStatus
  ): Promise<BusinessItem> => {
    const response = await api.patch<ApiResponse<{ business: BusinessItem }>>(
      `/super-admin/businesses/${businessId}/status`,
      { status }
    );
    return response.data.data!.business;
  },

  /**
   * Get system-wide platform metrics (Super Admin only)
   */
  getSuperAdminMetrics: async (): Promise<SuperAdminMetricsResponse> => {
    const response = await api.get<ApiResponse<SuperAdminMetricsResponse>>(
      '/super-admin/metrics'
    );
    return response.data.data!;
  },
};
