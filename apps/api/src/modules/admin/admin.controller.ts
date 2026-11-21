import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service.js';
import { sendSuccess } from '../../utils/response.js';

export class AdminController {
  async getPendingInstitutions(_req: Request, res: Response, next: NextFunction) {
    try {
      const institutions = await adminService.getPendingInstitutions();
      sendSuccess(res, { institutions });
    } catch (err) {
      next(err);
    }
  }

  async getAllInstitutions(_req: Request, res: Response, next: NextFunction) {
    try {
      const institutions = await adminService.getAllInstitutions();
      sendSuccess(res, { institutions });
    } catch (err) {
      next(err);
    }
  }

  async approveInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { decisionNotes } = req.body;
      const institution = await adminService.approveInstitution(
        id,
        req.user!.userId,
        decisionNotes
      );
      sendSuccess(res, { institution, message: 'Institution approved successfully' });
    } catch (err) {
      next(err);
    }
  }

  async rejectInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { decisionNotes } = req.body;
      const institution = await adminService.rejectInstitution(
        id,
        req.user!.userId,
        decisionNotes
      );
      sendSuccess(res, { institution, message: 'Institution rejected successfully' });
    } catch (err) {
      next(err);
    }
  }

  async suspendInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { decisionNotes } = req.body;
      const institution = await adminService.suspendInstitution(
        id,
        req.user!.userId,
        decisionNotes
      );
      sendSuccess(res, { institution, message: 'Institution suspended successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const auditLogs = await adminService.getAuditLogs(limit);
      sendSuccess(res, { auditLogs });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
