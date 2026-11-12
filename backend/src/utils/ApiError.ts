export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad Request', details?: unknown): ApiError {
    return new ApiError(400, message, true, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message, true);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message, true);
  }

  static notFound(message: string = 'Resource Not Found'): ApiError {
    return new ApiError(404, message, true);
  }

  static internal(message: string = 'Internal Server Error'): ApiError {
    return new ApiError(500, message, false);
  }

  static serviceUnavailable(message: string = 'Service Unavailable'): ApiError {
    return new ApiError(503, message, true);
  }
}
