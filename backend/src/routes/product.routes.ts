import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';

const router = Router();

// Apply authentication and tenant verification to all product routes
router.use(authenticate, requireTenant);

// Static routes before parameterized routes
router.get('/metrics/summary', ProductController.getMetrics);
router.get('/export/csv', ProductController.exportCsv);
router.get('/template/csv', ProductController.downloadTemplateCsv);
router.post('/import/csv', ProductController.importCsv);

// REST CRUD routes
router.post('/', ProductController.create);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);
router.patch('/:id/status', ProductController.updateStatus);
router.post('/:id/adjust-stock', ProductController.adjustStock);

export default router;
