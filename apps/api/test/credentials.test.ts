import { describe, it, expect, vi, beforeEach } from 'vitest';
import { credentialService } from '../src/modules/credentials/credential.service.js';
import { presentationService } from '../src/modules/presentations/presentation.service.js';
import { verificationService } from '../src/modules/verification/verification.service.js';
import { prisma } from '../src/db/prisma.js';
import {
  UserRole,
  InstitutionStatus,
  CredentialStatus,
  VerificationResult,
} from '@vericred/shared';
import { generateIssuerKeyPair, computeAcademicCommitment, scaleCgpa } from '@vericred/crypto';
import { createAcademicCredential } from '@vericred/credential-schema';

// Mock Prisma
vi.mock('../src/db/prisma.js', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      institution: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      institutionKey: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      student: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      credential: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
      },
      credentialPresentation: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
      verificationRequest: {
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    },
  };
});

describe('VERICRED API - Credential Issuance, Presentation & Verification Suite', { timeout: 30000 }, () => {
  let mockKeyPair: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    if (!mockKeyPair) {
      mockKeyPair = await generateIssuerKeyPair();
    }
  });

  describe('CredentialService - Single Issuance', () => {
    it('issues a valid W3C VC 2.0 credential with BabyJubjub signature and Poseidon commitment', async () => {
      (prisma.institution.findUnique as any).mockResolvedValue({
        id: 'inst-1',
        legalName: 'RCC Institute of Information Technology',
        shortCode: 'RCCIIT',
        blockchainAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
        status: InstitutionStatus.APPROVED,
      });

      (prisma.student.findUnique as any).mockResolvedValue({
        id: 'stud-1',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
        user: { firstName: 'Aarav', lastName: 'Sen', email: 'aarav@rcciit.org' },
      });

      (prisma.institutionKey.findFirst as any).mockResolvedValue({
        id: 'key-1',
        institutionId: 'inst-1',
        publicKeyX: mockKeyPair.publicKey.x,
        publicKeyY: mockKeyPair.publicKey.y,
        kmsKeyArn: mockKeyPair.privateKey,
        isActive: true,
      });

      (prisma.credential.create as any).mockImplementation(({ data }: any) => ({
        id: 'cred-1',
        ...data,
        student: { user: { firstName: 'Aarav', lastName: 'Sen', email: 'aarav@rcciit.org' } },
        institution: { legalName: 'RCC Institute of Information Technology', shortCode: 'RCCIIT' },
      }));

      const result = await credentialService.issueSingleCredential('inst-user-1', {
        studentId: 'stud-1',
        credentialType: 'DegreeCertificate',
        degreeName: 'Bachelor of Technology',
        department: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.72,
      });

      expect(result.credential).toBeDefined();
      expect(result.verifiableCredential).toBeDefined();

      // Check W3C structure
      expect(result.verifiableCredential['@context']).toContain('https://www.w3.org/ns/credentials/v2');
      expect(result.verifiableCredential.type).toContain('AcademicDegreeCredential');

      // Check Cryptographic Attributes
      const { academicStanding } = result.verifiableCredential.credentialSubject;
      expect(academicStanding.cgpaRaw).toBe(8.72);
      expect(academicStanding.cgpaScaled).toBe(872);
      expect(academicStanding.commitment).toBeDefined();
      expect(result.verifiableCredential.proof.type).toBe('BabyJubjubPoseidonProof2026');
      expect(result.verifiableCredential.proof.signatureValue.s).toBeDefined();

      // Check DB persistence call
      expect(prisma.credential.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cgpaScaled: 872,
            studentId: 'stud-1',
            institutionId: 'inst-1',
          }),
        })
      );
    });
  });

  describe('CredentialService - Bulk Issuance', () => {
    it('successfully bulk-issues multiple credentials from parsed CSV rows', async () => {
      (prisma.institution.findUnique as any).mockResolvedValue({
        id: 'inst-1',
        legalName: 'RCC Institute of Information Technology',
        shortCode: 'RCCIIT',
        blockchainAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
        status: InstitutionStatus.APPROVED,
      });

      (prisma.institutionKey.findFirst as any).mockResolvedValue({
        id: 'key-1',
        publicKeyX: mockKeyPair.publicKey.x,
        publicKeyY: mockKeyPair.publicKey.y,
        kmsKeyArn: mockKeyPair.privateKey,
        isActive: true,
      });

      (prisma.student.findUnique as any).mockResolvedValue(null);
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'usr-diya' });
      (prisma.student.create as any).mockImplementation(({ data }: any) => ({
        id: 'stud-new',
        ...data,
      }));

      (prisma.credential.create as any).mockImplementation(({ data }: any) => ({
        id: `cred-${Math.random()}`,
        ...data,
      }));

      const records = [
        {
          enrollmentNumber: 'RCCIIT-IT-2022-019',
          studentName: 'Diya Roy',
          studentEmail: 'diya@rcciit.org',
          degreeName: 'B.Tech Information Technology',
          department: 'Information Technology',
          graduationYear: 2026,
          cgpa: 9.1,
        },
      ];

      const result = await credentialService.issueBulkCredentials('inst-user-1', records);
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(prisma.credential.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('PresentationService - Selective Disclosure Generation', () => {
    it('generates a presentation that conceals raw CGPA while maintaining commitment', async () => {
      (prisma.student.findUnique as any).mockResolvedValue({
        id: 'stud-1',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
      });

      const commitment = await computeAcademicCommitment(872, BigInt('12345678901234567890'));

      (prisma.credential.findUnique as any).mockResolvedValue({
        id: 'cred-1',
        credentialId: 'urn:uuid:cred-1',
        studentId: 'stud-1',
        degreeName: 'B.Tech Computer Science',
        department: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpaRaw: '8.72',
        cgpaScaled: 872,
        blindingSalt: '12345678901234567890',
        commitment: commitment.toString(),
        signature: JSON.stringify({ r8x: '123', r8y: '456', s: '789' }),
        issuedAt: new Date(),
        institution: {
          legalName: 'RCC Institute of Information Technology',
          shortCode: 'RCCIIT',
          blockchainAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
          keys: [{ publicKeyX: mockKeyPair.publicKey.x, publicKeyY: mockKeyPair.publicKey.y, isActive: true }],
        },
      });

      (prisma.credentialPresentation.create as any).mockImplementation(({ data }: any) => ({
        id: 'pres-1',
        ...data,
      }));

      const result = await presentationService.createPresentation('stud-user-1', {
        credentialId: 'cred-1',
        discloseCgpa: false, // Conceal exact CGPA
        discloseDepartment: true,
        discloseGraduationYear: true,
        discloseStudentName: true,
        ttlMinutes: 15,
      });

      expect(result.presentationId).toBe('pres-1');
      expect(result.verifierNonce).toBeDefined();
      expect(result.qrPayload).toContain('vericred://vp/');

      const presentationVc = result.verifiablePresentation.verifiableCredential[0];
      // Raw CGPA is redacted
      expect(presentationVc.credentialSubject.academicStanding.cgpaRaw).toBeUndefined();
      expect(presentationVc.credentialSubject.academicStanding.blindingSalt).toBe('REDACTED_ZK_CONCEALED');
      // Cryptographic commitment remains
      expect(presentationVc.credentialSubject.academicStanding.commitment).toBe(commitment.toString());
    });
  });

  describe('VerificationService - End-to-End Cryptographic Verification', () => {
    it('successfully verifies an authentic W3C VC 2.0 credential', async () => {
      const vc = await createAcademicCredential({
        studentId: 'stud-1',
        studentName: 'Aarav Sen',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
        degreeName: 'Bachelor of Technology',
        department: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.72,
        issuer: {
          id: 'did:vericred:institution:rcciit',
          name: 'RCC Institute of Information Technology',
          ethereumAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
          publicKeyX: mockKeyPair.publicKey.x,
          publicKeyY: mockKeyPair.publicKey.y,
          privateKey: mockKeyPair.privateKey,
        },
      });

      const verification = await verificationService.verifyDirectCredential(vc);
      expect(verification.isValid).toBe(true);
      expect(verification.result).toBe(VerificationResult.VALID);
      expect(verification.checks.signatureValid).toBe(true);
      expect(verification.checks.commitmentValid).toBe(true);
    });

    it('rejects a credential if academic claims have been tampered with', async () => {
      const vc = await createAcademicCredential({
        studentId: 'stud-1',
        studentName: 'Aarav Sen',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
        degreeName: 'Bachelor of Technology',
        department: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.72,
        issuer: {
          id: 'did:vericred:institution:rcciit',
          name: 'RCC Institute of Information Technology',
          ethereumAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
          publicKeyX: mockKeyPair.publicKey.x,
          publicKeyY: mockKeyPair.publicKey.y,
          privateKey: mockKeyPair.privateKey,
        },
      });

      // Attacker tampers with CGPA (e.g. changing 872 to 999)
      vc.credentialSubject.academicStanding.cgpaScaled = 999;

      const verification = await verificationService.verifyDirectCredential(vc);
      expect(verification.isValid).toBe(false);
      expect(verification.result).toBe(VerificationResult.INVALID);
      expect(verification.error).toContain('Cryptographic commitment mismatch');
    });

    it('rejects a revoked credential', async () => {
      const vc = await createAcademicCredential({
        studentId: 'stud-1',
        studentName: 'Aarav Sen',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
        degreeName: 'Bachelor of Technology',
        department: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.72,
        issuer: {
          id: 'did:vericred:institution:rcciit',
          name: 'RCC Institute of Information Technology',
          ethereumAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
          publicKeyX: mockKeyPair.publicKey.x,
          publicKeyY: mockKeyPair.publicKey.y,
          privateKey: mockKeyPair.privateKey,
        },
      });

      (prisma.credential.findFirst as any).mockResolvedValue({
        id: 'cred-1',
        commitment: vc.credentialSubject.academicStanding.commitment,
        status: CredentialStatus.REVOKED,
      });

      const presentation = {
        '@context': ['https://www.w3.org/ns/credentials/v2'],
        id: 'urn:uuid:pres-revoked',
        type: ['VerifiablePresentation'],
        holder: 'did:vericred:student:stud-1',
        verifierNonce: 'nonce-123',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        verifiableCredential: [vc],
        selectiveDisclosure: {
          discloseStudentName: true,
          discloseDepartment: true,
          discloseGraduationYear: true,
          discloseRawCgpa: true,
        },
      };

      const result = await verificationService.verifyPresentation(presentation as any);
      expect(result.isValid).toBe(false);
      expect(result.result).toBe(VerificationResult.REVOKED);
      expect(result.error).toContain('revoked');
    });
  });
});
