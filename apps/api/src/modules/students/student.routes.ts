import { Router } from 'express';
import { studentController } from './student.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { UserRole } from '@vericred/shared';

const router: Router = Router();

router.use(authenticate, requireRole([UserRole.STUDENT]));

router.get('/me', studentController.getProfile);

export default router;
