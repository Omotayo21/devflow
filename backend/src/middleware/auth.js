import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

export function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('No token provided', 401);
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}