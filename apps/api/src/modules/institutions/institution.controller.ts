import { Request, Response, NextFunction } from 'express';
import { institutionService } from './institution.service.js';
import { registerInstitutionSchema } from '@vericred/shared';
import { sendSuccess } from '../../utils/response.js';

export class InstitutionController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerInstitutionSchema.parse(req.body);
      const institution = await institutionService.register(req.user!.userId, input);
      sendSuccess(res, { institution }, 201);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const institution = await institutionService.getProfile(req.user!.userId);
      sendSuccess(res, { institution });
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
