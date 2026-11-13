import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Product } from '../../types/product.types';

interface DeleteProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-rose-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-surface-900 text-base">
                Delete {product.itemType === 'service' ? 'Service' : 'Product'}
              </h3>
              <p className="text-xs text-rose-600 font-medium">Permanent Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-surface-600">
            Are you sure you want to delete{' '}
            <span className="font-bold text-surface-900">"{product.name}"</span>?
          </p>

          {product.sku && (
            <p className="text-xs text-surface-500">
              SKU / Code: <span className="font-mono">{product.sku}</span>
            </p>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs leading-relaxed">
            Note: Past invoices or quotations that previously included this item will retain their snapshot data, but this item will no longer appear in your active catalog.
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-surface-50 border-t border-surface-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
