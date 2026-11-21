import { Router } from 'express';
import { institutionController } from './institution.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { UserRole } from '@vericred/shared';

const router: Router = Router();

router.use(authenticate, requireRole([UserRole.INSTITUTION]));

router.post('/register', institutionController.register);
router.get('/me', institutionController.getProfile);
router.get('/students', institutionController.getStudents);

export default router;
