import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Users,
  ShieldCheck,
  Ban,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { businessService } from '../../services/businessService';
import { BusinessItem } from '../../types/business.types';
import { BusinessStatusBadge } from '../../components/business/BusinessStatusBadge';

export const BusinessDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<BusinessItem | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await businessService.getSuperAdminBusinessById(id);
      setBusiness(data.business);
      setMembers(data.members || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch business details';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleToggleStatus = async () => {
    if (!business) return;
    const newStatus = business.status === 'suspended' ? 'active' : 'suspended';

    const confirmed = window.confirm(
      newStatus === 'suspended'
        ? `Are you sure you want to suspend '${business.businessName}'? Users under this business will lose access.`
        : `Reactivate '${business.businessName}' and restore tenant access?`
    );

    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const updated = await businessService.updateBusinessStatus(business._id, newStatus);
      setBusiness(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      alert(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center text-slate-500 text-sm">
          Loading business details...
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Unable to load business</h2>
          <p className="text-xs text-slate-500">{error || 'Business not found'}</p>
          <button
            onClick={() => navigate('/admin/businesses')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  const isSuspended = business.status === 'suspended';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          onClick={() => navigate('/admin/businesses')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Business Directory
        </button>

        {/* Header Hero Banner */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {business.logo ? (
                <img
                  src={business.logo}
                  alt={business.businessName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {business.businessName}
                </h1>
                <BusinessStatusBadge status={business.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Tenant ID: {business._id} • Slug: @{business.businessSlug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
              {business.subscriptionPlan} Plan
            </span>

            <button
              onClick={handleToggleStatus}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
            >
              {isSuspended ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Reactivate Tenant
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Suspend Account
                </>
              )}
            </button>
          </div>
        </div>

        {/* Company Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Company Overview</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Business Industry</span>
                <span className="font-semibold text-slate-800">{business.businessType || 'Retail'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Official Email</span>
                <span className="font-medium text-slate-800">{business.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Contact Phone</span>
                <span className="font-medium text-slate-800">{business.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">GST Registration</span>
                <span className="font-mono font-semibold text-slate-800">
                  {business.gstNumber || 'None'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Registered On</span>
                <span className="font-medium text-slate-800">
                  {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Address */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Premises & Billing</h2>
            <div className="space-y-3 text-xs">
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block mb-0.5">Street Address</span>
                <span className="font-medium text-slate-800">
                  {business.address || 'No street address specified'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">City / Region</span>
                <span className="font-medium text-slate-800">{business.city || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">State</span>
                <span className="font-medium text-slate-800">{business.state || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Country & Postal</span>
                <span className="font-medium text-slate-800">
                  {business.country || 'India'} - {business.pincode || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Member Directory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Tenant Membership Roster ({members.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Authorized Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Member Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Permissions</th>
                  <th className="py-2.5 px-4">Active</th>
                  <th className="py-2.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {m.userId?.name || 'User'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{m.userId?.email || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 capitalize">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono text-slate-500">
                        {Array.isArray(m.permissions) ? m.permissions.join(', ') : 'all'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          m.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
