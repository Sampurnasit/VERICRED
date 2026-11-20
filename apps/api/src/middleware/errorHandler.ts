import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { VeriCredError } from '@vericred/shared';
import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(
      res,
      {
        code: 'VALIDATION_FAILED',
        message: 'The submitted payload contains validation errors.',
        details,
      },
      400
    );
    return;
  }

  if (err instanceof VeriCredError) {
    sendError(
      res,
      {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      err.statusCode
    );
    return;
  }

  console.error('Unhandled server error:', err);
  sendError(
    res,
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred.',
    },
    500
  );
};
