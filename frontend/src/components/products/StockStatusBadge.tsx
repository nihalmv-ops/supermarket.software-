import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { ProductItemType } from '../../types/product.types';

interface StockStatusBadgeProps {
  itemType: ProductItemType;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockAlert: number;
  unit?: string;
  className?: string;
}

export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({
  itemType,
  trackInventory,
  stockQuantity,
  lowStockAlert,
  unit = 'pcs',
  className = '',
}) => {
  if (itemType === 'service' || !trackInventory) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-surface-500 bg-surface-100 ${className}`}
        title="Inventory tracking not enabled"
      >
        <Minus className="w-3 h-3 text-surface-400" />
        <span>N/A</span>
      </span>
    );
  }

  if (stockQuantity <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
      >
        <XCircle className="w-3 h-3 text-rose-500" />
        <span>Out of Stock (0 {unit})</span>
      </span>
    );
  }

  if (stockQuantity <= lowStockAlert) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        <span>Low: {stockQuantity} {unit}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
    >
      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      <span>{stockQuantity} {unit}</span>
    </span>
  );
};
