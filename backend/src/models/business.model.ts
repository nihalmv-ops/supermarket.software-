import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type BusinessPlan = 'Starter' | 'Professional' | 'Business';
export type BusinessStatus = 'active' | 'suspended' | 'inactive';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled';

export interface IBusiness {
  businessName: string;
  businessSlug: string;
  ownerId: Types.ObjectId;
  businessType: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  gstNumber?: string;
  logo?: string;
  status: BusinessStatus;
  subscriptionPlan: BusinessPlan;
  subscriptionStatus: SubscriptionStatus;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
  // Backward compatibility virtuals
  name?: string;
  owner?: Types.ObjectId;
  plan?: BusinessPlan;
  gstin?: string;
  isActive?: boolean;
}

export interface IBusinessDocument extends IBusiness, Document {}

export interface IBusinessModel extends Model<IBusinessDocument> {
  generateUniqueSlug(name: string): Promise<string>;
}

const businessSchema = new Schema<IBusinessDocument, IBusinessModel>(
  {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters long'],
      maxlength: [150, 'Business name cannot exceed 150 characters'],
      alias: 'name',
    },
    businessSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business must have an owner'],
      index: true,
      alias: 'owner',
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true,
      default: 'Retail',
    },
    email: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Business contact number is required'],
      trim: true,
    },
    address: {
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
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
      alias: 'gstin',
    },
    logo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['Starter', 'Professional', 'Business'],
      default: 'Starter',
      alias: 'plan',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'canceled'],
      default: 'active',
    },
    currency: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for backward-compatibility with isActive checks
businessSchema.virtual('isActive').get(function (this: IBusinessDocument) {
  return this.status === 'active';
});

// Helper static method to generate a URL-safe unique business slug
businessSchema.statics.generateUniqueSlug = async function (
  name: string
): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'business';

  let slug = baseSlug;
  let counter = 1;

  while (await this.exists({ businessSlug: slug })) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    slug = `${baseSlug}-${randomSuffix}`;
    counter++;
    if (counter > 10) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
};

// Pre-validate hook to automatically generate slug if missing
businessSchema.pre('validate', async function (next) {
  if (this.isNew || !this.businessSlug) {
    const nameToSlug = this.businessName || (this as any).name;
    if (nameToSlug && !this.businessSlug) {
      const model = this.constructor as IBusinessModel;
      this.businessSlug = await model.generateUniqueSlug(nameToSlug);
    }
  }
  next();
});

export const Business: IBusinessModel = mongoose.model<IBusinessDocument, IBusinessModel>(
  'Business',
  businessSchema
);
