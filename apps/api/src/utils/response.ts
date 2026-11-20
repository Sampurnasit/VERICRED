import { Response } from 'express';
import { ApiResponse, ApiErrorResponse } from '@vericred/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: { requestId?: string }
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(meta?.requestId ? { requestId: meta.requestId } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  error: { code: string; message: string; details?: unknown },
  statusCode = 500,
  meta?: { requestId?: string }
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      ...(meta?.requestId ? { requestId: meta.requestId } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}
