import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Business } from '../models/business.model.js';
import { BusinessMembership } from '../models/businessMembership.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { updateBusinessStatusSchema } from '../validations/business.validation.js';

export class SuperAdminController {
  /**
   * List all businesses across all tenants with pagination, search & filters
   * GET /api/super-admin/businesses
   */
  static getAllBusinesses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const skip = (page - 1) * limit;

      const search = (req.query.search as string)?.trim();
      const status = req.query.status as string;
      const plan = req.query.plan as string;

      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { businessName: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { businessSlug: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      if (status && ['active', 'suspended', 'inactive'].includes(status)) {
        filter.status = status;
      }

      if (plan && ['Starter', 'Professional', 'Business'].includes(plan)) {
        filter.$or = [{ subscriptionPlan: plan }, { plan }];
      }

      const [businesses, total, totalAll, totalActive, totalSuspended, totalInactive] =
        await Promise.all([
          Business.find(filter)
            .populate('ownerId', 'name email phone role isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Business.countDocuments(filter),
          Business.countDocuments({}),
          Business.countDocuments({ status: 'active' }),
          Business.countDocuments({ status: 'suspended' }),
          Business.countDocuments({ status: 'inactive' }),
        ]);

      // Count members for returned businesses
      const businessIds = businesses.map((b) => b._id);
      const memberCounts = await BusinessMembership.aggregate([
        { $match: { businessId: { $in: businessIds }, isActive: true } },
        { $group: { _id: '$businessId', count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      memberCounts.forEach((m) => countMap.set(m._id.toString(), m.count));

      const enrichedBusinesses = businesses.map((b) => ({
        ...b,
        memberCount: countMap.get(b._id.toString()) || 1,
      }));

      res.status(200).json({
        success: true,
        data: {
          businesses: enrichedBusinesses,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
          },
          stats: {
            total: totalAll,
            active: totalActive,
            suspended: totalSuspended,
            inactive: totalInactive,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single business details with owner and member list
   * GET /api/super-admin/businesses/:businessId
   */
  static getBusinessById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const businessId = req.params.businessId as string;

      if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
        throw ApiError.badRequest('Invalid business ID format.');
      }

      const business = await Business.findById(businessId).populate(
        'ownerId',
        'name email phone role isActive createdAt'
      );

      if (!business) {
        throw ApiError.notFound('Business not found.');
      }

      const memberships = await BusinessMembership.find({ businessId })
        .populate('userId', 'name email phone role isActive')
        .sort({ role: 1, createdAt: 1 });

      res.status(200).json({
        success: true,
        data: {
          business,
          members: memberships,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Suspend or Reactivate a Business Account
   * PATCH /api/super-admin/businesses/:businessId/status
   */
  static updateBusinessStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const businessId = req.params.businessId as string;

      if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
        throw ApiError.badRequest('Invalid business ID format.');
      }

      const { status } = updateBusinessStatusSchema.parse(req.body);

      const updatedBusiness = await Business.findByIdAndUpdate(
        businessId,
        { $set: { status } },
        { new: true, runValidators: true }
      );

      if (!updatedBusiness) {
        throw ApiError.notFound('Business not found.');
      }

      res.status(200).json({
        success: true,
        message: `Business status successfully updated to '${status}'.`,
        data: {
          business: updatedBusiness,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * System Overview Metrics
   * GET /api/super-admin/metrics
   */
  static getSystemMetrics = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const [
        totalUsers,
        totalBusinesses,
        activeBusinesses,
        suspendedBusinesses,
        planDistribution,
      ] = await Promise.all([
        User.countDocuments({}),
        Business.countDocuments({}),
        Business.countDocuments({ status: 'active' }),
        Business.countDocuments({ status: 'suspended' }),
        Business.aggregate([
          { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: totalUsers,
          businesses: {
            total: totalBusinesses,
            active: activeBusinesses,
            suspended: suspendedBusinesses,
          },
          plans: planDistribution,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
