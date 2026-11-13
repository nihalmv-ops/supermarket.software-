import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Upload,
  Download,
  Layers,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { productCategoryService } from '../../services/productCategoryService';
import {
  Product,
  ProductCategory,
  ProductMetrics,
  ProductPaginationMeta,
  ProductItemType,
  StockAdjustmentData,
} from '../../types/product.types';
import { ProductStats } from '../../components/products/ProductStats';
import { ProductFilters } from '../../components/products/ProductFilters';
import { ProductTable } from '../../components/products/ProductTable';
import { DeleteProductDialog } from '../../components/products/DeleteProductDialog';
import { StockAdjustmentModal } from '../../components/products/StockAdjustmentModal';
import { CsvImportProductsModal } from '../../components/products/CsvImportProductsModal';

export const ProductsList: React.FC = () => {
  const navigate = useNavigate();

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [pagination, setPagination] = useState<ProductPaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Query & Filter states
  const [search, setSearch] = useState<string>('');
  const [itemType, setItemType] = useState<ProductItemType | 'all'>('all');
  const [categoryId, setCategoryId] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'name' | 'sellingPrice' | 'stockQuantity' | 'createdAt'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Loading & UI states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  // Modals
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [selectedProductForStock, setSelectedProductForStock] =
    useState<Product | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const data = await productService.getMetrics();
      setMetrics(data);
    } catch {
      // Non-blocking for list
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const cats = await productCategoryService.getCategories();
      setCategories(cats);
    } catch {
      // Non-blocking
    }
  }, []);

  // Fetch product list
  const fetchProducts = useCallback(
    async (targetPage = 1) => {
      try {
        setIsLoading(true);
        setError('');

        const result = await productService.getProducts({
          page: targetPage,
          limit: 10,
          search: search.trim() || undefined,
          itemType: itemType !== 'all' ? itemType : undefined,
          categoryId: categoryId || undefined,
          status: status !== 'all' ? status : undefined,
          lowStockOnly: lowStockOnly || undefined,
          sortBy,
          sortOrder,
        });

        setProducts(result.products);
        setPagination(result.pagination);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load items';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [search, itemType, categoryId, status, lowStockOnly, sortBy, sortOrder]
  );

  useEffect(() => {
    fetchMetrics();
    fetchCategories();
  }, [fetchMetrics, fetchCategories]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Handle Status Toggle
  const handleStatusToggle = async (item: Product) => {
    try {
      const updated = await productService.toggleStatus(item._id, !item.isActive);
      setProducts((prev) =>
        prev.map((p) => (p._id === item._id ? updated : p))
      );
      setNotification(
        `"${item.name}" marked as ${updated.isActive ? 'Active' : 'Inactive'}`
      );
      fetchMetrics();
      setTimeout(() => setNotification(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setError(msg);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!selectedProductForDelete) return;

    try {
      setIsDeleting(true);
      await productService.deleteProduct(selectedProductForDelete._id);
      setSelectedProductForDelete(null);
      setNotification(`"${selectedProductForDelete.name}" deleted successfully.`);
      fetchProducts(pagination.page);
      fetchMetrics();
      fetchCategories();
      setTimeout(() => setNotification(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Stock Adjustment
  const handleAdjustStockSubmit = async (data: StockAdjustmentData) => {
    if (!selectedProductForStock) return;
    const res = await productService.adjustStock(
      selectedProductForStock._id,
      data
    );
    setProducts((prev) =>
      prev.map((p) => (p._id === selectedProductForStock._id ? res.product : p))
    );
    setNotification(
      `Stock for "${selectedProductForStock.name}" adjusted to ${res.product.stockQuantity} ${res.product.unit}`
    );
    fetchMetrics();
    setTimeout(() => setNotification(''), 4000);
  };

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await productService.exportCsv();
      setNotification('CSV export downloaded successfully.');
      setTimeout(() => setNotification(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to export CSV';
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setItemType('all');
    setCategoryId('');
    setStatus('all');
    setLowStockOnly(false);
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">
            Products & Services
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Manage your goods, service offerings, inventory thresholds and tax slabs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Categories Manager Button */}
          <button
            onClick={() => navigate('/products/categories')}
            className="px-3.5 py-2 text-xs font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Layers className="w-4 h-4 text-surface-500" />
            <span>Categories</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 text-xs font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-surface-500" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>

          {/* Import CSV Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4 text-surface-500" />
            <span>Import</span>
          </button>

          {/* Add Item Button */}
          <button
            onClick={() => navigate('/products/new')}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
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

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <ProductStats
        metrics={metrics}
        isLoading={isStatsLoading}
        onLowStockClick={() => {
          setLowStockOnly(true);
        }}
      />

      {/* Filter and Search Bar */}
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        itemType={itemType}
        onItemTypeChange={setItemType}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        status={status}
        onStatusChange={setStatus}
        lowStockOnly={lowStockOnly}
        onLowStockChange={setLowStockOnly}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Products & Services Table */}
      <ProductTable
        products={products}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={(p) => fetchProducts(p)}
        onStatusToggle={handleStatusToggle}
        onDeleteClick={(p) => setSelectedProductForDelete(p)}
        onAdjustStockClick={(p) => setSelectedProductForStock(p)}
      />

      {/* Modals */}
      <DeleteProductDialog
        product={selectedProductForDelete}
        isOpen={Boolean(selectedProductForDelete)}
        onClose={() => setSelectedProductForDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {selectedProductForStock && (
        <StockAdjustmentModal
          product={selectedProductForStock}
          isOpen={Boolean(selectedProductForStock)}
          onClose={() => setSelectedProductForStock(null)}
          onSubmit={handleAdjustStockSubmit}
        />
      )}

      <CsvImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchProducts(1);
          fetchMetrics();
          fetchCategories();
        }}
      />
    </div>
  );
};
