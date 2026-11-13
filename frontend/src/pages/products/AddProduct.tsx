import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { productCategoryService } from '../../services/productCategoryService';
import { ProductForm } from '../../components/products/ProductForm';
import {
  ProductFormData,
  ProductCategory,
  ProductCategoryFormData,
} from '../../types/product.types';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Category creation modal
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');
  const [catError, setCatError] = useState<string>('');
  const [isCatSubmitting, setIsCatSubmitting] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      const data = await productCategoryService.getCategories();
      setCategories(data);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      await productService.createProduct(data);
      navigate('/products');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Category name is required.');
      return;
    }

    try {
      setIsCatSubmitting(true);
      setCatError('');
      const payload: ProductCategoryFormData = {
        name: catName.trim(),
        description: catDesc.trim() || undefined,
      };
      const created = await productCategoryService.createCategory(payload);
      setCategories((prev) => [...prev, created]);
      setIsCatModalOpen(false);
      setCatName('');
      setCatDesc('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category';
      setCatError(msg);
    } finally {
      setIsCatSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/products')}
          className="p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">
            Add New Item
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Configure product or service attributes, pricing, tax rates, and inventory thresholds
          </p>
        </div>
      </div>

      {/* Main Form */}
      <ProductForm
        categories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        onOpenCategoryModal={() => setIsCatModalOpen(true)}
      />

      {/* Quick Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-surface-50">
              <h3 className="font-bold text-surface-900 text-base">Quick Add Category</h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCategory} className="p-6 space-y-4">
              {catError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {catError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Beverages, Electronics, Design"
                  required
                  className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                  placeholder="Brief description..."
                  className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  disabled={isCatSubmitting}
                  className="px-4 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCatSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isCatSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
