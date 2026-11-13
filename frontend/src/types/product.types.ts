export type ProductItemType = 'product' | 'service';
export type TaxType = 'inclusive' | 'exclusive';

export interface ProductCategory {
  _id: string;
  businessId: string;
  name: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryFormData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface Product {
  _id: string;
  businessId: string;
  itemType: ProductItemType;
  name: string;
  sku?: string;
  description?: string;
  categoryId?: {
    _id: string;
    name: string;
    description?: string;
  } | string | null;
  hsnSacCode?: string;
  unit: string;
  sellingPrice: number;
  purchasePrice?: number;
  gstRate: number;
  taxType: TaxType;
  image?: string;
  isActive: boolean;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockAlert: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  itemType: ProductItemType;
  name: string;
  sku?: string;
  description?: string;
  categoryId?: string | null;
  hsnSacCode?: string;
  unit: string;
  sellingPrice: number;
  purchasePrice?: number;
  gstRate: number;
  taxType: TaxType;
  image?: string;
  isActive?: boolean;
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockAlert?: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  itemType?: ProductItemType | 'all';
  categoryId?: string;
  status?: 'active' | 'inactive' | 'all';
  lowStockOnly?: boolean;
  sortBy?: 'name' | 'sellingPrice' | 'stockQuantity' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductListResponse {
  products: Product[];
  pagination: ProductPaginationMeta;
}

export interface ProductMetrics {
  totalProducts: number;
  totalServices: number;
  activeItems: number;
  lowStockItems: number;
}

export interface StockAdjustmentData {
  adjustmentType: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
}

export interface ProductImportRowError {
  row: number;
  error: string;
  data: unknown;
}

export interface ProductImportResult {
  importedCount: number;
  failedCount: number;
  errors: ProductImportRowError[];
}
