import React from 'react';
import { Search, X, Filter, AlertTriangle } from 'lucide-react';
import { ProductCategory, ProductItemType } from '../../types/product.types';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  itemType: ProductItemType | 'all';
  onItemTypeChange: (value: ProductItemType | 'all') => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  status: 'active' | 'inactive' | 'all';
  onStatusChange: (value: 'active' | 'inactive' | 'all') => void;
  lowStockOnly: boolean;
  onLowStockChange: (value: boolean) => void;
  sortBy: 'name' | 'sellingPrice' | 'stockQuantity' | 'createdAt';
  onSortByChange: (value: 'name' | 'sellingPrice' | 'stockQuantity' | 'createdAt') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  categories: ProductCategory[];
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  onSearchChange,
  itemType,
  onItemTypeChange,
  categoryId,
  onCategoryChange,
  status,
  onStatusChange,
  lowStockOnly,
  onLowStockChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  categories,
  onReset,
}) => {
  const hasActiveFilters =
    search.trim() !== '' ||
    itemType !== 'all' ||
    categoryId !== '' ||
    status !== 'all' ||
    lowStockOnly ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  return (
    <div className="bg-white border border-surface-200 rounded-xl p-4 mb-6 shadow-sm space-y-3">
      {/* Search and Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, SKU, or HSN/SAC..."
            className="w-full pl-9 pr-9 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-surface-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Item Type */}
        <div className="md:col-span-2">
          <select
            value={itemType}
            onChange={(e) => onItemTypeChange(e.target.value as ProductItemType | 'all')}
            className="w-full py-2 px-3 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="product">Products Only</option>
            <option value="service">Services Only</option>
          </select>
        </div>

        {/* Category */}
        <div className="md:col-span-3">
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.productCount ? `(${c.productCount})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as 'active' | 'inactive' | 'all')
            }
            className="w-full py-2 px-3 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Secondary Controls: Sorting, Low-stock toggle & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-100 text-xs">
        <div className="flex items-center space-x-4">
          {/* Low Stock Checkbox */}
          <label className="flex items-center space-x-2 cursor-pointer font-medium text-surface-700 select-none">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => onLowStockChange(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-surface-300"
            />
            <span className="flex items-center gap-1 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Low Stock Only
            </span>
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-surface-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Sort by:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as 'name' | 'sellingPrice' | 'stockQuantity' | 'createdAt'
              )
            }
            className="py-1 px-2.5 text-xs border border-surface-200 rounded-md bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Item Name</option>
            <option value="sellingPrice">Selling Price</option>
            <option value="stockQuantity">Stock Level</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
            className="py-1 px-2.5 text-xs border border-surface-200 rounded-md bg-white focus:outline-none focus:border-brand-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-2 py-1 rounded hover:bg-brand-50 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
