import { describe, it, expect, vi, beforeEach } from 'vitest';
import { institutionService } from '../src/modules/institutions/institution.service.js';
import { prisma } from '../src/db/prisma.js';
import { UserRole, InstitutionStatus, ValidationError, NotFoundError } from '@vericred/shared';

vi.mock('../src/db/prisma.js', () => {
  return {
    prisma: {
      institution: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      student: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

describe('Institution Service Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enrolls a new student with auto-created user and student profile', async () => {
    (prisma.institution.findUnique as any).mockResolvedValue({
      id: 'inst-1',
      userId: 'user-inst-1',
      legalName: 'RCC Institute of Information Technology',
      shortCode: 'RCCIIT',
    });

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'new-user-id',
      email: 'sourav.m@student.rcciit.ac.in',
      firstName: 'Sourav',
      lastName: 'Mukherjee',
      role: UserRole.STUDENT,
    });

    (prisma.student.findFirst as any).mockResolvedValue(null);
    (prisma.student.create as any).mockResolvedValue({
      id: 'student-profile-1',
      userId: 'new-user-id',
      institutionId: 'inst-1',
      enrollmentNumber: 'RCCIIT-CSE-2023-099',
      department: 'Computer Science & Engineering',
      batchYear: 2023,
      user: {
        firstName: 'Sourav',
        lastName: 'Mukherjee',
        email: 'sourav.m@student.rcciit.ac.in',
      },
      credentials: [],
    });

    const student = await institutionService.enrollStudent('user-inst-1', {
      firstName: 'Sourav',
      lastName: 'Mukherjee',
      email: 'sourav.m@student.rcciit.ac.in',
      enrollmentNumber: 'RCCIIT-CSE-2023-099',
      department: 'Computer Science & Engineering',
      batchYear: 2023,
    });

    expect(student).toBeDefined();
    expect(student.enrollmentNumber).toBe('RCCIIT-CSE-2023-099');
    expect(student.user.firstName).toBe('Sourav');
  });

  it('rejects student enrollment if institution does not exist', async () => {
    (prisma.institution.findUnique as any).mockResolvedValue(null);

    await expect(
      institutionService.enrollStudent('unknown-user', {
        firstName: 'Sourav',
        lastName: 'Mukherjee',
        email: 'sourav.m@student.rcciit.ac.in',
        enrollmentNumber: 'RCCIIT-CSE-2023-099',
        department: 'Computer Science & Engineering',
        batchYear: 2023,
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('rejects student enrollment if enrollment number already exists', async () => {
    (prisma.institution.findUnique as any).mockResolvedValue({
      id: 'inst-1',
      userId: 'user-inst-1',
    });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'existing-user',
      email: 'sourav.m@student.rcciit.ac.in',
    });

    (prisma.student.findFirst as any).mockResolvedValue({
      id: 'existing-student',
      enrollmentNumber: 'RCCIIT-CSE-2023-099',
    });

    await expect(
      institutionService.enrollStudent('user-inst-1', {
        firstName: 'Sourav',
        lastName: 'Mukherjee',
        email: 'sourav.m@student.rcciit.ac.in',
        enrollmentNumber: 'RCCIIT-CSE-2023-099',
        department: 'Computer Science & Engineering',
        batchYear: 2023,
      })
    ).rejects.toThrow(ValidationError);
  });
});
