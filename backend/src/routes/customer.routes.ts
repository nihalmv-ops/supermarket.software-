import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';

const router = Router();

// All customer endpoints require authentication and verified active tenant membership
router.use(authenticate, requireTenant);

// Metrics and CSV operations
router.get('/metrics/summary', CustomerController.getMetricsSummary);
router.get('/export/csv', CustomerController.exportCsv);
router.get('/template/csv', CustomerController.getCsvTemplate);
router.post('/import/csv', CustomerController.importCsv);

// Standard CRUD endpoints
router.post('/', CustomerController.create);
router.get('/', CustomerController.list);
router.get('/:id', CustomerController.getById);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.delete);
router.patch('/:id/status', CustomerController.updateStatus);
router.get('/:id/statement', CustomerController.getStatement);

export default router;
