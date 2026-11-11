import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Silver Business Suite API is online and operational (TypeScript).',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
