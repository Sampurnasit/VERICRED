import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token.js';
import { AuthenticationError } from '@vericred/shared';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      next(new AuthenticationError('Authentication token has expired', 'AUTH_TOKEN_EXPIRED'));
    } else if (err instanceof AuthenticationError) {
      next(err);
    } else {
      next(new AuthenticationError('Invalid authentication token', 'AUTH_TOKEN_INVALID'));
    }
  }
}
