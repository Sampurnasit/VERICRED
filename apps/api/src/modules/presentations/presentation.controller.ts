import { Request, Response, NextFunction } from 'express';
import { presentationService } from './presentation.service.js';
import { presentationRequestSchema } from '@vericred/credential-schema';
import { sendSuccess } from '../../utils/response.js';

export class PresentationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = presentationRequestSchema.parse(req.body);
      const result = await presentationService.createPresentation(
        req.user!.userId,
        validated
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async getByNonce(req: Request, res: Response, next: NextFunction) {
    try {
      const { nonce } = req.params;
      const presentation = await presentationService.getPresentationByNonce(nonce);
      sendSuccess(res, { presentation });
    } catch (err) {
      next(err);
    }
  }
}

export const presentationController = new PresentationController();
