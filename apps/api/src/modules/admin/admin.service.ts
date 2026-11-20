import { prisma } from '../../db/prisma.js';
import { InstitutionStatus, ApprovalAction, NotFoundError } from '@vericred/shared';

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

      await tx.institutionApproval.create({
        data: {
          institutionId,
          reviewerId,
          action: ApprovalAction.APPROVE,
          decisionNotes,
          onChainTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Mocked in dev
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: reviewerId,
          action: 'INSTITUTION_APPROVED',
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
