export interface Business {
  id: string;
  name: string;
  gstin: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
}

export type InvoiceStatus = 'paid' | 'pending' | 'unpaid' | 'draft';
export type QuotationStatus = 'Accepted' | 'Sent' | 'Draft' | 'Expired';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  status: InvoiceStatus;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  date: string;
  validUntil: string;
  amount: number;
  status: QuotationStatus;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  pending: number;
}

export interface InvoiceStatusBreakdown {
  name: string;
  value: number;
  color: string;
  amount: string;
}

export interface StatusConfig {
  bg: string;
  dot: string;
  label: string;
}

export interface ApiHealthResponse {
  success: boolean;
  message: string;
  database: 'connected' | 'connecting' | 'disconnected' | 'disconnecting';
}
