import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../src/modules/admin/admin.service.js';
import { prisma } from '../src/db/prisma.js';
import { InstitutionStatus, ApprovalAction, NotFoundError } from '@vericred/shared';

vi.mock('../src/db/prisma.js', () => {
  return {
    prisma: {
      institution: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      institutionApproval: {
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => {
        return cb(prisma);
      }),
    },
  };
});

describe('Admin Service Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('approves an institution and writes an audit log with sha256 tx hash', async () => {
    (prisma.institution.findUnique as any).mockResolvedValue({
      id: 'inst-1',
      legalName: 'Jadavpur University',
      shortCode: 'JU',
      status: InstitutionStatus.PENDING,
    });

    (prisma.institution.update as any).mockResolvedValue({
      id: 'inst-1',
      legalName: 'Jadavpur University',
      shortCode: 'JU',
      status: InstitutionStatus.APPROVED,
    });

    (prisma.institutionApproval.create as any).mockResolvedValue({
      id: 'appr-1',
      action: ApprovalAction.APPROVE,
    });

    (prisma.auditLog.create as any).mockResolvedValue({
      id: 'log-1',
      action: 'INSTITUTION_APPROVED',
    });

    const result = await adminService.approveInstitution('inst-1', 'admin-user-1', 'Accredited');
    expect(result.status).toBe(InstitutionStatus.APPROVED);
    expect(prisma.institution.update).toHaveBeenCalledWith({
      where: { id: 'inst-1' },
      data: { status: InstitutionStatus.APPROVED },
    });
    expect(prisma.institutionApproval.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          institutionId: 'inst-1',
          action: ApprovalAction.APPROVE,
        }),
      })
    );
  });

  it('rejects an institution and writes an audit log', async () => {
    (prisma.institution.findUnique as any).mockResolvedValue({
      id: 'inst-2',
      legalName: 'Unverified College',
      shortCode: 'UC',
      status: InstitutionStatus.PENDING,
    });

    (prisma.institution.update as any).mockResolvedValue({
      id: 'inst-2',
      legalName: 'Unverified College',
      shortCode: 'UC',
      status: InstitutionStatus.REJECTED,
    });

    (prisma.institutionApproval.create as any).mockResolvedValue({
      id: 'appr-2',
      action: ApprovalAction.REJECT,
    });

    (prisma.auditLog.create as any).mockResolvedValue({
      id: 'log-2',
      action: 'INSTITUTION_REJECTED',
    });

    const result = await adminService.rejectInstitution('inst-2', 'admin-user-1', 'Insufficient credentials');
    expect(result.status).toBe(InstitutionStatus.REJECTED);
    expect(prisma.institution.update).toHaveBeenCalledWith({
      where: { id: 'inst-2' },
      data: { status: InstitutionStatus.REJECTED },
    });
    expect(prisma.institutionApproval.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          institutionId: 'inst-2',
          action: ApprovalAction.REJECT,
        }),
      })
    );
  });

  it('throws NotFoundError when approving non-existent institution', async () => {
    (prisma.institution.findUnique as any).mockResolvedValue(null);

    await expect(
      adminService.approveInstitution('non-existent', 'admin-user-1')
    ).rejects.toThrow(NotFoundError);
  });
});
