import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Wrench,
  Layers,
  Percent,
  IndianRupee,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  Product,
  ProductFormData,
  ProductCategory,
  ProductItemType,
  TaxType,
} from '../../types/product.types';

interface ProductFormProps {
  initialData?: Product;
  categories: ProductCategory[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  onOpenCategoryModal?: () => void;
}

const COMMON_GST_RATES = [0, 5, 12, 18, 28];
const STANDARD_UNITS = [
  'pcs',
  'box',
  'packet',
  'kg',
  'g',
  'litre',
  'ml',
  'meter',
  'sq.ft',
  'hour',
  'day',
  'month',
  'service',
  'visit',
];

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  onSubmit,
  isSubmitting,
  onOpenCategoryModal,
}) => {
  const navigate = useNavigate();

  const [itemType, setItemType] = useState<ProductItemType>(
    initialData?.itemType || 'product'
  );
  const [name, setName] = useState<string>(initialData?.name || '');
  const [sku, setSku] = useState<string>(initialData?.sku || '');
  const [description, setDescription] = useState<string>(
    initialData?.description || ''
  );
  const [categoryId, setCategoryId] = useState<string>(
    typeof initialData?.categoryId === 'object' && initialData?.categoryId !== null
      ? initialData.categoryId._id
      : (initialData?.categoryId as string) || ''
  );
  const [unit, setUnit] = useState<string>(initialData?.unit || 'pcs');
  const [customUnit, setCustomUnit] = useState<string>('');

  const [sellingPrice, setSellingPrice] = useState<number | ''>(
    initialData?.sellingPrice ?? ''
  );
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(
    initialData?.purchasePrice ?? 0
  );
  const [gstRate, setGstRate] = useState<number>(initialData?.gstRate ?? 18);
  const [customGst, setCustomGst] = useState<string>('');
  const [isCustomGst, setIsCustomGst] = useState<boolean>(
    initialData ? !COMMON_GST_RATES.includes(initialData.gstRate) : false
  );
  const [taxType, setTaxType] = useState<TaxType>(
    initialData?.taxType || 'exclusive'
  );

  const [hsnSacCode, setHsnSacCode] = useState<string>(
    initialData?.hsnSacCode || ''
  );
  const [image, setImage] = useState<string>(initialData?.image || '');
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive ?? true
  );

  // Inventory tracking (only applicable for products)
  const [trackInventory, setTrackInventory] = useState<boolean>(
    initialData?.trackInventory || false
  );
  const [stockQuantity, setStockQuantity] = useState<number | ''>(
    initialData?.stockQuantity ?? 0
  );
  const [lowStockAlert, setLowStockAlert] = useState<number | ''>(
    initialData?.lowStockAlert ?? 5
  );

  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle ItemType toggle
  const handleTypeChange = (newType: ProductItemType) => {
    setItemType(newType);
    if (newType === 'service') {
      setTrackInventory(false);
      if (unit === 'pcs') setUnit('service');
    } else {
      if (unit === 'service') setUnit('pcs');
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Item name is required.');
      return;
    }

    if (sellingPrice === '' || sellingPrice < 0) {
      setErrorMessage('Selling price must be 0 or greater.');
      return;
    }

    const effectiveGstRate = isCustomGst ? Number(customGst) : gstRate;
    if (isNaN(effectiveGstRate) || effectiveGstRate < 0 || effectiveGstRate > 100) {
      setErrorMessage('GST rate must be between 0% and 100%.');
      return;
    }

    const effectiveUnit = unit === 'custom' ? customUnit.trim() : unit;
    if (!effectiveUnit) {
      setErrorMessage('Please specify a unit of measurement.');
      return;
    }

    const payload: ProductFormData = {
      itemType,
      name: name.trim(),
      sku: sku.trim() || undefined,
      description: description.trim() || undefined,
      categoryId: categoryId || null,
      hsnSacCode: hsnSacCode.trim() || undefined,
      unit: effectiveUnit,
      sellingPrice: Number(sellingPrice),
      purchasePrice: purchasePrice === '' ? 0 : Number(purchasePrice),
      gstRate: effectiveGstRate,
      taxType,
      image: image.trim() || undefined,
      isActive,
      trackInventory: itemType === 'service' ? false : trackInventory,
      stockQuantity:
        itemType === 'product' && trackInventory
          ? typeof stockQuantity === 'number'
            ? stockQuantity
            : 0
          : 0,
      lowStockAlert:
        itemType === 'product' && trackInventory
          ? typeof lowStockAlert === 'number'
            ? lowStockAlert
            : 5
          : 5,
    };

    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product.';
      setErrorMessage(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Item Classification (Product vs Service) */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <span>Item Classification</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeChange('product')}
            className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
              itemType === 'product'
                ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                : 'border-surface-200 hover:bg-surface-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                itemType === 'product'
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-100 text-surface-600'
              }`}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-surface-900 text-sm">Physical Product</p>
              <p className="text-xs text-surface-500 mt-0.5">
                Tangible items, goods, raw materials, or retail items. Supports optional inventory tracking.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('service')}
            className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
              itemType === 'service'
                ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20'
                : 'border-surface-200 hover:bg-surface-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                itemType === 'service'
                  ? 'bg-purple-600 text-white'
                  : 'bg-surface-100 text-surface-600'
              }`}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-surface-900 text-sm">Service or Labor</p>
              <p className="text-xs text-surface-500 mt-0.5">
                Consulting, repairs, design, labor, software services, or catering packages. No inventory needed.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Basic Information */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              {itemType === 'service' ? 'Service Name' : 'Product Name'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                itemType === 'service'
                  ? 'e.g. Website Development Consulting, AC Repair'
                  : 'e.g. Basmati Rice 5kg, Wireless Ergonomic Mouse'
              }
              required
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* SKU / Code */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5 flex items-center justify-between">
              <span>SKU / Item Code</span>
              <span className="text-[11px] text-surface-400 font-normal">Unique per business</span>
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. PRD-001, SRV-DES-01"
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-xs uppercase"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-surface-700">Category</label>
              {onOpenCategoryModal && (
                <button
                  type="button"
                  onClick={onOpenCategoryModal}
                  className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Category</span>
                </button>
              )}
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
            >
              <option value="">-- No Category --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Unit of Measurement <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
              >
                {STANDARD_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="custom">+ Custom Unit...</option>
              </select>
            </div>
            {unit === 'custom' && (
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Enter custom unit (e.g. drum, dozen)"
                className="mt-2 w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            )}
          </div>

          {/* HSN / SAC Code */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5 flex items-center justify-between">
              <span>{itemType === 'service' ? 'SAC Code' : 'HSN Code'}</span>
              <span className="text-[11px] text-surface-400 font-normal">GST compliance</span>
            </label>
            <input
              type="text"
              value={hsnSacCode}
              onChange={(e) => setHsnSacCode(e.target.value)}
              placeholder={itemType === 'service' ? 'e.g. 998314' : 'e.g. 1006, 8517'}
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detailed description, specifications, or terms..."
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/product-image.jpg"
              className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Pricing & Tax Structure */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Pricing & Taxes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selling Price */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Selling Price (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) =>
                  setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0.00"
                required
                className="w-full pl-8 pr-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
              />
            </div>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Purchase Cost (₹) (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={purchasePrice}
                onChange={(e) =>
                  setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="0.00"
                className="w-full pl-8 pr-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* GST Rate Preset Buttons */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-surface-700 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-surface-400" />
              <span>GST Tax Slab (%)</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {COMMON_GST_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setGstRate(rate);
                    setIsCustomGst(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    !isCustomGst && gstRate === rate
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'border-surface-200 text-surface-700 hover:bg-surface-50'
                  }`}
                >
                  {rate}%
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomGst(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  isCustomGst
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'border-surface-200 text-surface-700 hover:bg-surface-50'
                }`}
              >
                Custom %
              </button>
            </div>

            {isCustomGst && (
              <div className="mt-2 max-w-xs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={customGst}
                  onChange={(e) => setCustomGst(e.target.value)}
                  placeholder="Enter custom GST % (e.g. 1.5, 3)"
                  className="w-full px-3 py-1.5 text-xs border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            )}
          </div>

          {/* Tax Inclusive / Exclusive Toggle */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">
              Tax Type
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <label
                className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                  taxType === 'exclusive'
                    ? 'border-brand-500 bg-brand-50/30'
                    : 'border-surface-200 hover:bg-surface-50'
                }`}
              >
                <input
                  type="radio"
                  name="taxType"
                  value="exclusive"
                  checked={taxType === 'exclusive'}
                  onChange={() => setTaxType('exclusive')}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-xs font-bold text-surface-900">Tax Exclusive</p>
                  <p className="text-[10px] text-surface-500">GST added on top of price</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                  taxType === 'inclusive'
                    ? 'border-brand-500 bg-brand-50/30'
                    : 'border-surface-200 hover:bg-surface-50'
                }`}
              >
                <input
                  type="radio"
                  name="taxType"
                  value="inclusive"
                  checked={taxType === 'inclusive'}
                  onChange={() => setTaxType('inclusive')}
                  className="text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-xs font-bold text-surface-900">Tax Inclusive</p>
                  <p className="text-[10px] text-surface-500">Price already includes GST</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Optional Inventory Management (Products only) */}
      {itemType === 'product' && (
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">
                Inventory Tracking
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">
                Keep track of quantities on hand and receive low-stock alerts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          {trackInventory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-surface-100">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Opening Stock Quantity ({unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={stockQuantity}
                  onChange={(e) =>
                    setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="0"
                  disabled={Boolean(initialData)} // Existing products adjust stock via adjust stock modal
                  className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-surface-50 disabled:text-surface-400"
                />
                {initialData && (
                  <p className="text-[11px] text-surface-400 mt-1">
                    To adjust stock for existing products, use the Stock Adjustment action.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  Low-Stock Warning Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={lowStockAlert}
                  onChange={(e) =>
                    setLowStockAlert(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="5"
                  className="w-full px-3.5 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <p className="text-[11px] text-surface-400 mt-1">
                  Triggers dashboard alert when quantity falls at or below this value.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Item Status */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-surface-900 text-sm">Active Catalog Status</h4>
          <p className="text-xs text-surface-500">
            Inactive items are hidden from new invoices and quotations.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/products')}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{initialData ? 'Update Item' : 'Create Item'}</span>
          )}
        </button>
      </div>
    </form>
  );
};
