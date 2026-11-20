import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service.js';
import { sendSuccess } from '../../utils/response.js';

export class StudentController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.getProfile(req.user!.userId);
      sendSuccess(res, { student });
    } catch (err) {
      next(err);
    }
  }
}

export const studentController = new StudentController();
