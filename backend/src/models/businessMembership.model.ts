import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MembershipRole = 'owner' | 'admin' | 'staff';

export interface IBusinessMembership {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  role: MembershipRole;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessMembershipDocument extends IBusinessMembership, Document {}

export interface IBusinessMembershipModel extends Model<IBusinessMembershipDocument> {
  getUserMemberships(userId: Types.ObjectId | string): Promise<IBusinessMembershipDocument[]>;
}

const businessMembershipSchema = new Schema<
  IBusinessMembershipDocument,
  IBusinessMembershipModel
>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for membership'],
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required for membership'],
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'staff'],
      default: 'staff',
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: ['read', 'write'],
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

// Ensure a user can only have one membership record per business
businessMembershipSchema.index({ userId: 1, businessId: 1 }, { unique: true });

// Static helper to query all active business memberships for a user with populated business data
businessMembershipSchema.statics.getUserMemberships = function (
  userId: Types.ObjectId | string
) {
  return this.find({ userId, isActive: true })
    .populate('businessId')
    .sort({ createdAt: -1 })
    .exec();
};

export const BusinessMembership: IBusinessMembershipModel = mongoose.model<
  IBusinessMembershipDocument,
  IBusinessMembershipModel
>('BusinessMembership', businessMembershipSchema);
