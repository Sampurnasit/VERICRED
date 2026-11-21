import crypto from 'node:crypto';
import argon2 from 'argon2';
import { prisma } from '../../db/prisma.js';
import {
  InstitutionStatus,
  ApprovalAction,
  NotFoundError,
  ValidationError,
  UserRole,
  APP_CONSTANTS,
} from '@vericred/shared';

export class AdminService {
  async getPendingInstitutions() {
    return prisma.institution.findMany({
      where: { status: InstitutionStatus.PENDING },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllInstitutions() {
    return prisma.institution.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        keys: { where: { isActive: true } },
        _count: { select: { credentials: true, students: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveInstitution(institutionId: string, reviewerId: string, decisionNotes = 'Approved by administrator') {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundError('Institution', institutionId);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inst = await tx.institution.update({
        where: { id: institutionId },
        data: { status: InstitutionStatus.APPROVED },
      });

      const onChainTxHash = `0x${crypto.createHash('sha256').update(`approve:${institutionId}:${Date.now()}`).digest('hex')}`;

      await tx.institutionApproval.create({
        data: {
          institutionId,
          reviewerId,
          action: ApprovalAction.APPROVE,
          decisionNotes,
          onChainTxHash,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: reviewerId,
          action: 'INSTITUTION_APPROVED',
          entityType: 'Institution',
          entityId: institutionId,
          ipAddress: '127.0.0.1',
          metadata: { legalName: institution.legalName, shortCode: institution.shortCode, onChainTxHash },
        },
      });

      return inst;
    });

    return updated;
  }

  async rejectInstitution(institutionId: string, reviewerId: string, decisionNotes = 'Rejected by administrator') {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundError('Institution', institutionId);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inst = await tx.institution.update({
        where: { id: institutionId },
        data: { status: InstitutionStatus.REJECTED },
      });

      await tx.institutionApproval.create({
        data: {
          institutionId,
          reviewerId,
          action: ApprovalAction.REJECT,
          decisionNotes,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: reviewerId,
          action: 'INSTITUTION_REJECTED',
          entityType: 'Institution',
          entityId: institutionId,
          ipAddress: '127.0.0.1',
          metadata: { legalName: institution.legalName, shortCode: institution.shortCode },
        },
      });

      return inst;
    });

    return updated;
  }

  async suspendInstitution(institutionId: string, reviewerId: string, decisionNotes = 'Suspended by administrator') {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundError('Institution', institutionId);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const inst = await tx.institution.update({
        where: { id: institutionId },
        data: { status: InstitutionStatus.SUSPENDED },
      });

      await tx.institutionApproval.create({
        data: {
          institutionId,
          reviewerId,
          action: ApprovalAction.SUSPEND,
          decisionNotes,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: reviewerId,
          action: 'INSTITUTION_SUSPENDED',
          entityType: 'Institution',
          entityId: institutionId,
          ipAddress: '127.0.0.1',
          metadata: { legalName: institution.legalName },
        },
      });

      return inst;
    });

    return updated;
  }

  async createInstitution(
    reviewerId: string,
    input: {
      legalName: string;
      shortCode: string;
      email: string;
      blockchainAddress?: string;
      website?: string;
    }
  ) {
    if (!input.legalName || !input.shortCode) {
      throw new ValidationError('Institution legal name and short code are required');
    }

    const email = (input.email || `${input.shortCode.toLowerCase()}@university.edu`).toLowerCase();
    let instUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!instUser) {
      const passwordHash = await argon2.hash('InstitutePass123!', APP_CONSTANTS.ARGON2_PARAMS);
      instUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: input.shortCode,
          lastName: 'Registrar',
          role: UserRole.INSTITUTION,
          isEmailVerified: true,
        },
      });
    }

    const shortCode = input.shortCode.toUpperCase();
    const blockchainAddress =
      input.blockchainAddress &&
      input.blockchainAddress.startsWith('0x') &&
      input.blockchainAddress.length === 42
        ? input.blockchainAddress
        : `0x${crypto.randomBytes(20).toString('hex')}`;

    const existingInst = await prisma.institution.findFirst({
      where: {
        OR: [{ shortCode }, { legalName: input.legalName }, { userId: instUser.id }],
      },
    });

    if (existingInst) {
      throw new ValidationError('An institution with this short code, name, or email already exists');
    }

    const institution = await prisma.$transaction(async (tx) => {
      const inst = await tx.institution.create({
        data: {
          userId: instUser.id,
          legalName: input.legalName,
          shortCode,
          website: input.website || `https://${shortCode.toLowerCase()}.edu`,
          blockchainAddress,
          status: InstitutionStatus.APPROVED,
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          _count: { select: { credentials: true, students: true } },
        },
      });

      const onChainTxHash = `0x${crypto.createHash('sha256').update(`accredit:${inst.id}:${Date.now()}`).digest('hex')}`;

      await tx.institutionApproval.create({
        data: {
          institutionId: inst.id,
          reviewerId,
          action: ApprovalAction.APPROVE,
          decisionNotes: 'Accredited by consortium administrator',
          onChainTxHash,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: reviewerId,
          action: 'INSTITUTION_APPROVED',
          entityType: 'Institution',
          entityId: inst.id,
          ipAddress: '127.0.0.1',
          metadata: { legalName: inst.legalName, shortCode: inst.shortCode, onChainTxHash },
        },
      });

      return inst;
    });

    return institution;
  }

  async getAuditLogs(limit = 100) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { email: true, firstName: true, lastName: true, role: true } },
      },
    });
  }
}

export const adminService = new AdminService();
