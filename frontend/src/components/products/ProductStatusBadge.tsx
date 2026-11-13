import React from 'react';

interface ProductStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  isActive,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-surface-100 text-surface-600 border border-surface-200'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-surface-400'
        }`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};
