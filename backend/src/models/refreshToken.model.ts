import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IRefreshToken {
  tokenHash: string;
  user: Types.ObjectId;
  family: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {}
export interface IRefreshTokenModel extends Model<IRefreshTokenDocument> {}

const refreshTokenSchema = new Schema<IRefreshTokenDocument, IRefreshTokenModel>(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    family: {
      type: String,
      required: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL auto-cleanup when token expires
    },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken: IRefreshTokenModel = mongoose.model<
  IRefreshTokenDocument,
  IRefreshTokenModel
>('RefreshToken', refreshTokenSchema);
