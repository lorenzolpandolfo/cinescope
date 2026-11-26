import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { isDuplicateKeyError } from '../utils/duplicateKey.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message),
    });
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  if (isDuplicateKeyError(error)) {
    res.status(409).json({ message: 'Resource already exists' });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
}
