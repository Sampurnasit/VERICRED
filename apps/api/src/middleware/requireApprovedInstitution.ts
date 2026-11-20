import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { AuthorizationError, InstitutionStatus } from '@vericred/shared';

export async function requireApprovedInstitution(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
    }

    const institution = await prisma.institution.findFirst({
      where: {
        OR: [
          { userId: req.user.userId },
          ...(req.user.institutionId ? [{ id: req.user.institutionId }] : []),
        ],
      },
    });

    if (!institution) {
      return next(new AuthorizationError('Institution profile not found', 'INSTITUTION_NOT_FOUND'));
    }

    if (institution.status !== InstitutionStatus.APPROVED) {
      return next(
        new AuthorizationError(
          `Institution is not approved for issuing credentials (Current Status: ${institution.status})`,
          'INSTITUTION_NOT_APPROVED'
        )
      );
    }

    // Attach verified institution ID to user context
    req.user.institutionId = institution.id;
    next();
  } catch (error) {
    next(error);
  }
}
