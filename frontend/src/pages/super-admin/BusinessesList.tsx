import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { SuperAdminBusinessItem } from '../../types/business.types';
import { BusinessStatusBadge } from '../../components/business/BusinessStatusBadge';
import { BusinessSearch } from '../../components/business/BusinessSearch';

export const BusinessesList: React.FC = () => {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<SuperAdminBusinessItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    inactive: 0,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await businessService.getSuperAdminBusinesses({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        plan: planFilter === 'all' ? undefined : planFilter,
      });

      setBusinesses(result.businesses);
      setPagination(result.pagination);
      setStats(result.stats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch businesses';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, planFilter]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleToggleStatus = async (
    businessId: string,
    currentStatus: 'active' | 'suspended' | 'inactive'
  ) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const confirmPrompt =
      newStatus === 'suspended'
        ? 'Are you sure you want to suspend this business? All users under this tenant will immediately lose access.'
        : 'Reactivate this business and restore tenant access?';

    if (!window.confirm(confirmPrompt)) return;

    setActionLoadingId(businessId);
    try {
      await businessService.updateBusinessStatus(businessId, newStatus);
      await fetchBusinesses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Super Admin Overview
          </button>

          <button
            onClick={fetchBusinesses}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </button>
        </div>

        {/* Header & Quick Stat Counters */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tenant Directory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive registry of all customer businesses, tenants, and active subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
              Total: {stats.total}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Active: {stats.active}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-xs font-semibold text-rose-700 border border-rose-200">
              Suspended: {stats.suspended}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <BusinessSearch
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            statusFilter={statusFilter}
            onStatusChange={(val) => {
              setStatusFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            planFilter={planFilter}
            onPlanChange={(val) => {
              setPlanFilter(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search businesses by name, slug, email, phone..."
          />
        </div>

        {/* Table of Businesses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Business Entity</th>
                  <th className="py-3.5 px-4">Owner Profile</th>
                  <th className="py-3.5 px-4">Type / Industry</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Members</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {businesses.length > 0 ? (
                  businesses.map((biz) => {
                    const isSuspended = biz.status === 'suspended';
                    const isActionLoading = actionLoadingId === biz._id;

                    return (
                      <tr key={biz._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm">
                                {biz.businessName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                @{biz.businessSlug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">
                            {biz.ownerId?.name || 'Owner N/A'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {biz.ownerId?.email || biz.email}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {biz.businessType || 'Retail'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {biz.subscriptionPlan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {biz.memberCount}
                        </td>

                        <td className="py-3.5 px-4">
                          <BusinessStatusBadge status={biz.status} size="sm" />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => navigate(`/admin/businesses/${biz._id}`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(biz._id, biz.status)}
                              disabled={isActionLoading}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isSuspended
                                  ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                                  : 'text-rose-600 hover:bg-rose-50 border-rose-200'
                              }`}
                              title={isSuspended ? 'Reactivate Tenant' : 'Suspend Tenant'}
                            >
                              {isSuspended ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Ban className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      {isLoading ? 'Loading businesses...' : 'No businesses found matching filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {businesses.length} of {pagination.total} registered companies
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    page: Math.min(p.totalPages, p.page + 1),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
