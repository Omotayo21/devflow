import { Router } from 'express';
import * as tasksController from './tasks.controller.js';
import { authenticate } from '../../middleware/auth.js';
import Joi from 'joi';
import { AppError } from '../../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return next(new AppError(error.details.map(d => d.message).join(', '), 400));
    next();
  };
}

const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  description: Joi.string().optional(),
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  assigneeId: Joi.string().uuid().optional(),
  dueDate: Joi.date().optional(),
});

const updateTaskSchema = createTaskSchema.fork(
  ['title'], field => field.optional()
);

router.use(authenticate);

router.post('/', validate(createTaskSchema), tasksController.createTask);
router.get('/', tasksController.getProjectTasks);
router.patch('/:taskId', validate(updateTaskSchema), tasksController.updateTask);
router.delete('/:taskId', tasksController.deleteTask);
router.post('/:taskId/comments', tasksController.createComment);
router.get('/:taskId/comments', tasksController.getTaskComments);
router.delete('/:taskId/comments/:commentId', tasksController.deleteComment);

export default router;