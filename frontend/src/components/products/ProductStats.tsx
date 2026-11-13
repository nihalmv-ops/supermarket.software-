import React from 'react';
import { Package, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ProductMetrics } from '../../types/product.types';

interface ProductStatsProps {
  metrics: ProductMetrics | null;
  isLoading: boolean;
  onLowStockClick?: () => void;
}

export const ProductStats: React.FC<ProductStatsProps> = ({
  metrics,
  isLoading,
  onLowStockClick,
}) => {
  const cards = [
    {
      label: 'Total Products',
      value: metrics?.totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      subtext: 'Tangible inventory goods',
    },
    {
      label: 'Total Services',
      value: metrics?.totalServices ?? 0,
      icon: Wrench,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      subtext: 'Billable services & labor',
    },
    {
      label: 'Active Items',
      value: metrics?.activeItems ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      subtext: 'Available on catalog',
    },
    {
      label: 'Low-Stock Alerts',
      value: metrics?.lowStockItems ?? 0,
      icon: AlertTriangle,
      color: metrics && metrics.lowStockItems > 0 ? 'text-amber-600' : 'text-surface-500',
      bgColor: metrics && metrics.lowStockItems > 0 ? 'bg-amber-50' : 'bg-surface-50',
      borderColor: metrics && metrics.lowStockItems > 0 ? 'border-amber-200' : 'border-surface-200',
      subtext: 'Below alert threshold',
      isClickable: true,
      onClick: onLowStockClick,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            onClick={c.onClick}
            className={`bg-white rounded-xl border p-4.5 shadow-sm transition-all ${
              c.borderColor
            } ${c.isClickable ? 'cursor-pointer hover:shadow-md hover:border-amber-300' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  {c.label}
                </p>
                <h4 className="text-2xl font-bold text-surface-900 mt-1">
                  {isLoading ? (
                    <span className="inline-block w-12 h-6 bg-surface-100 animate-pulse rounded" />
                  ) : (
                    c.value.toLocaleString('en-IN')
                  )}
                </h4>
              </div>
              <div
                className={`w-11 h-11 rounded-xl ${c.bgColor} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
            <p className="text-xs text-surface-400 mt-2">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
