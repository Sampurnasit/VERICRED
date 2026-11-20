import { describe, it, expect, vi, beforeAll } from 'vitest';
import path from 'path';
import * as snarkjs from 'snarkjs';
import { credentialService } from '../src/modules/credentials/credential.service.js';
import { presentationService } from '../src/modules/presentations/presentation.service.js';
import { verificationService } from '../src/modules/verification/verification.service.js';
import { prisma } from '../src/db/prisma.js';
import {
  UserRole,
  InstitutionStatus,
  CredentialStatus,
  VerificationResult,
  VerificationType,
} from '@vericred/shared';
import {
  generateIssuerKeyPair,
  signCommitment,
  computeAcademicCommitment,
  generateBlindingSalt,
  scaleCgpa,
  verifySignature,
} from '@vericred/crypto';
import {
  verifyAcademicCredential,
  verifyVerifiablePresentation,
} from '@vericred/credential-schema';

vi.mock('../src/db/prisma.js', () => ({
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
      update: vi.fn(),
    },
    credentialPresentation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationRequest: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('VERICRED Master Demonstration Scenarios 1–5 End-to-End Suite', { timeout: 60000 }, () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const wasmPath = path.resolve(rootDir, 'zk/build/CgpaThresholdValidator_js/CgpaThresholdValidator.wasm');
  const zkeyPath = path.resolve(rootDir, 'zk/build/circuit_final.zkey');

  let mockIssuerKeyPair: any;
  let issuedDbCredential: any;
  let issuedVerifiableCredential: any;
  let presentationOutput: any;
  let zkProofPayload: any;
  let zkPublicSignals: string[];

  beforeAll(async () => {
    mockIssuerKeyPair = await generateIssuerKeyPair();
  });

  // =========================================================================
  // SCENARIO 1: CREDENTIAL ISSUANCE
  // =========================================================================
  describe('Demonstration Scenario 1: Sovereign Academic Credential Issuance', () => {
    it('successfully issues W3C VC 2.0 with BabyJubjub dual-signature and Poseidon commitment', async () => {
      vi.mocked(prisma.institution.findUnique).mockResolvedValue({
        id: 'inst-rcciit-01',
        legalName: 'RCC Institute of Information Technology',
        shortCode: 'RCCIIT',
        blockchainAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
        status: InstitutionStatus.APPROVED,
      } as any);

      vi.mocked(prisma.student.findUnique).mockResolvedValue({
        id: 'stud-aarav-01',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
        user: { firstName: 'Aarav', lastName: 'Sen', email: 'aarav.sen@student.rcciit.ac.in' },
      } as any);

      vi.mocked(prisma.institutionKey.findFirst).mockResolvedValue({
        id: 'key-rcciit-01',
        institutionId: 'inst-rcciit-01',
        publicKeyX: mockIssuerKeyPair.publicKey.x,
        publicKeyY: mockIssuerKeyPair.publicKey.y,
        kmsKeyArn: mockIssuerKeyPair.privateKey,
        isActive: true,
      } as any);

      vi.mocked(prisma.credential.create).mockImplementation(({ data }: any) => {
        issuedDbCredential = {
          id: 'cred-aarav-btech-01',
          ...data,
          issuedAt: new Date(),
          student: {
            id: 'stud-aarav-01',
            userId: 'user-aarav-01',
            enrollmentNumber: 'RCCIIT-CSE-2022-042',
            user: { firstName: 'Aarav', lastName: 'Sen', email: 'aarav.sen@student.rcciit.ac.in' },
          },
          institution: {
            id: 'inst-rcciit-01',
            legalName: 'RCC Institute of Information Technology',
            shortCode: 'RCCIIT',
            blockchainAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
            keys: [{ publicKeyX: mockIssuerKeyPair.publicKey.x, publicKeyY: mockIssuerKeyPair.publicKey.y, isActive: true }],
          },
        };
        return issuedDbCredential;
      });

      const issuePayload = {
        studentId: 'stud-aarav-01',
        credentialType: 'DegreeCertificate' as const,
        degreeName: 'Bachelor of Technology',
        department: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.72,
      };

      const result = await credentialService.issueSingleCredential('inst-user-admin', issuePayload);
      issuedVerifiableCredential = result.verifiableCredential;

      // Verify Issuance Outputs
      expect(result.credential).toBeDefined();
      expect(result.credential.id).toBe('cred-aarav-btech-01');
      expect(result.credential.cgpaScaled).toBe(872); // 8.72 * 100 fixed-point
      expect(result.credential.status).toBe(CredentialStatus.ACTIVE);
      expect(result.credential.commitment).toBeDefined();
      expect(result.credential.blindingSalt).toBeDefined();
      expect(result.credential.signature).toBeDefined();

      // Verify Mathematical Poseidon Commitment C == Poseidon(872, s)
      const expectedCommitment = await computeAcademicCommitment(872, BigInt(result.credential.blindingSalt));
      expect(BigInt(result.credential.commitment)).toBe(expectedCommitment);

      // Verify BabyJubjub In-Circuit Signature
      const sigObj = JSON.parse(result.credential.signature);
      const isSigValid = await verifySignature(
        mockIssuerKeyPair.publicKey,
        expectedCommitment,
        sigObj
      );
      expect(isSigValid).toBe(true);

      // Verify W3C VC 2.0 Schema Conformance
      expect(issuedVerifiableCredential['@context']).toContain('https://www.w3.org/ns/credentials/v2');
      expect(issuedVerifiableCredential.credentialSubject.academicStanding.cgpaRaw).toBe(8.72);
      expect(issuedVerifiableCredential.credentialSubject.degreeName).toBe('Bachelor of Technology');
    });
  });

  // =========================================================================
  // SCENARIO 2: STANDARD QR PRESENTATION VERIFICATION
  // =========================================================================
  describe('Demonstration Scenario 2: Standard QR Presentation Verification & Selective Disclosure', () => {
    it('creates an ephemeral presentation with dynamic cryptographic nonce', async () => {
      vi.mocked(prisma.student.findUnique).mockResolvedValue({
        id: 'stud-aarav-01',
        userId: 'user-aarav-01',
        enrollmentNumber: 'RCCIIT-CSE-2022-042',
      } as any);

      vi.mocked(prisma.credential.findUnique).mockResolvedValue(issuedDbCredential);

      vi.mocked(prisma.credentialPresentation.create).mockImplementation(({ data }: any) => ({
        id: 'pres-token-abc123xyz',
        ...data,
      }));

      presentationOutput = await presentationService.createPresentation('user-aarav-01', {
        credentialId: issuedDbCredential.id,
        ttlMinutes: 15,
        discloseCgpa: true,
        discloseDepartment: true,
        discloseGraduationYear: true,
        discloseStudentName: true,
      });

      expect(presentationOutput).toBeDefined();
      expect(presentationOutput.presentationId).toBe('pres-token-abc123xyz');
      expect(presentationOutput.verifierNonce).toBeDefined();
      expect(presentationOutput.qrPayload).toContain('vericred://vp/');
      expect(presentationOutput.verifiablePresentation.type).toContain('VerifiablePresentation');
    });

    it('verifies standard presentation successfully across all 5 verification dimensions', async () => {
      vi.mocked(prisma.credential.findFirst).mockResolvedValue(issuedDbCredential);
      vi.mocked(prisma.verificationRequest.create).mockResolvedValue({ id: 'vr-std-01' } as any);

      const verifyResult = await verificationService.verifyPresentation(
        presentationOutput.verifiablePresentation
      );

      expect(verifyResult.isValid).toBe(true);
      expect(verifyResult.result).toBe(VerificationResult.VALID);
      expect(verifyResult.status).toBe('VERIFIED');
      expect(verifyResult.checks.schemaValid).toBe(true);
      expect(verifyResult.checks.signatureValid).toBe(true);
      expect(verifyResult.checks.commitmentValid).toBe(true);
      expect(verifyResult.checks.notRevoked).toBe(true);
      expect(verifyResult.credentialDetails?.degreeName).toBe('Bachelor of Technology');
      expect(verifyResult.credentialDetails?.cgpaRaw).toBe(8.72);
    });
  });

  // =========================================================================
  // SCENARIO 3: PRIVACY-PRESERVING ZERO-KNOWLEDGE PROOF VERIFICATION
  // =========================================================================
  describe('Demonstration Scenario 3: Privacy-Preserving Groth16 Zero-Knowledge Verification', () => {
    it('synthesizes authentic Groth16 proof (CGPA 8.72 >= 8.00) without revealing raw score', async () => {
      const scaledCgpa = scaleCgpa(8.72); // 872
      const salt = BigInt(issuedDbCredential.blindingSalt);
      const commitment = BigInt(issuedDbCredential.commitment);
      const sigObj = JSON.parse(issuedDbCredential.signature);

      const circuitInput = {
        commitment: commitment.toString(),
        threshold: '800', // Program requires CGPA >= 8.00
        issuerPubKeyX: mockIssuerKeyPair.publicKey.x,
        issuerPubKeyY: mockIssuerKeyPair.publicKey.y,
        scaledCgpa: scaledCgpa.toString(),
        salt: salt.toString(),
        sigR8x: sigObj.r8x,
        sigR8y: sigObj.r8y,
        sigS: sigObj.s,
      };

      const res = await snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath);
      zkProofPayload = res.proof;
      zkPublicSignals = res.publicSignals;

      expect(zkProofPayload).toBeDefined();
      expect(zkPublicSignals).toHaveLength(4);
      expect(zkPublicSignals[0]).toBe(commitment.toString());
      expect(zkPublicSignals[1]).toBe('800'); // Minimum threshold public signal
      expect(zkPublicSignals[2]).toBe(mockIssuerKeyPair.publicKey.x);
      expect(zkPublicSignals[3]).toBe(mockIssuerKeyPair.publicKey.y);
      // Ensure raw CGPA (8.72 / 872) is NOT present anywhere in public signals!
      expect(zkPublicSignals).not.toContain('872');
      expect(zkPublicSignals).not.toContain('8.72');
    });

    it('verifies Groth16 ZK proof cryptographically and resolves issuer and on-chain status', async () => {
      vi.mocked(prisma.institutionKey.findFirst).mockResolvedValue({
        id: 'key-rcciit-01',
        institutionId: 'inst-rcciit-01',
        publicKeyX: mockIssuerKeyPair.publicKey.x,
        publicKeyY: mockIssuerKeyPair.publicKey.y,
        isActive: true,
        institution: {
          legalName: 'RCC Institute of Information Technology',
          status: InstitutionStatus.APPROVED,
        },
      } as any);

      vi.mocked(prisma.credential.findFirst).mockResolvedValue({
        id: issuedDbCredential.id,
        commitment: issuedDbCredential.commitment,
        status: CredentialStatus.ACTIVE,
        institution: { legalName: 'RCC Institute of Information Technology' },
      } as any);

      vi.mocked(prisma.verificationRequest.create).mockResolvedValue({ id: 'vr-zk-01' } as any);

      const zkResult = await verificationService.verifyZkProof({
        proof: zkProofPayload,
        publicSignals: zkPublicSignals,
      });

      expect(zkResult.isValid).toBe(true);
      expect(zkResult.result).toBe(VerificationResult.VALID);
      expect(zkResult.status).toBe('VERIFIED');
      expect(zkResult.checks.groth16PairingValid).toBe(true);
      expect(zkResult.checks.thresholdSatisfied).toBe(true);
      expect(zkResult.checks.notRevoked).toBe(true);
      expect(zkResult.zkDetails.provenThreshold).toBe(8.0);
      expect(zkResult.zkDetails.issuerName).toBe('RCC Institute of Information Technology');
      // Verifier never receives raw CGPA
      expect((zkResult as any).cgpaRaw).toBeUndefined();
      expect((zkResult as any).scaledCgpa).toBeUndefined();
    });
  });

  // =========================================================================
  // SCENARIO 4: TAMPERING DETECTION & CRYPTOGRAPHIC DEFENSE
  // =========================================================================
  describe('Demonstration Scenario 4: Tampering Detection & Cryptographic Defense', () => {
    it('detects tampering in academic claim payload and rejects invalid signature', async () => {
      // Attacker tampers CGPA in academic standing claim while keeping original commitment & signature
      const tamperedVc = {
        ...issuedVerifiableCredential,
        credentialSubject: {
          ...issuedVerifiableCredential.credentialSubject,
          academicStanding: {
            ...issuedVerifiableCredential.credentialSubject.academicStanding,
            cgpaRaw: 9.99,
            cgpaScaled: 999, // Tampered score!
          },
        },
      };

      const verification = await verifyAcademicCredential(tamperedVc);
      expect(verification.isValid).toBe(false);
      expect(verification.error).toContain('Cryptographic commitment mismatch');
    });

    it('detects forged digital signature on credential payload', async () => {
      // Attacker alters signature value
      const forgedVc = {
        ...issuedVerifiableCredential,
        proof: {
          ...issuedVerifiableCredential.proof,
          signatureValue: {
            ...issuedVerifiableCredential.proof.signatureValue,
            s: '1234567890987654321', // Forged signature scalar
          },
        },
      };

      const verification = await verifyAcademicCredential(forgedVc);
      expect(verification.isValid).toBe(false);
      expect(verification.error).toContain('signature verification failed');
    });

    it('detects tampering of ZK public signals (e.g. forged threshold claim)', async () => {
      // Attacker claims proof proves CGPA >= 9.00 (900) instead of 8.00 (800)
      const tamperedSignals = [...zkPublicSignals];
      tamperedSignals[1] = '900';

      vi.mocked(prisma.institutionKey.findFirst).mockResolvedValue({
        id: 'key-rcciit-01',
        publicKeyX: mockIssuerKeyPair.publicKey.x,
        publicKeyY: mockIssuerKeyPair.publicKey.y,
        isActive: true,
        institution: { legalName: 'RCC Institute of Information Technology', status: InstitutionStatus.APPROVED },
      } as any);

      vi.mocked(prisma.credential.findFirst).mockResolvedValue({
        id: issuedDbCredential.id,
        commitment: issuedDbCredential.commitment,
        status: CredentialStatus.ACTIVE,
      } as any);

      const tamperedZkResult = await verificationService.verifyZkProof({
        proof: zkProofPayload,
        publicSignals: tamperedSignals,
      });

      expect(tamperedZkResult.isValid).toBe(false);
      expect(tamperedZkResult.result).toBe(VerificationResult.INVALID);
      expect(tamperedZkResult.error).toContain('Groth16 pairing check failed');
    });

    it('rejects ZK witness synthesis when student does not meet threshold (7.50 < 8.00)', async () => {
      const lowCgpa = scaleCgpa(7.50); // 750 < 800
      const salt = generateBlindingSalt();
      const commitment = await computeAcademicCommitment(lowCgpa, salt);
      const { signature } = await signCommitment(mockIssuerKeyPair.privateKey, commitment);

      const invalidInput = {
        commitment: commitment.toString(),
        threshold: '800', // Requires 8.00
        issuerPubKeyX: mockIssuerKeyPair.publicKey.x,
        issuerPubKeyY: mockIssuerKeyPair.publicKey.y,
        scaledCgpa: lowCgpa.toString(),
        salt: salt.toString(),
        sigR8x: signature.r8x,
        sigR8y: signature.r8y,
        sigS: signature.s,
      };

      // In-circuit GreaterEqThan constraint must reject witness generation
      await expect(
        snarkjs.groth16.fullProve(invalidInput, wasmPath, zkeyPath)
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // SCENARIO 5: DYNAMIC REVOCATION
  // =========================================================================
  describe('Demonstration Scenario 5: Dynamic Revocation & Immediate Invalidation', () => {
    it('revokes credential with reason code and records revocation in database', async () => {
      vi.mocked(prisma.institution.findUnique).mockResolvedValue({
        id: 'inst-rcciit-01',
        userId: 'inst-user-admin',
      } as any);

      vi.mocked(prisma.credential.findFirst).mockResolvedValue(issuedDbCredential);
      vi.mocked(prisma.credential.update).mockImplementation(({ where, data }: any) => {
        issuedDbCredential = {
          ...issuedDbCredential,
          status: CredentialStatus.REVOKED,
          revocationReason: data.revocationReason,
          revokedAt: new Date(),
        };
        return issuedDbCredential;
      });

      const revokeResult = await credentialService.revokeCredential('inst-user-admin', {
        credentialId: issuedDbCredential.id,
        revocationReason: 'DISCIPLINARY',
      });

      expect(revokeResult).toBeDefined();
      expect(revokeResult.status).toBe(CredentialStatus.REVOKED);
    });

    it('immediately rejects standard QR presentation verification after revocation', async () => {
      // Re-query finds credential now REVOKED
      vi.mocked(prisma.credential.findFirst).mockResolvedValue(issuedDbCredential);

      const verifyRevoked = await verificationService.verifyPresentation(
        presentationOutput.verifiablePresentation
      );

      expect(verifyRevoked.isValid).toBe(false);
      expect(verifyRevoked.result).toBe(VerificationResult.REVOKED);
      expect(verifyRevoked.error).toContain('revoked');
    });

    it('immediately rejects zero-knowledge proof verification when commitment is revoked', async () => {
      vi.mocked(prisma.institutionKey.findFirst).mockResolvedValue({
        id: 'key-rcciit-01',
        publicKeyX: mockIssuerKeyPair.publicKey.x,
        publicKeyY: mockIssuerKeyPair.publicKey.y,
        isActive: true,
        institution: { legalName: 'RCC Institute of Information Technology', status: InstitutionStatus.APPROVED },
      } as any);

      // Commitment found to be REVOKED
      vi.mocked(prisma.credential.findFirst).mockResolvedValue({
        id: issuedDbCredential.id,
        commitment: issuedDbCredential.commitment,
        status: CredentialStatus.REVOKED,
        revocationReason: 'DISCIPLINARY',
      } as any);

      const zkRevokedResult = await verificationService.verifyZkProof({
        proof: zkProofPayload,
        publicSignals: zkPublicSignals,
      });

      expect(zkRevokedResult.isValid).toBe(false);
      expect(zkRevokedResult.result).toBe(VerificationResult.REVOKED);
      expect(zkRevokedResult.error).toContain('revoked');
    });
  });
});
