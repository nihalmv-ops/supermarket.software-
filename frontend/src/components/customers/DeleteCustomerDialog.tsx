import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Customer } from '../../types/customer.types';

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
  customer,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Delete Customer Account</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to delete{' '}
            <strong className="text-slate-700 font-semibold">{customer.customerName}</strong>
            {customer.companyName ? ` (${customer.companyName})` : ''}? This action cannot be undone.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Phone:</span>
            <span className="font-semibold text-slate-700">{customer.phone}</span>
          </div>
          {customer.gstin && (
            <div className="flex justify-between">
              <span className="text-slate-400">GSTIN:</span>
              <span className="font-mono text-slate-700">{customer.gstin}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
