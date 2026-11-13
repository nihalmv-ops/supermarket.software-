import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { productService } from '../../services/productService';
import { productCategoryService } from '../../services/productCategoryService';
import { ProductForm } from '../../components/products/ProductForm';
import {
  Product,
  ProductFormData,
  ProductCategory,
} from '../../types/product.types';

export const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError('');
        const [prodData, catsData] = await Promise.all([
          productService.getProductById(id),
          productCategoryService.getCategories(),
        ]);
        setProduct(prodData);
        setCategories(catsData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load item';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFormSubmit = async (data: ProductFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await productService.updateProduct(id, data);
      navigate(`/products/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border border-surface-200">
        <div className="inline-block w-8 h-8 border-3 border-brand-600/30 border-t-brand-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-surface-500">Loading item details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-surface-900">Unable to load item</h3>
        <p className="text-xs text-surface-500 mt-1 mb-4">{error || 'Item not found.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(`/products/${product._id}`)}
          className="p-2 rounded-xl text-surface-500 hover:text-surface-800 hover:bg-surface-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">
            Edit {product.itemType === 'service' ? 'Service' : 'Product'}
          </h1>
          <p className="text-xs text-surface-500 mt-0.5 truncate max-w-md">
            Editing "{product.name}" {product.sku ? `(${product.sku})` : ''}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <ProductForm
        initialData={product}
        categories={categories}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
