import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  logger.error({
    err,
    method: req.method,
    url: req.url,
    userId: req.user?.userId,
  });

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.isDev && { stack: err.stack }),
  });
}