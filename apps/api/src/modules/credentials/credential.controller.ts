import { Request, Response, NextFunction } from 'express';
import { credentialService } from './credential.service.js';
import {
  issueCredentialInputSchema,
  bulkIssueCredentialSchema,
} from '@vericred/credential-schema';
import { sendSuccess } from '../../utils/response.js';

export class CredentialController {
  async issueSingle(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = issueCredentialInputSchema.parse(req.body);
      const result = await credentialService.issueSingleCredential(
        req.user!.userId,
        validated
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async issueBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = bulkIssueCredentialSchema.parse(req.body);
      const result = await credentialService.issueBulkCredentials(
        req.user!.userId,
        validated.records
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async getMyStudentCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = await credentialService.getStudentCredentials(req.user!.userId);
      sendSuccess(res, { credentials });
    } catch (err) {
      next(err);
    }
  }

  async getMyInstitutionCredentials(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials = await credentialService.getInstitutionCredentials(req.user!.userId);
      sendSuccess(res, { credentials });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const credential = await credentialService.getCredentialById(id, {
        userId: req.user!.userId,
        role: req.user!.role,
      });
      sendSuccess(res, { credential });
    } catch (err) {
      next(err);
    }
  }

  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { revocationReason } = req.body;
      const result = await credentialService.revokeCredential(req.user!.userId, {
        credentialId: id,
        revocationReason: revocationReason || 'ADMINISTRATIVE_REVOCATION',
      });
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const credentialController = new CredentialController();
