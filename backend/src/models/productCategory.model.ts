import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IProductCategory {
  businessId: Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCategoryDocument extends IProductCategory, Document {}

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {}

const productCategorySchema = new Schema<IProductCategoryDocument, IProductCategoryModel>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business identifier is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to guarantee unique category names per business tenant
productCategorySchema.index({ businessId: 1, name: 1 }, { unique: true });

export const ProductCategory: IProductCategoryModel = mongoose.model<
  IProductCategoryDocument,
  IProductCategoryModel
>('ProductCategory', productCategorySchema);
