import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

/**
 * Fast-Fail Database Connection Middleware
 * Prevents Mongoose from buffering queries indefinitely and hanging client HTTP requests when MongoDB is offline.
 */
export const requireDatabaseConnection = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Let health check and root endpoints pass through
  if (req.path === '/health' || req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState !== 1) {
    return next(
      ApiError.serviceUnavailable(
        'Database connection unavailable. Please check that MongoDB Atlas is reachable and your IP address is whitelisted in Atlas Network Access (0.0.0.0/0).'
      )
    );
  }

  next();
};
