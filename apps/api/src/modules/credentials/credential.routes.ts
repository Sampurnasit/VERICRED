import { Router } from 'express';
import { credentialController } from './credential.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { requireApprovedInstitution } from '../../middleware/requireApprovedInstitution.js';
import { UserRole } from '@vericred/shared';

const router: Router = Router();

// Institution issuance routes (strictly requiring APPROVED status)
router.post(
  '/issue',
  authenticate,
  requireRole([UserRole.INSTITUTION]),
  requireApprovedInstitution,
  credentialController.issueSingle
);

router.post(
  '/issue-bulk',
  authenticate,
  requireRole([UserRole.INSTITUTION]),
  requireApprovedInstitution,
  credentialController.issueBulk
);

router.get(
  '/institution',
  authenticate,
  requireRole([UserRole.INSTITUTION]),
  credentialController.getMyInstitutionCredentials
);

// Student retrieval routes
router.get(
  '/student',
  authenticate,
  requireRole([UserRole.STUDENT]),
  credentialController.getMyStudentCredentials
);

// Specific credential retrieval
router.get('/:id', authenticate, credentialController.getById);

// Credential revocation (restricted to Institution or Admin)
router.post(
  '/:id/revoke',
  authenticate,
  requireRole([UserRole.INSTITUTION, UserRole.ADMIN]),
  credentialController.revoke
);

export default router;
