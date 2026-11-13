import React from 'react';
import { Users, UserCheck, UserPlus, IndianRupee } from 'lucide-react';
import { CustomerMetricsSummary } from '../../types/customer.types';

interface CustomerStatsProps {
  metrics: CustomerMetricsSummary | null;
  isLoading: boolean;
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({ metrics, isLoading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Customers */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Customers
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {isLoading ? '—' : metrics?.totalCustomers ?? 0}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">All registered client records</p>
      </div>

      {/* Active Accounts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Clients
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">
          {isLoading ? '—' : metrics?.activeCustomers ?? 0}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Available for billing & quotes</p>
      </div>

      {/* New This Month */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            New This Month
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {isLoading ? '—' : metrics?.newCustomersThisMonth ?? 0}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Acquired during current cycle</p>
      </div>

      {/* Outstanding Balance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            With Due Balance
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {isLoading ? '—' : metrics?.customersWithOutstanding ?? 0}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Requires reconciliation</p>
      </div>
    </div>
  );
};
