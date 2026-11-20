import { prisma } from '../../db/prisma.js';
import { NotFoundError, AuthorizationError } from '@vericred/shared';
import {
  createVerifiablePresentation,
  type PresentationRequestInput,
  type VerifiableCredential2026,
} from '@vericred/credential-schema';

export class PresentationService {
  async createPresentation(studentUserId: string, input: PresentationRequestInput) {
    const student = await prisma.student.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundError('Student profile for user', studentUserId);
    }

    const credential = await prisma.credential.findUnique({
      where: { id: input.credentialId },
      include: {
        institution: {
          include: { keys: { where: { isActive: true } } },
        },
      },
    });

    if (!credential) {
      throw new NotFoundError('Credential', input.credentialId);
    }

    if (credential.studentId !== student.id) {
      throw new AuthorizationError('You do not own this credential');
    }

    const signingKey = credential.institution.keys[0];
    const signatureObj = JSON.parse(credential.signature);

    // Reconstruct VC 2.0 object
    const vc: VerifiableCredential2026 = {
      '@context': [
        'https://www.w3.org/ns/credentials/v2',
        'https://vericred.net/contexts/academic-credential-v1.jsonld',
      ],
      id: credential.credentialId,
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: `did:vericred:institution:${credential.institution.shortCode.toLowerCase()}`,
        name: credential.institution.legalName,
        ethereumAddress: credential.institution.blockchainAddress,
        publicKeyX: signingKey?.publicKeyX || '0',
        publicKeyY: signingKey?.publicKeyY || '0',
      },
      validFrom: credential.issuedAt.toISOString(),
      credentialSubject: {
        id: `did:vericred:student:${student.id}`,
        studentName: 'Student Holder',
        enrollmentNumber: student.enrollmentNumber,
        degreeName: credential.degreeName,
        department: credential.department,
        academicSession: credential.academicSession || undefined,
        graduationYear: credential.graduationYear,
        academicStanding: {
          cgpaRaw: Number(credential.cgpaRaw),
          cgpaScaled: credential.cgpaScaled,
          blindingSalt: credential.blindingSalt,
          commitment: credential.commitment,
        },
      },
      credentialStatus: {
        id: `https://vericred.net/api/v1/status/${credential.id}`,
        type: 'VeriCredOnChainRevocation2026',
        network: 'polygon-amoy',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        credentialHash: `0x${credential.commitment}`,
      },
      credentialSchema: {
        id: 'https://vericred.net/schemas/academic-credential-v1.json',
        type: 'JsonSchemaValidator2020',
      },
      proof: {
        type: 'BabyJubjubPoseidonProof2026',
        created: credential.issuedAt.toISOString(),
        verificationMethod: `did:vericred:institution:${credential.institution.shortCode.toLowerCase()}#key-1`,
        proofPurpose: 'assertionMethod',
        signatureValue: signatureObj,
      },
    };

    const vp = createVerifiablePresentation({
      vc,
      holderId: student.id,
      selectiveDisclosure: {
        discloseRawCgpa: input.discloseCgpa,
        discloseDepartment: input.discloseDepartment,
        discloseGraduationYear: input.discloseGraduationYear,
        discloseStudentName: input.discloseStudentName,
      },
      ttlMinutes: input.ttlMinutes,
    });

    // Store presentation record
    const presentation = await prisma.credentialPresentation.create({
      data: {
        credentialId: credential.id,
        holderId: student.id,
        verifierNonce: vp.verifierNonce,
        disclosedClaims: vp as any,
        expiresAt: new Date(vp.expiresAt),
      },
    });

    return {
      presentationId: presentation.id,
      verifierNonce: vp.verifierNonce,
      expiresAt: vp.expiresAt,
      verifiablePresentation: vp,
      qrPayload: `vericred://vp/${vp.verifierNonce}`,
    };
  }

  async getPresentationByNonce(nonce: string) {
    const presentation = await prisma.credentialPresentation.findUnique({
      where: { verifierNonce: nonce },
      include: {
        credential: {
          include: {
            institution: { select: { legalName: true, shortCode: true, blockchainAddress: true } },
          },
        },
      },
    });

    if (!presentation) {
      throw new NotFoundError('Presentation with nonce', nonce);
    }

    if (new Date() > presentation.expiresAt) {
      throw new AuthorizationError('This presentation link has expired');
    }

    return presentation;
  }
}

export const presentationService = new PresentationService();
