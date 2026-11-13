import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  Package,
  Wrench,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, ProductPaginationMeta } from '../../types/product.types';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductTypeBadge } from './ProductTypeBadge';
import { StockStatusBadge } from './StockStatusBadge';

interface ProductTableProps {
  products: Product[];
  pagination: ProductPaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onStatusToggle: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
  onAdjustStockClick: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  pagination,
  isLoading,
  onPageChange,
  onStatusToggle,
  onDeleteClick,
  onAdjustStockClick,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-3 border-brand-600/30 border-t-brand-600 rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-surface-500">Loading catalog items...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center text-surface-400">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-surface-900">No items found</h3>
        <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
          No products or services match your current search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200 text-surface-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12">Item</th>
              <th className="py-3 px-4 min-w-[180px]">Name & SKU</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Selling Price</th>
              <th className="py-3 px-4 text-center">GST Rate</th>
              <th className="py-3 px-4 text-center">Stock</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {products.map((item) => {
              const categoryName =
                typeof item.categoryId === 'object' && item.categoryId !== null
                  ? item.categoryId.name
                  : '-';

              return (
                <tr
                  key={item._id}
                  className="hover:bg-surface-50/70 transition-colors group"
                >
                  {/* Thumbnail / Icon */}
                  <td className="py-3 px-4">
                    <div className="w-9 h-9 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : item.itemType === 'service' ? (
                        <Wrench className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Package className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </td>

                  {/* Name, SKU & HSN */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/products/${item._id}`)}
                      className="font-bold text-surface-900 hover:text-brand-600 text-left line-clamp-1 transition-colors text-sm"
                    >
                      {item.name}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-surface-400">
                      {item.sku && <span>SKU: {item.sku}</span>}
                      {item.sku && item.hsnSacCode && <span>•</span>}
                      {item.hsnSacCode && <span>HSN/SAC: {item.hsnSacCode}</span>}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded bg-surface-100 text-surface-700 font-medium text-[11px]">
                      {categoryName}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4">
                    <ProductTypeBadge type={item.itemType} />
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-surface-900 text-sm">
                      ₹{item.sellingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-surface-400 capitalize">
                      {item.taxType} tax / {item.unit}
                    </span>
                  </td>

                  {/* GST */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-surface-700">
                      {item.gstRate}%
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4 text-center">
                    <StockStatusBadge
                      itemType={item.itemType}
                      trackInventory={item.trackInventory}
                      stockQuantity={item.stockQuantity}
                      lowStockAlert={item.lowStockAlert}
                      unit={item.unit}
                    />
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onStatusToggle(item)}
                      title={`Click to ${item.isActive ? 'deactivate' : 'activate'}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <ProductStatusBadge isActive={item.isActive} />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {item.itemType === 'product' && item.trackInventory && (
                        <button
                          onClick={() => onAdjustStockClick(item)}
                          title="Adjust stock quantity"
                          className="p-1.5 rounded-lg text-surface-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/products/${item._id}`)}
                        title="View details"
                        className="p-1.5 rounded-lg text-surface-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/products/${item._id}/edit`)}
                        title="Edit item"
                        className="p-1.5 rounded-lg text-surface-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteClick(item)}
                        title="Delete item"
                        className="p-1.5 rounded-lg text-surface-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-50 border-t border-surface-200 text-xs text-surface-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-surface-800">
            {Math.min(
              (pagination.page - 1) * pagination.limit + 1,
              pagination.total
            )}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-surface-800">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-surface-800">
            {pagination.total}
          </span>{' '}
          items
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-1.5 rounded-lg border border-surface-200 bg-white text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-surface-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="p-1.5 rounded-lg border border-surface-200 bg-white text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
