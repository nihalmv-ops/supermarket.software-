import { Router } from 'express';
import { ProductCategoryController } from '../controllers/productCategory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';

const router = Router();

// Apply authentication and tenant verification to all category routes
router.use(authenticate, requireTenant);

router.post('/', ProductCategoryController.create);
router.get('/', ProductCategoryController.getAll);
router.put('/:id', ProductCategoryController.update);
router.delete('/:id', ProductCategoryController.delete);

export default router;
