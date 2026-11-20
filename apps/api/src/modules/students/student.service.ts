import { prisma } from '../../db/prisma.js';
import { NotFoundError } from '@vericred/shared';

export class StudentService {
  async getProfile(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        institution: {
          select: {
            id: true,
            legalName: true,
            shortCode: true,
            website: true,
          },
        },
        credentials: {
          select: {
            id: true,
            credentialId: true,
            credentialType: true,
            degreeName: true,
            department: true,
            graduationYear: true,
            status: true,
            issuedAt: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Student profile for user', userId);
    }

    return student;
  }
}

export const studentService = new StudentService();
