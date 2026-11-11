import { StatusConfig, InvoiceStatus } from '../types';

/**
 * Format number into currency string
 * Default ₹ (INR) with flexibility for USD/EUR etc.
 */
export const formatCurrency = (amount: number | string, currency: string = 'INR'): string => {
  const numericAmount = Number(amount) || 0;
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Format ISO or Date string into readable format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Returns Tailwind color classes based on payment/document status
 */
export const getStatusConfig = (status?: string | InvoiceStatus): StatusConfig => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'paid':
    case 'accepted':
    case 'active':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Paid',
      };
    case 'pending':
    case 'sent':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending',
      };
    case 'unpaid':
    case 'overdue':
    case 'rejected':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Unpaid',
      };
    case 'draft':
    default:
      return {
        bg: 'bg-surface-100 text-surface-600 border-surface-200',
        dot: 'bg-surface-400',
        label: status || 'Draft',
      };
  }
};
