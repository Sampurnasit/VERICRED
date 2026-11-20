import argon2 from 'argon2';
import { prisma } from '../../db/prisma.js';
import {
  RegisterUserInput,
  LoginUserInput,
  UserRole,
  APP_CONSTANTS,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from '@vericred/shared';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../utils/token.js';

export class AuthService {
  async register(input: RegisterUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ValidationError('A user with this email address already exists');
    }

    const passwordHash = await argon2.hash(input.password, APP_CONSTANTS.ARGON2_PARAMS);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        isEmailVerified: true, // Auto-verify for MVP
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginUserInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        institution: true,
        student: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      institutionId: user.institution?.id,
      studentId: user.student?.id,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const sanitizedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      institution: user.institution
        ? {
            id: user.institution.id,
            legalName: user.institution.legalName,
            status: user.institution.status,
          }
        : undefined,
      student: user.student
        ? {
            id: user.student.id,
            enrollmentNumber: user.student.enrollmentNumber,
          }
        : undefined,
    };

    return { user: sanitizedUser, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { institution: true, student: true },
      });

      if (!user) {
        throw new AuthenticationError('User no longer exists', 'AUTH_USER_NOT_FOUND');
      }

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as UserRole,
        institutionId: user.institution?.id,
        studentId: user.student?.id,
      };

      const newAccessToken = signAccessToken(newPayload);
      const newRefreshToken = signRefreshToken(newPayload);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token', 'AUTH_INVALID_REFRESH_TOKEN');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        institution: {
          select: {
            id: true,
            legalName: true,
            shortCode: true,
            status: true,
            blockchainAddress: true,
          },
        },
        student: {
          select: {
            id: true,
            enrollmentNumber: true,
            department: true,
            batchYear: true,
            institutionId: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }
}

export const authService = new AuthService();
