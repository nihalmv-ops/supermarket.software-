import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { Business } from '../models/business.model.js';
import { BusinessMembership } from '../models/businessMembership.model.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation.js';
import {
  generateAccessToken,
  generateAndStoreRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../services/token.service.js';
import { emailService } from '../services/email.service.js';

export class AuthController {
  /**
   * Register a new Business Owner & Company Profile
   * POST /api/auth/register
   */
  static register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Check for duplicate email
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        throw ApiError.badRequest(
          'An account with this email address already exists. Please log in instead.'
        );
      }

      // Create user account - ALWAYS business_owner (disallow super_admin escalation)
      const newUser = await User.create({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        phone: validatedData.phone,
        role: 'business_owner',
        isActive: true,
      });

      // Create business record linking to owner
      const newBusiness = await Business.create({
        businessName: validatedData.businessName,
        ownerId: newUser._id,
        email: validatedData.email,
        phone: validatedData.phone,
        subscriptionPlan: 'Starter',
      });

      // Create owner membership record
      await BusinessMembership.create({
        userId: newUser._id,
        businessId: newBusiness._id,
        role: 'owner',
        permissions: ['all'],
        isActive: true,
      });

      // Generate token pair
      const accessToken = generateAccessToken(newUser);
      const refreshToken = await generateAndStoreRefreshToken(newUser);

      // Set HttpOnly refresh token cookie
      setRefreshTokenCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        message: 'Business account registered successfully.',
        data: {
          user: newUser,
          business: newBusiness,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Authenticate User & Issue Tokens
   * POST /api/auth/login
   */
  static login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Fetch user with password field explicitly included
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        throw ApiError.unauthorized('Invalid email or password.');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password.');
      }

      if (!user.isActive) {
        throw ApiError.forbidden(
          'Your account has been deactivated. Please contact support.'
        );
      }

      // Fetch associated business profile and membership
      let membership = await BusinessMembership.findOne({
        userId: user._id,
        isActive: true,
      }).populate('businessId');

      let business = membership ? (membership.businessId as any) : null;

      // Auto-migrate legacy business records if membership is missing
      if (!business) {
        business = await Business.findOne({ $or: [{ ownerId: user._id }, { owner: user._id }] });
        if (business) {
          membership = await BusinessMembership.findOneAndUpdate(
            { userId: user._id, businessId: business._id },
            { role: 'owner', permissions: ['all'], isActive: true },
            { upsert: true, new: true }
          ).populate('businessId');
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateAndStoreRefreshToken(user);

      // Set HttpOnly cookie
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user,
          business,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh Access Token using HttpOnly Refresh Token
   * POST /api/auth/refresh
   */
  static refresh = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken;

      if (!incomingRefreshToken) {
        throw ApiError.unauthorized('Refresh token missing from cookie.');
      }

      // Perform atomic token rotation & reuse detection
      const { user, newAccessToken, newRefreshToken } =
        await rotateRefreshToken(incomingRefreshToken);

      // Set new rotated refresh token in HttpOnly cookie
      setRefreshTokenCookie(res, newRefreshToken);

      // Fetch user's active membership and business profile
      let membership = await BusinessMembership.findOne({
        userId: user._id,
        isActive: true,
      }).populate('businessId');

      let business = membership ? (membership.businessId as any) : null;

      if (!business) {
        business = await Business.findOne({ $or: [{ ownerId: user._id }, { owner: user._id }] });
      }

      res.status(200).json({
        success: true,
        message: 'Session refreshed successfully.',
        data: {
          accessToken: newAccessToken,
          user,
          business,
        },
      });
    } catch (error) {
      // Clear compromised/invalid cookie
      clearRefreshTokenCookie(res);
      next(error);
    }
  };

  /**
   * Logout User & Invalidate Tokens
   * POST /api/auth/logout
   */
  static logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken;

      if (incomingRefreshToken) {
        await revokeRefreshToken(incomingRefreshToken);
      }

      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Current Authenticated Profile
   * GET /api/auth/me
   */
  static getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated.');
      }

      // Support header x-business-id or fallback to active membership
      const targetBusinessId = req.headers['x-business-id'] as string;
      let business: any = null;
      let membership: any = null;

      if (targetBusinessId && targetBusinessId.match(/^[0-9a-fA-F]{24}$/)) {
        membership = await BusinessMembership.findOne({
          userId: req.user._id,
          businessId: targetBusinessId,
          isActive: true,
        }).populate('businessId');
        if (membership) {
          business = membership.businessId;
        }
      }

      if (!business) {
        membership = await BusinessMembership.findOne({
          userId: req.user._id,
          isActive: true,
        }).populate('businessId');
        business = membership ? membership.businessId : null;
      }

      if (!business) {
        business = await Business.findOne({ $or: [{ ownerId: req.user._id }, { owner: req.user._id }] });
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          business,
          membership,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Request Password Reset Email
   * POST /api/auth/forgot-password
   */
  static forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await User.findOne({ email });

      // NEVER reveal whether an email exists or not (timing-safe defense)
      if (user && user.isActive) {
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await emailService.sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      }

      res.status(200).json({
        success: true,
        message:
          'If an account with that email address exists, password reset instructions have been sent.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset Password with Valid Token
   * POST /api/auth/reset-password
   */
  static resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      // Hash the provided unhashed token to compare with DB
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+password');

      if (!user) {
        throw ApiError.badRequest(
          'Password reset token is invalid or has expired. Please request a new one.'
        );
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      // Invalidate all existing refresh tokens
      await revokeAllUserTokens(user._id);

      await user.save();

      res.status(200).json({
        success: true,
        message:
          'Password has been reset successfully. Please sign in with your new credentials.',
      });
    } catch (error) {
      next(error);
    }
  };
}
