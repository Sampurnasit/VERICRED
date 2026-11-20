import { Request, Response, NextFunction } from 'express';
import { verificationService } from './verification.service.js';
import { sendSuccess } from '../../utils/response.js';

export class VerificationController {
  async verifyPresentation(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await verificationService.verifyPresentation(
        req.body.presentation,
        clientIp
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async verifyCredential(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await verificationService.verifyDirectCredential(
        req.body.credential,
        clientIp
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async verifyZkProof(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const result = await verificationService.verifyZkProof(
        req.body,
        clientIp
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const verificationController = new VerificationController();
