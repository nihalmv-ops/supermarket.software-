import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type CustomerType = 'individual' | 'business' | 'wholesale' | 'retail';

export interface ICustomer {
  businessId: Types.ObjectId;
  customerName: string;
  companyName?: string;
  customerType: CustomerType;
  phone: string;
  alternatePhone?: string;
  email?: string;
  gstin?: string;
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerDocument extends ICustomer, Document {}

export interface ICustomerModel extends Model<ICustomerDocument> {}

const customerSchema = new Schema<ICustomerDocument, ICustomerModel>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business identifier is required'],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be at least 2 characters long'],
      maxlength: [150, 'Customer name cannot exceed 150 characters'],
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },
    customerType: {
      type: String,
      enum: {
        values: ['individual', 'business', 'wholesale', 'retail'],
        message: '{VALUE} is not a valid customer type',
      },
      default: 'business',
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    billingAddress: {
      type: String,
      trim: true,
      default: '',
    },
    shippingAddress: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

// Compound indexes for tenant-scoped fast querying and uniqueness verification
customerSchema.index({ businessId: 1, customerName: 1 });
customerSchema.index({ businessId: 1, phone: 1 });
customerSchema.index({ businessId: 1, email: 1 });
customerSchema.index({ businessId: 1, gstin: 1 });
customerSchema.index({ businessId: 1, customerType: 1 });
customerSchema.index({ businessId: 1, isActive: 1 });
customerSchema.index({ businessId: 1, createdAt: -1 });

export const Customer: ICustomerModel = mongoose.model<ICustomerDocument, ICustomerModel>(
  'Customer',
  customerSchema
);
