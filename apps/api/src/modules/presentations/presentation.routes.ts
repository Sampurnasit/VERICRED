import { Router } from 'express';
import { presentationController } from './presentation.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { UserRole } from '@vericred/shared';

const router: Router = Router();

// Student creates a new presentation / QR code
router.post(
  '/',
  authenticate,
  requireRole([UserRole.STUDENT]),
  presentationController.create
);

// Public lookup by QR nonce (no authentication required)
router.get('/:nonce', presentationController.getByNonce);

export default router;
