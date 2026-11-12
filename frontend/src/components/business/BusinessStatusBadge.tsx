import React from 'react';
import { BusinessStatus } from '../../types/business.types';

interface BusinessStatusBadgeProps {
  status: BusinessStatus;
  size?: 'sm' | 'md';
}

export const BusinessStatusBadge: React.FC<BusinessStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'suspended':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      case 'inactive':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
    }
  };

  const getDotStyle = () => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'suspended':
        return 'bg-rose-500';
      case 'inactive':
      default:
        return 'bg-amber-500';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ring-1 capitalize ${getBadgeStyle()} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      {status}
    </span>
  );
};
