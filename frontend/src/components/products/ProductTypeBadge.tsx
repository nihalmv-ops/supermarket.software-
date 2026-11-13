import React from 'react';
import { Package, Wrench } from 'lucide-react';
import { ProductItemType } from '../../types/product.types';

interface ProductTypeBadgeProps {
  type: ProductItemType;
  className?: string;
}

export const ProductTypeBadge: React.FC<ProductTypeBadgeProps> = ({
  type,
  className = '',
}) => {
  if (type === 'service') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}
      >
        <Wrench className="w-3 h-3 text-purple-600" />
        <span>Service</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
    >
      <Package className="w-3 h-3 text-blue-600" />
      <span>Product</span>
    </span>
  );
};
