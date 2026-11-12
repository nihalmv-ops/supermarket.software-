import React from 'react';
import { Search } from 'lucide-react';

interface BusinessSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  planFilter?: string;
  onPlanChange?: (value: string) => void;
  placeholder?: string;
}

export const BusinessSearch: React.FC<BusinessSearchProps> = ({
  search,
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  planFilter = 'all',
  onPlanChange,
  placeholder = 'Search by business name, email, or slug...',
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
      </div>

      {/* Status Filter */}
      {onStatusChange && (
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      )}

      {/* Plan Filter */}
      {onPlanChange && (
        <select
          value={planFilter}
          onChange={(e) => onPlanChange(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        >
          <option value="all">All Plans</option>
          <option value="Starter">Starter Plan</option>
          <option value="Professional">Professional Plan</option>
          <option value="Business">Business Plan</option>
        </select>
      )}
    </div>
  );
};
