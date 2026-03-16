import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middleware/auth.js';
import Joi from 'joi';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

// Validation middleware
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return next(new AppError(message, 400));
    }
    next();
  };
}

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  avatarUrl: Joi.string().uri().optional().allow(null, ''),
}).or('name', 'avatarUrl');

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(100).required(),
});

router.patch('/profile', authenticate, validate(updateProfileSchema), usersController.updateProfile);
router.patch('/password', authenticate, validate(changePasswordSchema), usersController.changePassword);

export default router;
