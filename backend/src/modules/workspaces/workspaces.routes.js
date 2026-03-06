import { Router } from 'express';
import * as workspacesController from './workspaces.controller.js';
import { authenticate } from '../../middleware/auth.js';
import Joi from 'joi';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router();

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map(d => d.message).join(', '), 400));
    }
    next();
  };
}

const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'member').default('member'),
});

// All workspace routes require authentication
router.use(authenticate);

router.post('/', validate(createWorkspaceSchema), workspacesController.createWorkspace);
router.get('/', workspacesController.getMyWorkspaces);
router.get('/:workspaceId', workspacesController.getWorkspace);
router.post('/:workspaceId/invite', validate(inviteSchema), workspacesController.inviteMember);
router.get('/:workspaceId/members', workspacesController.getMembers);

export default router;