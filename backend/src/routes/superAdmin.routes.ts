import { Router } from 'express';
import { SuperAdminController } from '../controllers/superAdmin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes in this router require super_admin authorization
router.use(authenticate, authorize('super_admin'));

router.get('/businesses', SuperAdminController.getAllBusinesses);
router.get('/businesses/:businessId', SuperAdminController.getBusinessById);
router.patch('/businesses/:businessId/status', SuperAdminController.updateBusinessStatus);
router.get('/metrics', SuperAdminController.getSystemMetrics);

export default router;
