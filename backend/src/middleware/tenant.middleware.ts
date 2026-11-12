import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Business, IBusinessDocument } from '../models/business.model.js';
import {
  BusinessMembership,
  IBusinessMembershipDocument,
  MembershipRole,
} from '../models/businessMembership.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Tenant Isolation Middleware:
 * Resolves, validates, and strictly verifies the active business and user's membership.
 * NEVER trusts the client-provided businessId without server-side database verification.
 */
export const requireTenant = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Ensure user is authenticated
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required to access business resources.');
    }

    // 2. Extract business ID from header, query param, or request body
    const rawBusinessId =
      (req.headers['x-business-id'] as string) ||
      (req.query.businessId as string) ||
      req.body?.businessId;

    let targetBusinessId: string | null = null;

    if (rawBusinessId && typeof rawBusinessId === 'string' && rawBusinessId.trim() !== '') {
      targetBusinessId = rawBusinessId.trim();

      if (!mongoose.Types.ObjectId.isValid(targetBusinessId)) {
        throw ApiError.badRequest('Invalid business identifier format.');
      }
    }

    // 3. Super Admin Handling
    if (req.user.role === 'super_admin') {
      if (targetBusinessId) {
        const business = await Business.findById(targetBusinessId);
        if (!business) {
          throw ApiError.notFound('Target business not found.');
        }
        req.business = business;
      }
      return next();
    }

    // 4. Regular User / Business Owner Handling
    let activeMembership: IBusinessMembershipDocument | null = null;

    if (targetBusinessId) {
      // Validate membership in the requested target business
      activeMembership = await BusinessMembership.findOne({
        userId: req.user._id,
        businessId: targetBusinessId,
        isActive: true,
      });

      if (!activeMembership) {
        throw ApiError.forbidden(
          'Access denied. You do not have an active membership with this business.'
        );
      }
    } else {
      // Fallback: lookup user's most recent active business membership
      activeMembership = await BusinessMembership.findOne({
        userId: req.user._id,
        isActive: true,
      }).sort({ updatedAt: -1 });

      if (!activeMembership) {
        throw ApiError.badRequest(
          'No business account found for this user. Please register a business.'
        );
      }
    }

    // 5. Fetch and verify business status
    const business = await Business.findById(activeMembership.businessId);

    if (!business) {
      throw ApiError.notFound('Associated business record does not exist.');
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

    // 6. Attach verified business & membership to request object
    req.business = business;
    req.membership = activeMembership;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Business Role Authorization Middleware
 * Enforces business-level roles ('owner' | 'admin' | 'staff')
 */
export const requireBusinessRole = (...allowedRoles: MembershipRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    // Super Admin has global bypass capability
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!req.membership) {
      return next(
        ApiError.forbidden('Tenant membership verification required for this operation.')
      );
    }

    if (!allowedRoles.includes(req.membership.role)) {
      return next(
        ApiError.forbidden(
          `Operation forbidden: You need '${allowedRoles.join(' or ')}' role in this business.`
        )
      );
    }

    next();
  };
};

/**
 * Business Permission Authorization Middleware
 * Checks granular permissions on the membership record
 */
export const requireBusinessPermission = (requiredPermission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user?.role === 'super_admin') {
      return next();
    }

    if (!req.membership) {
      return next(ApiError.forbidden('Business membership context missing.'));
    }

    // Owners have full wildcard permissions
    if (req.membership.role === 'owner') {
      return next();
    }

    const hasPermission =
      req.membership.permissions.includes('all') ||
      req.membership.permissions.includes(requiredPermission);

    if (!hasPermission) {
      return next(
        ApiError.forbidden(
          `Permission denied: Missing '${requiredPermission}' capability in this business.`
        )
      );
    }

    next();
  };
};

/**
 * Helper to ensure queries and mutations are strictly scoped to the active tenant
 */
export const tenantScope = <T extends Record<string, unknown>>(
  req: Request,
  query: FilterQuery<T> = {}
): FilterQuery<T> => {
  if (!req.business) {
    throw ApiError.internal('tenantScope called without active business context.');
  }
  return {
    ...query,
    businessId: req.business._id,
  };
};
