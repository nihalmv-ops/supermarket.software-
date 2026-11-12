import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { ZodError } from 'zod';

export const errorMiddleware: ErrorRequestHandler = (
  err: Error | ApiError | ZodError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Consistent API error response format
  const responsePayload: {
    success: boolean;
    statusCode: number;
    message: string;
    details?: unknown;
    stack?: string;
  } = {
    success: false,
    statusCode,
    message,
    ...(details !== undefined ? { details } : {}),
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(responsePayload);
};
