import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Phone,
  Mail,
  Eye,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Power,
  Users,
} from 'lucide-react';
import { Customer } from '../../types/customer.types';
import { CustomerStatusBadge } from './CustomerStatusBadge';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onToggleStatus: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  isLoading,
  pagination,
  onPageChange,
  onToggleStatus,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'wholesale':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'retail':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'individual':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'business':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Customer / Contact</th>
              <th className="py-3.5 px-4">Phone & Email</th>
              <th className="py-3.5 px-4">GSTIN</th>
              <th className="py-3.5 px-4">Customer Type</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading customers...</span>
                  </div>
                </td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Name & Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.customerType === 'individual' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div
                          onClick={() => navigate(`/customers/${c._id}`)}
                          className="font-semibold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors"
                        >
                          {c.customerName}
                        </div>
                        {c.companyName ? (
                          <div className="text-[11px] text-slate-400 font-medium">
                            {c.companyName}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 capitalize">
                            {c.city ? `${c.city}, ${c.state || 'India'}` : 'Direct Client'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Phone & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-300">No email registered</span>
                    )}
                  </td>

                  {/* GSTIN */}
                  <td className="py-3.5 px-4">
                    {c.gstin ? (
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.gstin}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Unregistered</span>
                    )}
                  </td>

                  {/* Customer Type Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getTypeBadgeClass(
                        c.customerType
                      )}`}
                    >
                      {c.customerType}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <CustomerStatusBadge isActive={c.isActive} size="sm" />
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/customers/${c._id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => navigate(`/customers/${c._id}/statement`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors"
                        title="Customer Statement"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => navigate(`/customers/${c._id}/edit`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleStatus(c)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          c.isActive
                            ? 'text-amber-600 hover:bg-amber-50 border-amber-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                        title={c.isActive ? 'Deactivate Customer' : 'Activate Customer'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteClick(c)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">No customers found</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Get started by adding your first client or uploading a CSV file.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">{customers.length}</span> of{' '}
          <span className="font-semibold text-slate-700">{pagination.total}</span> registered customer(s)
        </div>

        <div className="flex items-center gap-2 self-center sm:self-auto">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-semibold text-slate-700 px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
