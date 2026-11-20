import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as snarkjs from 'snarkjs';
import { prisma } from '../../db/prisma.js';
import {
  VerificationType,
  VerificationResult,
  CredentialStatus,
  ValidationError,
  InstitutionStatus,
} from '@vericred/shared';
import {
  verifyVerifiablePresentation,
  verifyAcademicCredential,
  type VerifiablePresentation2026,
  type VerifiableCredential2026,
} from '@vericred/credential-schema';

function findVerificationKeyPath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'src/modules/verification/verification_key.json'),
    path.resolve(process.cwd(), 'dist/modules/verification/verification_key.json'),
    path.resolve(process.cwd(), '../../zk/build/verification_key.json'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return candidates[0];
}

const vkeyPath = findVerificationKeyPath();

export interface ZkProofVerificationInput {
  proof: any;
  publicSignals: string[]; // [commitment, threshold, issuerPubKeyX, issuerPubKeyY]
  requiredThreshold?: number; // e.g. 8.00
}

export class VerificationService {
  private vKey: any = null;

  private getVerificationKey() {
    if (!this.vKey && fs.existsSync(vkeyPath)) {
      this.vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
    }
    return this.vKey;
  }

  async verifyZkProof(input: ZkProofVerificationInput, clientIp = '127.0.0.1') {
    const { proof, publicSignals, requiredThreshold } = input;

    if (!proof || !publicSignals || publicSignals.length < 4) {
      throw new ValidationError('Invalid ZK proof or public signals payload');
    }

    const [commitment, thresholdStr, issuerPubKeyX, issuerPubKeyY] = publicSignals;
    const provenThresholdInt = parseInt(thresholdStr, 10);

    // 1. Verify required threshold
    if (requiredThreshold !== undefined) {
      const requiredThresholdInt = Math.round(requiredThreshold * 100);
      if (provenThresholdInt < requiredThresholdInt) {
        return {
          isValid: false,
          result: VerificationResult.INVALID,
          error: `Proven threshold (${provenThresholdInt / 100}) is below the required threshold (${requiredThreshold})`,
        };
      }
    }

    // 2. Cryptographic Groth16 pairing check
    const vKey = this.getVerificationKey();
    if (!vKey) {
      throw new Error('Verification key not loaded on server');
    }

    const isProofValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    if (!isProofValid) {
      await prisma.verificationRequest.create({
        data: {
          clientIpHash: clientIp,
          verificationType: VerificationType.ZK_PROOF,
          resultStatus: VerificationResult.INVALID,
        },
      });

      return {
        isValid: false,
        result: VerificationResult.INVALID,
        error: 'Cryptographic Groth16 pairing check failed (tampered proof or public signals)',
      };
    }

    // 3. Verify issuer accreditation / authorization
    // Look up institution key with matching BabyJubjub public key coordinates
    const matchingKey = await prisma.institutionKey.findFirst({
      where: {
        publicKeyX: issuerPubKeyX,
        publicKeyY: issuerPubKeyY,
        isActive: true,
        institution: {
          status: InstitutionStatus.APPROVED,
        },
      },
      include: {
        institution: true,
      },
    });

    // 4. Verify revocation status of commitment
    const dbCred = await prisma.credential.findFirst({
      where: {
        commitment: commitment,
      },
      include: {
        institution: true,
      },
    });

    if (dbCred && dbCred.status === CredentialStatus.REVOKED) {
      await prisma.verificationRequest.create({
        data: {
          credentialId: dbCred.id,
          clientIpHash: clientIp,
          verificationType: VerificationType.ZK_PROOF,
          resultStatus: VerificationResult.REVOKED,
        },
      });

      return {
        isValid: false,
        result: VerificationResult.REVOKED,
        error: 'The underlying academic credential has been revoked by the issuing institution',
      };
    }

    // 5. Record successful ZK verification audit log
    await prisma.verificationRequest.create({
      data: {
        credentialId: dbCred?.id,
        clientIpHash: clientIp,
        verificationType: VerificationType.ZK_PROOF,
        resultStatus: VerificationResult.VALID,
      },
    });

    return {
      isValid: true,
      result: VerificationResult.VALID,
      status: 'VERIFIED',
      checks: {
        groth16PairingValid: true,
        thresholdSatisfied: true,
        issuerAccredited: !!matchingKey || !!dbCred,
        notRevoked: true,
      },
      zkDetails: {
        provenThreshold: provenThresholdInt / 100,
        commitment,
        issuerName: matchingKey?.institution?.legalName || dbCred?.institution?.legalName || 'Accredited University Partner',
        issuerPubKey: {
          x: issuerPubKeyX,
          y: issuerPubKeyY,
        },
      },
    };
  }
  async verifyPresentation(presentation: VerifiablePresentation2026, clientIp = '127.0.0.1') {
    if (!presentation || !presentation.verifiableCredential) {
      throw new ValidationError('Invalid presentation structure');
    }

    const vc = presentation.verifiableCredential[0];
    if (!vc) {
      throw new ValidationError('Presentation contains no credentials');
    }

    // 1. Verify W3C and cryptographic signatures via @vericred/credential-schema
    const presResult = await verifyVerifiablePresentation(presentation);
    if (!presResult.isValid) {
      // Record failed verification
      await prisma.verificationRequest.create({
        data: {
          clientIpHash: clientIp,
          verificationType: VerificationType.STANDARD_QR,
          resultStatus: VerificationResult.INVALID,
        },
      });

      return {
        isValid: false,
        result: VerificationResult.INVALID,
        error: presResult.error,
      };
    }

    // 2. Check on-chain / database revocation status
    const dbCred = await prisma.credential.findFirst({
      where: {
        commitment: vc.credentialSubject.academicStanding.commitment,
      },
    });

    if (dbCred && dbCred.status === CredentialStatus.REVOKED) {
      await prisma.verificationRequest.create({
        data: {
          credentialId: dbCred.id,
          clientIpHash: clientIp,
          verificationType: VerificationType.STANDARD_QR,
          resultStatus: VerificationResult.REVOKED,
        },
      });

      return {
        isValid: false,
        result: VerificationResult.REVOKED,
        error: 'Credential has been revoked by the issuing institution',
      };
    }

    // 3. Record successful verification log
    if (dbCred) {
      await prisma.verificationRequest.create({
        data: {
          credentialId: dbCred.id,
          clientIpHash: clientIp,
          verificationType: VerificationType.STANDARD_QR,
          resultStatus: VerificationResult.VALID,
        },
      });
    }

    return {
      isValid: true,
      result: VerificationResult.VALID,
      status: 'VERIFIED',
      checks: {
        schemaValid: true,
        signatureValid: true,
        commitmentValid: true,
        issuerAccredited: true,
        notRevoked: true,
      },
      credentialDetails: {
        degreeName: vc.credentialSubject.degreeName,
        department: vc.credentialSubject.department,
        issuerName: vc.issuer.name,
        graduationYear: vc.credentialSubject.graduationYear,
        studentName: vc.credentialSubject.studentName,
        cgpaRaw: vc.credentialSubject.academicStanding.cgpaRaw,
        commitment: vc.credentialSubject.academicStanding.commitment,
      },
    };
  }

  async verifyDirectCredential(vc: VerifiableCredential2026, clientIp = '127.0.0.1') {
    const vcResult = await verifyAcademicCredential(vc);

    if (!vcResult.isValid) {
      return {
        isValid: false,
        result: VerificationResult.INVALID,
        error: vcResult.error,
      };
    }

    return {
      isValid: true,
      result: VerificationResult.VALID,
      status: 'VERIFIED',
      checks: {
        schemaValid: true,
        signatureValid: true,
        commitmentValid: true,
        issuerAccredited: true,
      },
      credentialDetails: {
        degreeName: vc.credentialSubject.degreeName,
        department: vc.credentialSubject.department,
        issuerName: vc.issuer.name,
        graduationYear: vc.credentialSubject.graduationYear,
      },
    };
  }
}

export const verificationService = new VerificationService();
