import React from 'react';

interface CustomerStatusBadgeProps {
  isActive: boolean;
  size?: 'sm' | 'md';
}

export const CustomerStatusBadge: React.FC<CustomerStatusBadgeProps> = ({
  isActive,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (isActive) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-500/20 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ring-1 ring-slate-400/20 ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
};
