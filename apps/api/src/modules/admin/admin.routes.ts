import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { UserRole } from '@vericred/shared';

const router: Router = Router();

// Protect all admin routes with ADMIN role check
router.use(authenticate, requireRole([UserRole.ADMIN]));

router.get('/institutions/pending', adminController.getPendingInstitutions);
router.get('/institutions', adminController.getAllInstitutions);
router.post('/institutions/:id/approve', adminController.approveInstitution);
router.post('/institutions/:id/reject', adminController.rejectInstitution);
router.post('/institutions/:id/suspend', adminController.suspendInstitution);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
