import api from './api';
import {
  Product,
  ProductFormData,
  ProductQueryParams,
  ProductListResponse,
  ProductMetrics,
  StockAdjustmentData,
  ProductImportResult,
} from '../types/product.types';

export const productService = {
  /**
   * Get paginated products and services with query filters
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductListResponse> {
    const response = await api.get<{ success: boolean; data: ProductListResponse }>(
      '/products',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get single product or service by ID
   */
  async getProductById(id: string): Promise<Product> {
    const response = await api.get<{ success: boolean; data: Product }>(
      `/products/${id}`
    );
    return response.data.data;
  },

  /**
   * Create a new product or service
   */
  async createProduct(payload: ProductFormData): Promise<Product> {
    const response = await api.post<{ success: boolean; data: Product }>(
      '/products',
      payload
    );
    return response.data.data;
  },

  /**
   * Update an existing product or service
   */
  async updateProduct(id: string, payload: Partial<ProductFormData>): Promise<Product> {
    const response = await api.put<{ success: boolean; data: Product }>(
      `/products/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Delete a product or service
   */
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  /**
   * Toggle product active status
   */
  async toggleStatus(id: string, isActive: boolean): Promise<Product> {
    const response = await api.patch<{ success: boolean; data: Product }>(
      `/products/${id}/status`,
      { isActive }
    );
    return response.data.data;
  },

  /**
   * Adjust stock quantity safely
   */
  async adjustStock(
    id: string,
    data: StockAdjustmentData
  ): Promise<{ product: Product; adjustment: unknown }> {
    const response = await api.post<{
      success: boolean;
      data: { product: Product; adjustment: unknown };
    }>(`/products/${id}/adjust-stock`, data);
    return response.data.data;
  },

  /**
   * Get metrics summary
   */
  async getMetrics(): Promise<ProductMetrics> {
    const response = await api.get<{ success: boolean; data: ProductMetrics }>(
      '/products/metrics/summary'
    );
    return response.data.data;
  },

  /**
   * Export all products to CSV and trigger browser download
   */
  async exportCsv(): Promise<void> {
    const response = await api.get('/products/export/csv', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products-catalog-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Download CSV import template
   */
  async downloadTemplate(): Promise<void> {
    const response = await api.get('/products/template/csv', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products-import-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Bulk import products from parsed CSV records
   */
  async importCsv(rows: Record<string, unknown>[]): Promise<ProductImportResult> {
    const response = await api.post<{
      success: boolean;
      data: ProductImportResult;
    }>('/products/import/csv', { rows });
    return response.data.data;
  },
};
