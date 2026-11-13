import api, { ApiResponse } from './api';
import {
  Customer,
  CustomerFormData,
  CustomerQueryParams,
  CustomerListResponse,
  CustomerMetricsSummary,
  CustomerStatementResponse,
  CsvImportResult,
} from '../types/customer.types';

export const customerService = {
  /**
   * List customers with pagination, search, sort and filters
   */
  getCustomers: async (params?: CustomerQueryParams): Promise<CustomerListResponse> => {
    const response = await api.get<ApiResponse<CustomerListResponse>>('/customers', {
      params,
    });
    return response.data.data!;
  },

  /**
   * Get single customer by ID
   */
  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data!;
  },

  /**
   * Create a new customer
   */
  createCustomer: async (data: CustomerFormData): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>('/customers', data);
    return response.data.data!;
  },

  /**
   * Update existing customer
   */
  updateCustomer: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete customer
   */
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/customers/${id}`);
  },

  /**
   * Toggle customer active/inactive status
   */
  toggleCustomerStatus: async (id: string, isActive: boolean): Promise<Customer> => {
    const response = await api.patch<ApiResponse<Customer>>(`/customers/${id}/status`, {
      isActive,
    });
    return response.data.data!;
  },

  /**
   * Get customer financial statement / ledger
   */
  getCustomerStatement: async (
    id: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<CustomerStatementResponse> => {
    const response = await api.get<ApiResponse<CustomerStatementResponse>>(
      `/customers/${id}/statement`,
      { params }
    );
    return response.data.data!;
  },

  /**
   * Get key metrics summary for customer dashboard
   */
  getMetricsSummary: async (): Promise<CustomerMetricsSummary> => {
    const response = await api.get<ApiResponse<CustomerMetricsSummary>>(
      '/customers/metrics/summary'
    );
    return response.data.data!;
  },

  /**
   * Download CSV import template
   */
  downloadCsvTemplate: async (): Promise<void> => {
    const response = await api.get('/customers/template/csv', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Export all tenant customers to CSV
   */
  exportCustomersCsv: async (): Promise<void> => {
    const response = await api.get('/customers/export/csv', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(
      new Blob([response.data as BlobPart], { type: 'text/csv' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `customers-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Bulk import customers from parsed CSV data
   */
  importCustomersCsv: async (
    rows: Array<Record<string, unknown>>
  ): Promise<CsvImportResult> => {
    const response = await api.post<ApiResponse<CsvImportResult>>(
      '/customers/import/csv',
      { rows }
    );
    return response.data.data!;
  },
};
