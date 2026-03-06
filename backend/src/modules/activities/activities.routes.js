import { Router } from 'express';
import * as activitiesController from './activities.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', activitiesController.getWorkspaceActivity);

export default router;