import { Request, Response, NextFunction } from 'express';
import { institutionService } from './institution.service.js';
import { registerInstitutionSchema, ValidationError } from '@vericred/shared';
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

  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await institutionService.getStudents(req.user!.userId);
      sendSuccess(res, { students });
    } catch (err) {
      next(err);
    }
  }

  async enrollStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, enrollmentNumber, department, batchYear } = req.body;
      if (!firstName || !lastName || !email || !enrollmentNumber || !department) {
        throw new ValidationError('Missing required student enrollment fields');
      }
      const student = await institutionService.enrollStudent(req.user!.userId, {
        firstName,
        lastName,
        email,
        enrollmentNumber,
        department,
        batchYear: Number(batchYear) || new Date().getFullYear(),
      });
      sendSuccess(res, { student }, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
