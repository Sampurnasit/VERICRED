import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthorizationError } from '@vericred/shared';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Access forbidden: requires one of [${allowedRoles.join(', ')}] role`
        )
      );
    }

    next();
  };
}
