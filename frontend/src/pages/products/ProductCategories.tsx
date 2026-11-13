import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Layers,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
} from 'lucide-react';
import { productCategoryService } from '../../services/productCategoryService';
import { ProductCategory, ProductCategoryFormData } from '../../types/product.types';

export const ProductCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryDesc, setCategoryDesc] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await productCategoryService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load categories';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setIsModalOpen(true);
    setError('');
  };

  const handleOpenEdit = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setIsModalOpen(true);
    setError('');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload: ProductCategoryFormData = {
        name: categoryName.trim(),
        description: categoryDesc.trim() || undefined,
      };

      if (editingCategory) {
        await productCategoryService.updateCategory(editingCategory._id, payload);
        setSuccessMessage(`Category "${payload.name}" updated successfully.`);
      } else {
        await productCategoryService.createCategory(payload);
        setSuccessMessage(`Category "${payload.name}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save category';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: ProductCategory) => {
    if (cat.productCount && cat.productCount > 0) {
      setError(
        `Cannot delete "${cat.name}" because ${cat.productCount} item(s) are assigned to it. Please reassign or delete those items first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      setDeletingId(cat._id);
      setError('');
      await productCategoryService.deleteCategory(cat._id);
      setSuccessMessage(`Category "${cat.name}" deleted successfully.`);
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">
              Product Categories
            </h1>
            <p className="text-xs text-surface-500 mt-0.5">
              Organize your goods and services into logical business categories
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Notice: </span>
            {error}
          </div>
          <button
            onClick={() => setError('')}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category List Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-surface-200">
          <div className="inline-block w-8 h-8 border-3 border-brand-600/30 border-t-brand-600 rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-surface-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-surface-900">No categories created yet</h3>
          <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto mb-4">
            Categories help you structure catalog items, filter inventory reports, and organize invoice lines.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
          >
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-surface-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-100 text-surface-700">
                    <Package className="w-3 h-3 text-surface-400" />
                    <span>{cat.productCount || 0} items</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-surface-900 mt-3">{cat.name}</h3>
                <p className="text-xs text-surface-500 mt-1 line-clamp-2 min-h-[32px]">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 mt-3 border-t border-surface-100">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-2.5 py-1.5 text-xs font-medium text-surface-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  disabled={deletingId === cat._id}
                  className="px-2.5 py-1.5 text-xs font-medium text-surface-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-surface-50">
              <h3 className="font-bold text-surface-900 text-base">
                {editingCategory ? 'Edit Category' : 'New Product Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Grocery, Electronics, Consulting"
                  required
                  className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  rows={3}
                  placeholder="Short description of items in this category..."
                  className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-surface-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/30 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Category</span>
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
