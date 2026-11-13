export type CustomerType = 'individual' | 'business' | 'wholesale' | 'retail';

export interface Customer {
  _id: string;
  businessId: string;
  customerName: string;
  companyName?: string;
  customerType: CustomerType;
  phone: string;
  alternatePhone?: string;
  email?: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  customerName: string;
  companyName?: string;
  customerType: CustomerType;
  phone: string;
  alternatePhone?: string;
  email?: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerType?: CustomerType | 'all';
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'customerName' | 'companyName' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalAll: number;
    active: number;
    inactive: number;
  };
}

export interface CustomerMetricsSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customersWithOutstanding: number;
  recentlyAdded: Customer[];
}

export interface CustomerStatementTransaction {
  id: string;
  date: string;
  referenceNumber: string;
  type: 'invoice' | 'payment';
  amount: number;
  paidAmount: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
}

export interface CustomerStatementResponse {
  customer: Customer;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  transactions: CustomerStatementTransaction[];
  period: {
    startDate?: string | null;
    endDate?: string | null;
  };
}

export interface CsvImportResult {
  importedCount: number;
  failedCount: number;
  totalRows: number;
  errors: Array<{
    row: number;
    error: string;
    data: unknown;
  }>;
}
