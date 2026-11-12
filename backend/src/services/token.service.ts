import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response } from 'express';
import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { IUserDocument } from '../models/user.model.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import { ApiError } from '../utils/ApiError.js';

export interface AccessTokenPayload {
  userId: string;
  role: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  family: string;
  tokenVersion: number;
}

/**
 * SHA-256 hash a refresh token string for safe storage
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate short-lived JWT access token (15m)
 */
export const generateAccessToken = (user: IUserDocument): string => {
  const payload: AccessTokenPayload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generate cryptographically secure refresh token & record rotation family
 */
export const generateAndStoreRefreshToken = async (
  user: IUserDocument,
  existingFamily?: string
): Promise<string> => {
  const family = existingFamily || crypto.randomUUID();
  const rawToken = crypto.randomBytes(40).toString('hex');

  const payload: RefreshTokenPayload = {
    userId: user._id.toString(),
    family,
    tokenVersion: user.tokenVersion || 0,
  };

  const signedToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  const fullToken = `${signedToken}.${rawToken}`;
  const tokenHash = hashToken(fullToken);

  // Store hashed token in DB with 7-day expiration
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    tokenHash,
    user: user._id,
    family,
    isRevoked: false,
    expiresAt,
  });

  return fullToken;
};

/**
 * Rotate refresh token: Invalidate previous token and issue a fresh pair
 * Detects token reuse attacks and invalidates entire family if reuse occurs
 */
export const rotateRefreshToken = async (
  token: string
): Promise<{ user: IUserDocument; newAccessToken: string; newRefreshToken: string }> => {
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const lastDotIndex = token.lastIndexOf('.');
  const jwtPart = lastDotIndex !== -1 ? token.substring(0, lastDotIndex) : token;
  if (!jwtPart) {
    throw ApiError.unauthorized('Malformed refresh token');
  }

  let payload: RefreshTokenPayload;
  try {
    payload = jwt.verify(jwtPart, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token expired. Please login again.');
    }
    throw ApiError.unauthorized('Invalid refresh token signature');
  }

  const currentTokenHash = hashToken(token);
  const foundToken = await RefreshToken.findOne({ tokenHash: currentTokenHash });

  // REUSE DETECTION: If token was already revoked, someone is replaying an old token!
  if (!foundToken || foundToken.isRevoked) {
    // Revoke all tokens in this family immediately!
    await RefreshToken.updateMany(
      { family: payload.family },
      { $set: { isRevoked: true } }
    );
    throw ApiError.unauthorized(
      'Security alert: Refresh token reuse detected. All sessions revoked for safety.'
    );
  }

  // Find user and verify tokenVersion
  const { User } = await import('../models/user.model.js');
  const user = await User.findById(payload.userId);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or account deactivated');
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    await RefreshToken.updateMany(
      { family: payload.family },
      { $set: { isRevoked: true } }
    );
    throw ApiError.unauthorized('Session invalidated. Please login again.');
  }

  // Revoke the current token
  foundToken.isRevoked = true;
  await foundToken.save();

  // Generate new token pair in the same family
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateAndStoreRefreshToken(user, payload.family);

  return { user, newAccessToken, newRefreshToken };
};

/**
 * Revoke specific refresh token (used on logout)
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  if (!token) return;
  const currentTokenHash = hashToken(token);
  await RefreshToken.updateOne({ tokenHash: currentTokenHash }, { $set: { isRevoked: true } });
};

/**
 * Revoke all tokens for a user (used on password reset or account compromise)
 */
export const revokeAllUserTokens = async (userId: string | Types.ObjectId): Promise<void> => {
  const { User } = await import('../models/user.model.js');
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  await RefreshToken.updateMany({ user: userId }, { $set: { isRevoked: true } });
};

/**
 * Set secure HttpOnly refresh token cookie
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clear refresh token cookie on logout
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  });
};
