import argon2 from 'argon2';
import { prisma } from '../../db/prisma.js';
import {
  RegisterInstitutionInput,
  InstitutionStatus,
  ValidationError,
  NotFoundError,
  UserRole,
  APP_CONSTANTS,
} from '@vericred/shared';

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

  async getStudents(userId: string) {
    const institution = await prisma.institution.findUnique({
      where: { userId },
    });

    if (!institution) {
      throw new NotFoundError('Institution profile for user', userId);
    }

    const students = await prisma.student.findMany({
      where: { institutionId: institution.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        credentials: {
          select: {
            id: true,
            status: true,
            degreeName: true,
            cgpaRaw: true,
            issuedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return students;
  }

  async enrollStudent(
    userId: string,
    input: {
      firstName: string;
      lastName: string;
      email: string;
      enrollmentNumber: string;
      department: string;
      batchYear: number;
    }
  ) {
    const institution = await prisma.institution.findUnique({
      where: { userId },
    });

    if (!institution) {
      throw new NotFoundError('Institution profile for user', userId);
    }

    const email = input.email.toLowerCase();
    let studentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!studentUser) {
      const passwordHash = await argon2.hash('StudentPass123!', APP_CONSTANTS.ARGON2_PARAMS);
      studentUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: UserRole.STUDENT,
          isEmailVerified: true,
        },
      });
    }

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { userId: studentUser.id },
          { enrollmentNumber: input.enrollmentNumber },
        ],
      },
    });

    if (existingStudent) {
      throw new ValidationError('A student with this email or enrollment number already exists');
    }

    const student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        institutionId: institution.id,
        enrollmentNumber: input.enrollmentNumber,
        department: input.department,
        batchYear: input.batchYear,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        credentials: {
          select: {
            id: true,
            status: true,
            degreeName: true,
            cgpaRaw: true,
            issuedAt: true,
          },
        },
      },
    });

    return student;
  }
}

export const institutionService = new InstitutionService();
