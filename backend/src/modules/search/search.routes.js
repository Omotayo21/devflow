import { Router } from 'express';
import * as searchController from './search.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router({ mergeParams: true });
router.use(authenticate);
router.get('/', searchController.search);

export default router;
