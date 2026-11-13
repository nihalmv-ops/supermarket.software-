import api from './api';
import { ProductCategory, ProductCategoryFormData } from '../types/product.types';

export const productCategoryService = {
  /**
   * Get all categories for active business
   */
  async getCategories(status?: 'active' | 'inactive'): Promise<ProductCategory[]> {
    const params = status ? { status } : undefined;
    const response = await api.get<{ success: boolean; data: ProductCategory[] }>(
      '/product-categories',
      { params }
    );
    return response.data.data;
  },

  /**
   * Create a new category
   */
  async createCategory(payload: ProductCategoryFormData): Promise<ProductCategory> {
    const response = await api.post<{ success: boolean; data: ProductCategory }>(
      '/product-categories',
      payload
    );
    return response.data.data;
  },

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    payload: Partial<ProductCategoryFormData>
  ): Promise<ProductCategory> {
    const response = await api.put<{ success: boolean; data: ProductCategory }>(
      `/product-categories/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Delete category safely
   */
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/product-categories/${id}`);
  },
};
