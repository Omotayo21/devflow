import { Router } from 'express';
import * as projectsController from './projects.controller.js';
import { authenticate } from '../../middleware/auth.js';
import Joi from 'joi';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router({ mergeParams: true }); // mergeParams lets us access workspaceId from parent route

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.details.map(d => d.message).join(', '), 400));
    next();
  };
}

const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  status: Joi.string().valid('active', 'archived').optional(),
});

router.use(authenticate);

router.post('/', validate(createProjectSchema), projectsController.createProject);
router.get('/', projectsController.getWorkspaceProjects);
router.get('/:projectId', projectsController.getProject);
router.patch('/:projectId', validate(updateProjectSchema), projectsController.updateProject);
router.delete('/:projectId', projectsController.deleteProject);

export default router;