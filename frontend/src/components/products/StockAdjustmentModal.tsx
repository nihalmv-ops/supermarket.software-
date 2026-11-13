import React, { useState } from 'react';
import { X, Layers, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Product, StockAdjustmentData } from '../../types/product.types';

interface StockAdjustmentModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockAdjustmentData) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currentStock = product.stockQuantity || 0;
  const numQty = typeof quantity === 'number' ? quantity : 0;

  let calculatedNewStock = currentStock;
  if (adjustmentType === 'add') {
    calculatedNewStock = currentStock + numQty;
  } else if (adjustmentType === 'subtract') {
    calculatedNewStock = Math.max(0, currentStock - numQty);
  } else if (adjustmentType === 'set') {
    calculatedNewStock = numQty;
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (typeof quantity !== 'number' || quantity <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    if (adjustmentType === 'subtract' && currentStock < quantity) {
      setError(`Cannot subtract ${quantity}. Current stock is only ${currentStock}.`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the adjustment (e.g., Stock intake, Damaged units, Inventory audit).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        adjustmentType,
        quantity,
        reason: reason.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust stock.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-surface-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-surface-900 text-base">Adjust Stock Level</h3>
              <p className="text-xs text-surface-500 truncate max-w-[260px]">
                {product.name} ({product.unit})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Stock Preview Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-50 rounded-xl border border-surface-200">
            <div>
              <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                Current Stock
              </p>
              <p className="text-xl font-bold text-surface-800 mt-0.5">
                {currentStock} <span className="text-xs font-normal text-surface-500">{product.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                New Calculated
              </p>
              <p
                className={`text-xl font-bold mt-0.5 ${
                  calculatedNewStock < 0
                    ? 'text-rose-600'
                    : calculatedNewStock <= product.lowStockAlert
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {calculatedNewStock}{' '}
                <span className="text-xs font-normal text-surface-500">{product.unit}</span>
              </p>
            </div>
          </div>

          {/* Adjustment Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Adjustment Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  adjustmentType === 'add'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Add Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('subtract')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  adjustmentType === 'subtract'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Subtract</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                  adjustmentType === 'set'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Set Exact</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Quantity ({product.unit}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="e.g. 25"
              required
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
            />
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Reason / Reference <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. PO #1084 intake, Monthly audit discrepancy"
              required
              maxLength={200}
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-surface-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <span>Save Adjustment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
