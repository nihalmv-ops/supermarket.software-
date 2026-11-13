import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { CustomerType } from '../../types/customer.types';

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  customerType: CustomerType | 'all';
  onCustomerTypeChange: (value: CustomerType | 'all') => void;
  status: 'active' | 'inactive' | 'all';
  onStatusChange: (value: 'active' | 'inactive' | 'all') => void;
  sortBy: 'customerName' | 'companyName' | 'createdAt' | 'updatedAt';
  onSortByChange: (value: 'customerName' | 'companyName' | 'createdAt' | 'updatedAt') => void;
  sortOrder: 'asc' | 'desc';
  onToggleSortOrder: () => void;
}

export const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  search,
  onSearchChange,
  customerType,
  onCustomerTypeChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by customer name, company, phone, email, or GSTIN..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />
      </div>

      {/* Filter Selectors & Sort Toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Customer Type Filter */}
        <select
          value={customerType}
          onChange={(e) => onCustomerTypeChange(e.target.value as CustomerType | 'all')}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="business">Business</option>
          <option value="individual">Individual</option>
          <option value="wholesale">Wholesale</option>
          <option value="retail">Retail</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'active' | 'inactive' | 'all')}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        {/* Sort By Field */}
        <select
          value={sortBy}
          onChange={(e) =>
            onSortByChange(
              e.target.value as 'customerName' | 'companyName' | 'createdAt' | 'updatedAt'
            )
          }
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
        >
          <option value="createdAt">Date Created</option>
          <option value="customerName">Name (A-Z)</option>
          <option value="companyName">Company</option>
          <option value="updatedAt">Recently Updated</option>
        </select>

        {/* Sort Order Toggle */}
        <button
          type="button"
          onClick={onToggleSortOrder}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors"
          title={`Sorting: ${sortOrder.toUpperCase()}`}
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
