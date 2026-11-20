import { randomUUID } from 'node:crypto';
import {
  scaleCgpa,
  generateBlindingSalt,
  computeAcademicCommitment,
  signCommitment,
  verifySignature,
} from '@vericred/crypto';
import { computeClaimDigestSha256 } from './canonicalizer.js';
import type {
  VerifiableCredential2026,
  W3CIssuer,
  W3CAcademicSubject,
  W3CBabyJubjubProof,
  W3CCredentialStatus,
} from './types.js';

export interface CreateCredentialInput {
  studentId: string;
  studentName: string;
  enrollmentNumber: string;
  degreeName: string;
  department: string;
  academicSession?: string;
  graduationYear: number;
  classification?: string;
  cgpa: number;
  issuer: {
    id: string; // e.g. "did:vericred:institution:rcciit"
    name: string;
    legalEntityCode?: string;
    ethereumAddress: string;
    publicKeyX: string;
    publicKeyY: string;
    privateKey: string;
  };
  contractAddress?: string;
  network?: string;
}

/**
 * Issues a fully-compliant W3C VC 2.0 Academic Degree Credential with
 * Poseidon commitment and BabyJubjub EdDSA digital signature.
 */
export async function createAcademicCredential(
  input: CreateCredentialInput
): Promise<VerifiableCredential2026> {
  const scaled = scaleCgpa(input.cgpa);
  const blindingSalt = generateBlindingSalt();
  const commitment = await computeAcademicCommitment(scaled, blindingSalt);

  const credentialId = `urn:uuid:${randomUUID()}`;
  const validFrom = new Date().toISOString();

  const credentialSubject: W3CAcademicSubject = {
    id: `did:vericred:student:${input.studentId}`,
    studentName: input.studentName,
    enrollmentNumber: input.enrollmentNumber,
    degreeName: input.degreeName,
    department: input.department,
    academicSession: input.academicSession || `${input.graduationYear - 4}-${input.graduationYear}`,
    graduationYear: input.graduationYear,
    classification: input.classification || (scaled >= 800 ? 'First Class with Distinction' : 'First Class'),
    academicStanding: {
      cgpaRaw: input.cgpa,
      cgpaScaled: scaled,
      blindingSalt: blindingSalt.toString(),
      commitment: commitment.toString(),
    },
  };

  const credentialHash = computeClaimDigestSha256(credentialSubject);

  const contractAddress =
    input.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const network = input.network || 'polygon-amoy';

  const credentialStatus: W3CCredentialStatus = {
    id: `https://vericred.net/api/v1/status/${credentialHash}`,
    type: 'VeriCredOnChainRevocation2026',
    network,
    contractAddress,
    credentialHash: `0x${credentialHash}`,
  };

  // Sign commitment using issuer's BabyJubjub private key
  const { signature, publicKey } = await signCommitment(input.issuer.privateKey, commitment);

  const issuer: W3CIssuer = {
    id: input.issuer.id,
    name: input.issuer.name,
    legalEntityCode: input.issuer.legalEntityCode,
    ethereumAddress: input.issuer.ethereumAddress,
    publicKeyX: publicKey.x,
    publicKeyY: publicKey.y,
  };

  const proof: W3CBabyJubjubProof = {
    type: 'BabyJubjubPoseidonProof2026',
    created: validFrom,
    verificationMethod: `${input.issuer.id}#key-1`,
    proofPurpose: 'assertionMethod',
    signatureValue: {
      r8x: signature.r8x,
      r8y: signature.r8y,
      s: signature.s,
    },
  };

  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://vericred.net/contexts/academic-credential-v1.jsonld',
    ],
    id: credentialId,
    type: ['VerifiableCredential', 'AcademicDegreeCredential'],
    issuer,
    validFrom,
    credentialSubject,
    credentialStatus,
    credentialSchema: {
      id: 'https://vericred.net/schemas/academic-credential-v1.json',
      type: 'JsonSchemaValidator2020',
    },
    proof,
  };
}

/**
 * Verifies a W3C VC 2.0 Academic Credential's Poseidon commitment and BabyJubjub signature.
 */
export async function verifyAcademicCredential(
  vc: VerifiableCredential2026
): Promise<{ isValid: boolean; error?: string }> {
  try {
    if (!vc['@context'] || !vc.credentialSubject || !vc.proof) {
      return { isValid: false, error: 'Malformed W3C VC 2.0 structure' };
    }

    const { academicStanding } = vc.credentialSubject;
    const commitmentBigInt = BigInt(academicStanding.commitment);

    // If blinding salt is present (unmasked), verify commitment integrity
    if (academicStanding.blindingSalt && academicStanding.blindingSalt !== 'REDACTED_ZK_CONCEALED') {
      const recomputed = await computeAcademicCommitment(
        academicStanding.cgpaScaled,
        BigInt(academicStanding.blindingSalt)
      );
      if (recomputed !== commitmentBigInt) {
        return {
          isValid: false,
          error: 'Cryptographic commitment mismatch: academic claims have been modified',
        };
      }
    }

    // Verify BabyJubjub digital signature
    const isValidSignature = await verifySignature(
      { x: vc.issuer.publicKeyX, y: vc.issuer.publicKeyY },
      commitmentBigInt,
      {
        r8x: vc.proof.signatureValue.r8x,
        r8y: vc.proof.signatureValue.r8y,
        s: vc.proof.signatureValue.s,
      }
    );

    if (!isValidSignature) {
      return { isValid: false, error: 'BabyJubjub EdDSA signature verification failed' };
    }

    return { isValid: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { isValid: false, error: `Verification error: ${msg}` };
  }
}
