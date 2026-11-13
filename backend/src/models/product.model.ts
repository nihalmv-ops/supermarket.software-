import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ProductItemType = 'product' | 'service';
export type TaxType = 'inclusive' | 'exclusive';

export interface IProduct {
  businessId: Types.ObjectId;
  itemType: ProductItemType;
  name: string;
  sku?: string;
  description?: string;
  categoryId?: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

export interface IProductModel extends Model<IProductDocument> {}

const productSchema = new Schema<IProductDocument, IProductModel>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business identifier is required'],
      index: true,
    },
    itemType: {
      type: String,
      enum: {
        values: ['product', 'service'],
        message: '{VALUE} is not a valid item type',
      },
      default: 'product',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Item name must be at least 2 characters long'],
      maxlength: [200, 'Item name cannot exceed 200 characters'],
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'SKU cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'ProductCategory',
      default: null,
      index: true,
    },
    hsnSacCode: {
      type: String,
      trim: true,
      default: '',
      maxlength: [20, 'HSN/SAC code cannot exceed 20 characters'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'pcs',
      maxlength: [50, 'Unit cannot exceed 50 characters'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
      default: 0,
    },
    gstRate: {
      type: Number,
      required: [true, 'GST rate is required'],
      min: [0, 'GST rate cannot be negative'],
      max: [100, 'GST rate cannot exceed 100%'],
      default: 18,
    },
    taxType: {
      type: String,
      enum: {
        values: ['inclusive', 'exclusive'],
        message: '{VALUE} is not a valid tax type',
      },
      default: 'exclusive',
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    trackInventory: {
      type: Boolean,
      default: false,
      index: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    lowStockAlert: {
      type: Number,
      default: 5,
      min: [0, 'Low stock alert threshold cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for tenant-scoped query performance
productSchema.index({ businessId: 1, name: 1 });
productSchema.index({ businessId: 1, itemType: 1 });
productSchema.index({ businessId: 1, categoryId: 1 });
productSchema.index({ businessId: 1, isActive: 1 });
productSchema.index({ businessId: 1, trackInventory: 1, stockQuantity: 1 });
productSchema.index({ businessId: 1, createdAt: -1 });

// Ensure SKU is unique per business when provided
productSchema.index(
  { businessId: 1, sku: 1 },
  {
    unique: true,
    partialFilterExpression: { sku: { $type: 'string', $gt: '' } },
  }
);

export const Product: IProductModel = mongoose.model<IProductDocument, IProductModel>(
  'Product',
  productSchema
);
