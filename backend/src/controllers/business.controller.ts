import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Business } from '../models/business.model.js';
import { BusinessMembership } from '../models/businessMembership.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createBusinessSchema,
  updateBusinessProfileSchema,
  switchBusinessSchema,
} from '../validations/business.validation.js';

export class BusinessController {
  /**
   * Register a new additional business for an authenticated user
   * POST /api/business/register
   */
  static register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required.');
      }

      const validatedData = createBusinessSchema.parse(req.body);

      // Create new business with auto-generated slug
      const newBusiness = await Business.create({
        businessName: validatedData.businessName,
        ownerId: req.user._id,
        businessType: validatedData.businessType,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address || '',
        city: validatedData.city || '',
        state: validatedData.state || '',
        country: validatedData.country || 'India',
        pincode: validatedData.pincode || '',
        gstNumber: validatedData.gstNumber || '',
        subscriptionPlan: validatedData.subscriptionPlan,
        status: 'active',
      });

      // Automatically assign creator as Owner
      const membership = await BusinessMembership.create({
        userId: req.user._id,
        businessId: newBusiness._id,
        role: 'owner',
        permissions: ['all'],
        isActive: true,
      });

      res.status(201).json({
        success: true,
        message: 'New business registered successfully.',
        data: {
          business: newBusiness,
          membership,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List all businesses where current user has an active membership
   * GET /api/business/my-businesses
   */
  static getMyBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required.');
      }

      // Query all memberships for this user
      const memberships = await BusinessMembership.find({
        userId: req.user._id,
        isActive: true,
      })
        .populate('businessId')
        .sort({ createdAt: -1 });

      // Transform into clean client-friendly format, filtering out orphaned references
      const businesses = memberships
        .filter((m) => m.businessId != null)
        .map((m) => {
          const biz = m.businessId as any;
          return {
            _id: biz._id,
            businessName: biz.businessName || biz.name,
            businessSlug: biz.businessSlug,
            businessType: biz.businessType,
            email: biz.email,
            phone: biz.phone,
            status: biz.status,
            subscriptionPlan: biz.subscriptionPlan || biz.plan,
            logo: biz.logo || '',
            gstNumber: biz.gstNumber || biz.gstin || '',
            role: m.role,
            permissions: m.permissions,
            joinedAt: m.createdAt,
          };
        });

      res.status(200).json({
        success: true,
        data: businesses,
        count: businesses.length,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active business details and user's membership
   * GET /api/business/active
   */
  static getActiveBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          business: req.business,
          membership: req.membership,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Switch the active business context
   * PATCH /api/business/switch/:businessId
   */
  static switchBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required.');
      }

      const { businessId } = switchBusinessSchema.parse(req.params);

      let membership = null;

      // Super Admin can switch into any business
      if (req.user.role === 'super_admin') {
        const business = await Business.findById(businessId);
        if (!business) {
          throw ApiError.notFound('Business not found.');
        }

        return void res.status(200).json({
          success: true,
          message: `Switched to business '${business.businessName}' (Super Admin Mode).`,
          data: {
            business,
            membership: {
              role: 'owner',
              permissions: ['all'],
            },
          },
        });
      }

      // Strict server-side verification: User MUST have active membership in the target business
      membership = await BusinessMembership.findOne({
        userId: req.user._id,
        businessId,
        isActive: true,
      });

      if (!membership) {
        throw ApiError.forbidden(
          'Access denied. You do not have an active membership with this business.'
        );
      }

      const business = await Business.findById(businessId);

      if (!business) {
        throw ApiError.notFound('Target business record does not exist.');
      }

      if (business.status === 'suspended') {
        throw ApiError.forbidden(
          'This business account has been suspended. Please contact platform administration.'
        );
      }

      if (business.status === 'inactive') {
        throw ApiError.forbidden(
          'This business account is inactive. Please reactivate your subscription.'
        );
      }

      res.status(200).json({
        success: true,
        message: `Switched business to '${business.businessName}' successfully.`,
        data: {
          business,
          membership,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Active Business Profile
   * GET /api/business/profile
   */
  static getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          business: req.business,
          membership: req.membership,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update Active Business Profile
   * PUT /api/business/profile
   */
  static updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.business) {
        throw ApiError.badRequest('No active business selected.');
      }

      const validatedData = updateBusinessProfileSchema.parse(req.body);

      // Apply updates to the active business
      const updatedBusiness = await Business.findByIdAndUpdate(
        req.business._id,
        {
          $set: validatedData,
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Business profile updated successfully.',
        data: {
          business: updatedBusiness,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
