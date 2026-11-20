import { prisma } from '../../db/prisma.js';
import { RegisterInstitutionInput, InstitutionStatus, ValidationError, NotFoundError } from '@vericred/shared';

export class InstitutionService {
  async register(userId: string, input: RegisterInstitutionInput) {
    const existing = await prisma.institution.findFirst({
      where: {
        OR: [
          { userId },
          { legalName: input.legalName },
          { shortCode: input.shortCode },
          { blockchainAddress: input.blockchainAddress },
        ],
      },
    });

    if (existing) {
      throw new ValidationError(
        'An institution with this user, name, short code, or blockchain address already exists'
      );
    }

    const institution = await prisma.institution.create({
      data: {
        userId,
        legalName: input.legalName,
        shortCode: input.shortCode.toUpperCase(),
        website: input.website,
        blockchainAddress: input.blockchainAddress,
        accreditationDocUrl: input.accreditationDocUrl,
        status: InstitutionStatus.PENDING,
      },
    });

    return institution;
  }

  async getProfile(userId: string) {
    const institution = await prisma.institution.findUnique({
      where: { userId },
      include: {
        keys: { where: { isActive: true } },
        _count: { select: { credentials: true, students: true } },
      },
    });

    if (!institution) {
      throw new NotFoundError('Institution profile for user', userId);
    }

    return institution;
  }
}

export const institutionService = new InstitutionService();
