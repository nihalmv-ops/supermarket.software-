import { Router } from 'express';
import { BusinessController } from '../controllers/business.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  requireTenant,
  requireBusinessRole,
} from '../middleware/tenant.middleware.js';

const router = Router();

// Business registration & listing (authenticated user level)
router.post('/register', authenticate, BusinessController.register);
router.get('/my-businesses', authenticate, BusinessController.getMyBusinesses);
router.patch('/switch/:businessId', authenticate, BusinessController.switchBusiness);

// Tenant-scoped business endpoints (require verified active tenant)
router.get('/active', authenticate, requireTenant, BusinessController.getActiveBusiness);
router.get('/profile', authenticate, requireTenant, BusinessController.getProfile);
router.put(
  '/profile',
  authenticate,
  requireTenant,
  requireBusinessRole('owner', 'admin'),
  BusinessController.updateProfile
);

export default router;
