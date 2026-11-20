import { Router } from 'express';
import { verificationController } from './verification.controller.js';

const router: Router = Router();

// Public verification endpoints (zero authentication needed)
router.post('/presentation', verificationController.verifyPresentation);
router.post('/credential', verificationController.verifyCredential);
router.post('/zk', verificationController.verifyZkProof);

export default router;
