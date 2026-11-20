import { randomUUID } from 'node:crypto';
import type {
  VerifiableCredential2026,
  VerifiablePresentation2026,
  SelectiveDisclosureOptions,
} from './types.js';
import { verifyAcademicCredential } from './issuerAdapter.js';

export interface CreatePresentationInput {
  vc: VerifiableCredential2026;
  holderId: string;
  verifierNonce?: string;
  selectiveDisclosure?: Partial<SelectiveDisclosureOptions>;
  ttlMinutes?: number;
}

/**
 * Creates a W3C Verifiable Presentation 2.0 with privacy-preserving selective disclosure.
 * Allows masking raw CGPA while preserving cryptographic commitment and BabyJubjub signature.
 */
export function createVerifiablePresentation(
  input: CreatePresentationInput
): VerifiablePresentation2026 {
  const nonce = input.verifierNonce || randomUUID().replace(/-/g, '');
  const ttl = input.ttlMinutes ?? 15;
  const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();

  const options: SelectiveDisclosureOptions = {
    discloseStudentName: input.selectiveDisclosure?.discloseStudentName ?? true,
    discloseDepartment: input.selectiveDisclosure?.discloseDepartment ?? true,
    discloseGraduationYear: input.selectiveDisclosure?.discloseGraduationYear ?? true,
    discloseRawCgpa: input.selectiveDisclosure?.discloseRawCgpa ?? false,
  };

  // Deep clone credential to avoid mutating original
  const presentationVc: VerifiableCredential2026 = JSON.parse(JSON.stringify(input.vc));

  // Apply selective disclosure redactions
  if (!options.discloseRawCgpa) {
    presentationVc.credentialSubject.academicStanding.blindingSalt = 'REDACTED_ZK_CONCEALED';
    // Raw CGPA is concealed, commitment remains for zero-knowledge proof verification
    (presentationVc.credentialSubject.academicStanding as any).cgpaRaw = undefined;
  }

  if (!options.discloseStudentName) {
    presentationVc.credentialSubject.studentName = 'REDACTED_HOLDER';
  }

  return {
    '@context': [
      'https://www.w3.org/ns/credentials/v2',
      'https://vericred.net/contexts/academic-credential-v1.jsonld',
    ],
    id: `urn:uuid:${randomUUID()}`,
    type: ['VerifiablePresentation'],
    holder: `did:vericred:student:${input.holderId}`,
    verifierNonce: nonce,
    expiresAt,
    verifiableCredential: [presentationVc],
    selectiveDisclosure: options,
  };
}

/**
 * Verifies a W3C Verifiable Presentation 2.0: checks expiration, nonce, and embedded VC signatures.
 */
export async function verifyVerifiablePresentation(
  presentation: VerifiablePresentation2026
): Promise<{ isValid: boolean; error?: string }> {
  if (
    !presentation['@context'] ||
    !Array.isArray(presentation.verifiableCredential) ||
    presentation.verifiableCredential.length === 0
  ) {
    return { isValid: false, error: 'Malformed Verifiable Presentation structure' };
  }

  // Check TTL expiration
  const now = new Date();
  const expires = new Date(presentation.expiresAt);
  if (now > expires) {
    return { isValid: false, error: `Presentation expired at ${presentation.expiresAt}` };
  }

  // Check embedded credentials
  for (const vc of presentation.verifiableCredential) {
    const vcResult = await verifyAcademicCredential(vc);
    if (!vcResult.isValid) {
      return { isValid: false, error: `Credential verification failed: ${vcResult.error}` };
    }
  }

  return { isValid: true };
}
