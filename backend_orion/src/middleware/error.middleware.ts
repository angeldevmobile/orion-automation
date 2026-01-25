import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom error class for throwing specific errors
export class ApiError extends Error {
  statusCode: number;
  code: string | undefined;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | ApiError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'A record with this data already exists',
        code: err.code
      });
    }
    
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
        code: err.code
      });
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: 'Invalid reference to related data',
        code: err.code
      });
    }

    // Record required but not found
    if (err.code === 'P2015') {
      return res.status(404).json({
        success: false,
        error: 'Related record not found',
        code: err.code
      });
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided',
      details: err.message
    });
  }

  // Prisma initialization errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      error: 'Database connection error',
      code: err.errorCode
    });
  }

  // Custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code && { code: err.code }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack
      })
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack
    })
  });
};

// Helper functions to throw common errors
export const notFound = (resource: string = 'Resource') => {
  return new ApiError(404, `${resource} not found`);
};

export const unauthorized = (message: string = 'Unauthorized') => {
  return new ApiError(401, message);
};

export const forbidden = (message: string = 'Forbidden') => {
  return new ApiError(403, message);
};

export const badRequest = (message: string = 'Bad request') => {
  return new ApiError(400, message);
};

export const conflict = (message: string = 'Resource already exists') => {
  return new ApiError(409, message);
};

export const serverError = (message: string = 'Internal server error') => {
  return new ApiError(500, message);
};