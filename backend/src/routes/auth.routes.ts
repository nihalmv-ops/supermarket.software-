import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import {
  authenticate,
  authorize,
  loginRateLimiter,
  forgotPasswordRateLimiter,
} from '../middleware/auth.middleware.js';

const router: Router = Router();

// Public Authentication Endpoints
router.post('/register', AuthController.register);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Password Recovery Endpoints
router.post('/forgot-password', forgotPasswordRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected Authentication Endpoints
router.get('/me', authenticate, AuthController.getMe);

// Role-Protected Authorization Verification Endpoint
router.get('/admin-only', authenticate, authorize('super_admin'), (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Super admin authorization verified.',
  });
});

export default router;
