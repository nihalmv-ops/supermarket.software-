import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Sliders,
  Package,
  Wrench,
  Layers,
  IndianRupee,
  AlertCircle,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { Product, StockAdjustmentData } from '../../types/product.types';
import { ProductStatusBadge } from '../../components/products/ProductStatusBadge';
import { ProductTypeBadge } from '../../components/products/ProductTypeBadge';
import { StockStatusBadge } from '../../components/products/StockStatusBadge';
import { StockAdjustmentModal } from '../../components/products/StockAdjustmentModal';
import { DeleteProductDialog } from '../../components/products/DeleteProductDialog';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError('');
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load item';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAdjustStock = async (adjData: StockAdjustmentData) => {
    if (!id) return;
    const res = await productService.adjustStock(id, adjData);
    setProduct(res.product);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await productService.deleteProduct(id);
      navigate('/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border border-surface-200">
        <div className="inline-block w-8 h-8 border-3 border-brand-600/30 border-t-brand-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-surface-500">Loading item profile...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-surface-900">Item Not Found</h3>
        <p className="text-xs text-surface-500 mt-1 mb-4">{error || 'Unable to locate this item.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  // Calculate pricing breakdown
  const gstRate = product.gstRate || 0;
  let basePrice = product.sellingPrice;
  let gstAmount = 0;
  let finalPrice = product.sellingPrice;

  if (product.taxType === 'inclusive') {
    finalPrice = product.sellingPrice;
    basePrice = gstRate > 0 ? product.sellingPrice / (1 + gstRate / 100) : product.sellingPrice;
    gstAmount = finalPrice - basePrice;
  } else {
    basePrice = product.sellingPrice;
    gstAmount = (basePrice * gstRate) / 100;
    finalPrice = basePrice + gstAmount;
  }

  // Estimated Margin
  const purchaseCost = product.purchasePrice || 0;
  const estimatedProfit = basePrice - purchaseCost;
  const marginPercent =
    basePrice > 0 && purchaseCost > 0
      ? ((estimatedProfit / basePrice) * 100).toFixed(1)
      : null;

  const categoryName =
    typeof product.categoryId === 'object' && product.categoryId !== null
      ? product.categoryId.name
      : 'Uncategorized';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">
                {product.name}
              </h1>
              <ProductStatusBadge isActive={product.isActive} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Item Profile & Pricing Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {product.itemType === 'product' && product.trackInventory && (
            <button
              onClick={() => setIsStockModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Adjust Stock</span>
            </button>
          )}

          <button
            onClick={() => navigate(`/products/${product._id}/edit`)}
            className="px-3.5 py-2 text-xs font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Edit className="w-4 h-4 text-blue-500" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-surface-100">
          <div className="w-20 h-20 rounded-2xl bg-surface-100 border border-surface-200 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : product.itemType === 'service' ? (
              <Wrench className="w-10 h-10 text-purple-600" />
            ) : (
              <Package className="w-10 h-10 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <ProductTypeBadge type={product.itemType} />
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-surface-100 text-surface-700 font-medium">
                <Layers className="w-3 h-3 text-surface-400" />
                <span>{categoryName}</span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-surface-900 truncate">
              {product.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-surface-500">
              {product.sku && (
                <span className="font-mono bg-surface-50 px-2 py-0.5 rounded border border-surface-200">
                  SKU: {product.sku}
                </span>
              )}
              {product.hsnSacCode && (
                <span>
                  {product.itemType === 'service' ? 'SAC' : 'HSN'}:{' '}
                  <span className="font-semibold text-surface-700">
                    {product.hsnSacCode}
                  </span>
                </span>
              )}
              <span>
                Unit: <span className="font-semibold text-surface-700">{product.unit}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="pt-4 text-xs text-surface-600 leading-relaxed">
            <p className="font-semibold text-surface-400 uppercase tracking-wider text-[10px] mb-1">
              Description
            </p>
            <p className="whitespace-pre-line">{product.description}</p>
          </div>
        )}
      </div>

      {/* Pricing & GST Tax Breakdown */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Pricing & Tax Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              Base Price (Excl. GST)
            </p>
            <p className="text-2xl font-bold text-surface-900 mt-1">
              ₹{basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-surface-500 mt-0.5">per {product.unit}</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
              GST ({gstRate}%)
            </p>
            <p className="text-2xl font-bold text-surface-900 mt-1">
              ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-surface-500 mt-0.5 capitalize">
              Tax {product.taxType} configured
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-200">
            <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">
              Total Customer Price
            </p>
            <p className="text-2xl font-bold text-brand-700 mt-1">
              ₹{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-brand-600 mt-0.5">Final invoiced rate</p>
          </div>
        </div>

        {purchaseCost > 0 && (
          <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-surface-500">Purchase / Acquisition Cost: </span>
              <span className="font-semibold text-surface-800">
                ₹{purchaseCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {marginPercent && (
              <div>
                <span className="text-surface-500">Gross Margin: </span>
                <span className="font-bold text-emerald-600">
                  {marginPercent}% (₹{estimatedProfit.toFixed(2)})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inventory Status (If product and tracked) */}
      {product.itemType === 'product' && (
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Inventory & Stock Status</span>
            </h3>

            {product.trackInventory && (
              <button
                onClick={() => setIsStockModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Stock</span>
              </button>
            )}
          </div>

          {product.trackInventory ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                  Available Quantity
                </p>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {product.stockQuantity}{' '}
                  <span className="text-xs font-normal text-surface-500">{product.unit}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">
                  Low Stock Threshold
                </p>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {product.lowStockAlert}{' '}
                  <span className="text-xs font-normal text-surface-500">{product.unit}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex flex-col justify-center">
                <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Inventory State
                </p>
                <div>
                  <StockStatusBadge
                    itemType="product"
                    trackInventory={true}
                    stockQuantity={product.stockQuantity}
                    lowStockAlert={product.lowStockAlert}
                    unit={product.unit}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-500 flex items-center space-x-2">
              <Info className="w-4 h-4 text-surface-400 shrink-0" />
              <span>
                Inventory tracking is currently disabled for this product. You can enable it anytime by editing the item.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Invoice Snapshot Note */}
      <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 flex items-start space-x-3 text-xs text-brand-900">
        <FileSpreadsheet className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Invoice & Quotation Compatibility</p>
          <p className="text-brand-800/80 mt-0.5 leading-relaxed">
            When this item is added to an invoice or quotation, its name, description, SKU, unit rate, and GST slab are captured as an immutable line item snapshot. Any future price updates made here will never alter historic invoices or finalized quotes.
          </p>
        </div>
      </div>

      {/* Modals */}
      {isStockModalOpen && (
        <StockAdjustmentModal
          product={product}
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSubmit={handleAdjustStock}
        />
      )}

      <DeleteProductDialog
        product={product}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
