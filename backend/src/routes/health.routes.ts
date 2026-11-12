import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database.js';

const router: Router = Router();

/**
 * @route   GET /api/health
 * @desc    API and Database connectivity diagnostic health check
 * @access  Public
 */
router.get('/health', (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus === 'connected';

  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: isHealthy,
    message: isHealthy
      ? 'Silver Business Suite API is running'
      : 'Silver Business Suite API is running with degraded services',
    database: dbStatus,
  });
});

export default router;
