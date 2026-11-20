import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import * as snarkjs from 'snarkjs';
import { verificationService } from '../src/modules/verification/verification.service.js';
import { prisma } from '../src/db/prisma.js';
import { VerificationType, VerificationResult, CredentialStatus, InstitutionStatus } from '@vericred/shared';
import {
  generateIssuerKeyPair,
  signCommitment,
  computeAcademicCommitment,
  generateBlindingSalt,
  scaleCgpa,
} from '@vericred/crypto';

vi.mock('../src/db/prisma.js', () => ({
  prisma: {
    institution: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    institutionKey: {
      findFirst: vi.fn(),
    },
    credential: {
      findFirst: vi.fn(),
    },
    verificationRequest: {
      create: vi.fn(),
    },
  },
}));

describe('VerificationService - Zero Knowledge Groth16 Proof Verification', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const wasmPath = path.resolve(rootDir, 'zk/build/CgpaThresholdValidator_js/CgpaThresholdValidator.wasm');
  const zkeyPath = path.resolve(rootDir, 'zk/build/circuit_final.zkey');

  let issuer: any;
  let validProof: any;
  let validPublicSignals: string[];
  let commitmentStr: string;

  beforeAll(async () => {
    // Generate valid proof once for tests
    issuer = await generateIssuerKeyPair();
    const scaledCgpa = scaleCgpa(8.72);
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);
    commitmentStr = commitment.toString();

    const { signature } = await signCommitment(issuer.privateKey, commitment);

    const circuitInput = {
      commitment: commitmentStr,
      threshold: '800', // 8.00
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    const res = await snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath);
    validProof = res.proof;
    validPublicSignals = res.publicSignals;
  }, 30000);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully verifies authentic Groth16 ZK proof when threshold is met', async () => {
    vi.mocked(prisma.institutionKey.findFirst).mockResolvedValue({
      id: 'key-1',
      institutionId: 'inst-1',
      publicKeyX: issuer.publicKey.x,
      publicKeyY: issuer.publicKey.y,
      isActive: true,
      institution: {
        legalName: 'RCC Institute of Information Technology',
        status: InstitutionStatus.APPROVED,
      },
    } as any);

    vi.mocked(prisma.credential.findFirst).mockResolvedValue({
      id: 'cred-1',
      commitment: commitmentStr,
      status: CredentialStatus.ACTIVE,
      institution: {
        legalName: 'RCC Institute of Information Technology',
      },
    } as any);

    vi.mocked(prisma.verificationRequest.create).mockResolvedValue({ id: 'vr-1' } as any);

    const result = await verificationService.verifyZkProof({
      proof: validProof,
      publicSignals: validPublicSignals,
      requiredThreshold: 8.00,
    });

    expect(result.isValid).toBe(true);
    expect(result.result).toBe(VerificationResult.VALID);
    expect(result.status).toBe('VERIFIED');
    expect(result.zkDetails?.provenThreshold).toBe(8.00);
    expect(result.checks.groth16PairingValid).toBe(true);

    expect(prisma.verificationRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        verificationType: VerificationType.ZK_PROOF,
        resultStatus: VerificationResult.VALID,
      }),
    });
  });

  it('rejects verification when proven threshold is below required verifier threshold', async () => {
    const result = await verificationService.verifyZkProof({
      proof: validProof,
      publicSignals: validPublicSignals,
      requiredThreshold: 8.50, // Proven is 8.00 < 8.50
    });

    expect(result.isValid).toBe(false);
    expect(result.result).toBe(VerificationResult.INVALID);
    expect(result.error).toContain('below the required threshold');
  });

  it('rejects verification and flags REVOKED status when commitment was revoked', async () => {
    vi.mocked(prisma.institutionKey.findFirst).mockResolvedValue({
      id: 'key-1',
      institutionId: 'inst-1',
      publicKeyX: issuer.publicKey.x,
      publicKeyY: issuer.publicKey.y,
      isActive: true,
      institution: {
        legalName: 'RCC Institute of Information Technology',
        status: InstitutionStatus.APPROVED,
      },
    } as any);

    vi.mocked(prisma.credential.findFirst).mockResolvedValue({
      id: 'cred-1',
      commitment: commitmentStr,
      status: CredentialStatus.REVOKED,
    } as any);

    vi.mocked(prisma.verificationRequest.create).mockResolvedValue({ id: 'vr-2' } as any);

    const result = await verificationService.verifyZkProof({
      proof: validProof,
      publicSignals: validPublicSignals,
      requiredThreshold: 8.00,
    });

    expect(result.isValid).toBe(false);
    expect(result.result).toBe(VerificationResult.REVOKED);
    expect(result.error).toContain('credential has been revoked');

    expect(prisma.verificationRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        verificationType: VerificationType.ZK_PROOF,
        resultStatus: VerificationResult.REVOKED,
      }),
    });
  });

  it('rejects verification when cryptographic pairing fails on tampered public signals', async () => {
    vi.mocked(prisma.verificationRequest.create).mockResolvedValue({ id: 'vr-3' } as any);

    // Tamper with public signal commitment
    const tamperedSignals = [...validPublicSignals];
    tamperedSignals[0] = '1234567890987654321';

    const result = await verificationService.verifyZkProof({
      proof: validProof,
      publicSignals: tamperedSignals,
    });

    expect(result.isValid).toBe(false);
    expect(result.result).toBe(VerificationResult.INVALID);
    expect(result.error).toContain('pairing check failed');

    expect(prisma.verificationRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        verificationType: VerificationType.ZK_PROOF,
        resultStatus: VerificationResult.INVALID,
      }),
    });
  });
});
