import { describe, it, expect, vi, beforeEach } from 'vitest';
import argon2 from 'argon2';
import { authService } from '../src/modules/auth/auth.service.js';
import { adminService } from '../src/modules/admin/admin.service.js';
import { authenticate } from '../src/middleware/authenticate.js';
import { requireRole } from '../src/middleware/requireRole.js';
import { requireApprovedInstitution } from '../src/middleware/requireApprovedInstitution.js';
import { prisma } from '../src/db/prisma.js';
import {
  UserRole,
  InstitutionStatus,
  ApprovalAction,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  APP_CONSTANTS,
} from '@vericred/shared';
import { signAccessToken, signRefreshToken } from '../src/utils/token.js';
import type { Request, Response, NextFunction } from 'express';

// Mock Prisma
vi.mock('../src/db/prisma.js', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      institution: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      student: {
        findUnique: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      institutionApproval: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        return cb(prisma);
      }),
    },
  };
});

describe('VERICRED API - Authentication, RBAC & Admin Service Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AuthService - Registration', () => {
    it('successfully registers a user with Argon2id hash and issues JWT tokens', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockImplementation(({ data }: any) => {
        return Promise.resolve({
          id: 'usr-100',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          createdAt: new Date(),
        });
      });

      const result = await authService.register({
        email: 'student@rcciit.org',
        password: 'Password123!',
        firstName: 'Aarav',
        lastName: 'Sen',
        role: UserRole.STUDENT,
      });

      expect(result.user.email).toBe('student@rcciit.org');
      expect(result.user.role).toBe(UserRole.STUDENT);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'student@rcciit.org',
            firstName: 'Aarav',
            role: UserRole.STUDENT,
          }),
        })
      );
    });

    it('throws ValidationError if user with email already exists', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'existing-id',
        email: 'student@rcciit.org',
      });

      await expect(
        authService.register({
          email: 'student@rcciit.org',
          password: 'Password123!',
          firstName: 'Aarav',
          lastName: 'Sen',
          role: UserRole.STUDENT,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('AuthService - Login', () => {
    it('successfully logs in with valid password and returns token payload', async () => {
      const passwordHash = await argon2.hash('SecretPass123!', APP_CONSTANTS.ARGON2_PARAMS);

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'usr-admin-1',
        email: 'admin@vericred.network',
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        institution: null,
        student: null,
      });

      const result = await authService.login({
        email: 'admin@vericred.network',
        password: 'SecretPass123!',
      });

      expect(result.user.email).toBe('admin@vericred.network');
      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('throws AuthenticationError when password does not match', async () => {
      const passwordHash = await argon2.hash('CorrectPass!', APP_CONSTANTS.ARGON2_PARAMS);

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'usr-admin-1',
        email: 'admin@vericred.network',
        passwordHash,
        role: UserRole.ADMIN,
      });

      await expect(
        authService.login({
          email: 'admin@vericred.network',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('throws AuthenticationError when user is not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@vericred.network',
          password: 'Password123!',
        })
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('AuthService - Token Refresh', () => {
    it('successfully rotates tokens when given a valid refresh token', async () => {
      const refreshToken = signRefreshToken({
        userId: 'usr-stud-1',
        email: 'student@rcciit.org',
        role: UserRole.STUDENT,
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'usr-stud-1',
        email: 'student@rcciit.org',
        role: UserRole.STUDENT,
        institution: null,
        student: { id: 'stud-1' },
      });

      const tokens = await authService.refresh(refreshToken);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('throws AuthenticationError when given an invalid refresh token', async () => {
      await expect(authService.refresh('invalid-token')).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe('AuthService - Current User Profile', () => {
    it('retrieves user profile with student metadata', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'usr-stud-1',
        email: 'student@rcciit.org',
        firstName: 'Aarav',
        lastName: 'Sen',
        role: UserRole.STUDENT,
        createdAt: new Date(),
        student: {
          id: 'stud-1',
          enrollmentNumber: 'RCCIIT-CSE-2022-042',
          department: 'Computer Science and Engineering',
          batchYear: 2022,
          institutionId: 'inst-1',
        },
      });

      const profile = await authService.getCurrentUser('usr-stud-1');
      expect(profile.email).toBe('student@rcciit.org');
      expect(profile.student?.enrollmentNumber).toBe('RCCIIT-CSE-2022-042');
    });

    it('throws NotFoundError if user ID does not exist', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      await expect(authService.getCurrentUser('nonexistent')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('AdminService - Institution Approval Workflow', () => {
    it('retrieves all pending institutions', async () => {
      (prisma.institution.findMany as any).mockResolvedValue([
        {
          id: 'inst-1',
          legalName: 'RCC Institute of Information Technology',
          status: InstitutionStatus.PENDING,
          user: { email: 'admin@rcciit.org', firstName: 'Elena', lastName: 'Rostova' },
        },
      ]);

      const pending = await adminService.getPendingInstitutions();
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe(InstitutionStatus.PENDING);
    });

    it('approves an institution and writes an audit log in a transaction', async () => {
      (prisma.institution.findUnique as any).mockResolvedValue({
        id: 'inst-1',
        legalName: 'RCC Institute of Information Technology',
        shortCode: 'RCCIIT',
        status: InstitutionStatus.PENDING,
      });

      (prisma.institution.update as any).mockResolvedValue({
        id: 'inst-1',
        status: InstitutionStatus.APPROVED,
      });

      const result = await adminService.approveInstitution(
        'inst-1',
        'usr-admin-1',
        'Verified university accreditation documents'
      );

      expect(result.status).toBe(InstitutionStatus.APPROVED);
      expect(prisma.institutionApproval.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            institutionId: 'inst-1',
            reviewerId: 'usr-admin-1',
            action: ApprovalAction.APPROVE,
          }),
        })
      );
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'INSTITUTION_APPROVED',
            entityId: 'inst-1',
          }),
        })
      );
    });
  });

  describe('Middleware - authenticate', () => {
    it('successfully extracts and verifies Bearer token on request', async () => {
      const token = signAccessToken({
        userId: 'usr-1',
        email: 'test@vericred.org',
        role: UserRole.STUDENT,
      });

      const req = {
        headers: { authorization: `Bearer ${token}` },
        cookies: {},
      } as unknown as Request;
      const res = {} as Response;
      const next: NextFunction = vi.fn();

      await authenticate(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe('usr-1');
      expect(req.user?.role).toBe(UserRole.STUDENT);
      expect(next).toHaveBeenCalledWith();
    });

    it('passes AuthenticationError to next when authorization header is missing', async () => {
      const req = {
        headers: {},
        cookies: {},
      } as unknown as Request;
      const res = {} as Response;
      const next: NextFunction = vi.fn();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });
  });

  describe('Middleware - requireRole (RBAC)', () => {
    it('allows access when user has matching role', () => {
      const middleware = requireRole([UserRole.ADMIN]);
      const req = {
        user: { userId: 'usr-admin', email: 'admin@vericred.org', role: UserRole.ADMIN },
      } as unknown as Request;
      const res = {} as Response;
      const next: NextFunction = vi.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('blocks access with AuthorizationError when user has incorrect role', () => {
      const middleware = requireRole([UserRole.ADMIN]);
      const req = {
        user: { userId: 'usr-student', email: 'student@rcciit.org', role: UserRole.STUDENT },
      } as unknown as Request;
      const res = {} as Response;
      const next: NextFunction = vi.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });
  });

  describe('Middleware - requireApprovedInstitution', () => {
    it('allows access when institution is APPROVED', async () => {
      (prisma.institution.findFirst as any).mockResolvedValue({
        id: 'inst-1',
        status: InstitutionStatus.APPROVED,
      });

      const req = {
        user: {
          userId: 'usr-inst-1',
          email: 'inst@rcciit.org',
          role: UserRole.INSTITUTION,
          institutionId: 'inst-1',
        },
      } as unknown as Request;
      const res = {} as Response;
      const next: NextFunction = vi.fn();

      await requireApprovedInstitution(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('blocks access with AuthorizationError when institution is PENDING', async () => {
      (prisma.institution.findFirst as any).mockResolvedValue({
        id: 'inst-1',
        status: InstitutionStatus.PENDING,
      });

      const req = {
        user: {
          userId: 'usr-inst-1',
          email: 'inst@rcciit.org',
          role: UserRole.INSTITUTION,
          institutionId: 'inst-1',
        },
      } as unknown as Request;
      const res = {} as Response;
      const next: NextFunction = vi.fn();

      await requireApprovedInstitution(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(AuthorizationError));
    });
  });
});
