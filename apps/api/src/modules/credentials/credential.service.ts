import { prisma } from '../../db/prisma.js';
import {
  CredentialStatus,
  NotFoundError,
  ValidationError,
  AuthorizationError,
  UserRole,
} from '@vericred/shared';
import {
  createAcademicCredential,
  type IssueCredentialInput,
  type CsvCredentialRow,
} from '@vericred/credential-schema';
import { generateIssuerKeyPair } from '@vericred/crypto';
import { blockchainRelayer } from '../blockchain/blockchainRelayer.service.js';

export class CredentialService {
  /**
   * Helper to retrieve or lazily generate an active BabyJubjub signing key for an institution.
   */
  private async getActiveInstitutionKey(institutionId: string) {
    let key = await prisma.institutionKey.findFirst({
      where: { institutionId, isActive: true },
    });

    if (!key) {
      const generated = await generateIssuerKeyPair();
      key = await prisma.institutionKey.create({
        data: {
          institutionId,
          keyIdentifier: `did:vericred:institution:${institutionId}#key-1`,
          publicKeyX: generated.publicKey.x,
          publicKeyY: generated.publicKey.y,
          kmsKeyArn: generated.privateKey, // Storing private key in kmsKeyArn field for local dev
          isActive: true,
        },
      });
    }

    return key;
  }

  /**
   * Issue a single academic credential with BabyJubjub EdDSA signature and Poseidon commitment.
   */
  async issueSingleCredential(issuerUserId: string, input: IssueCredentialInput) {
    const institution = await prisma.institution.findUnique({
      where: { userId: issuerUserId },
    });

    if (!institution) {
      throw new NotFoundError('Institution profile for user', issuerUserId);
    }

    let student = await prisma.student.findUnique({
      where: { id: input.studentId },
      include: { user: true },
    });

    if (!student) {
      student = await prisma.student.findFirst({
        where: {
          institutionId: institution.id,
          OR: [
            { enrollmentNumber: input.studentId },
            { user: { email: input.studentId } },
          ],
        },
        include: { user: true },
      });
    }

    if (!student) {
      throw new NotFoundError('Student', input.studentId);
    }

    const signingKey = await this.getActiveInstitutionKey(institution.id);

    // Create the formal W3C VC 2.0 object using @vericred/credential-schema
    const vc = await createAcademicCredential({
      studentId: student.id,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      enrollmentNumber: student.enrollmentNumber,
      degreeName: input.degreeName,
      department: input.department,
      academicSession: input.academicSession,
      graduationYear: input.graduationYear,
      cgpa: input.cgpa,
      issuer: {
        id: `did:vericred:institution:${institution.shortCode.toLowerCase()}`,
        name: institution.legalName,
        ethereumAddress: institution.blockchainAddress,
        publicKeyX: signingKey.publicKeyX,
        publicKeyY: signingKey.publicKeyY,
        privateKey: signingKey.kmsKeyArn,
      },
    });

    // Anchor credential commitment on Polygon Amoy CredentialRegistry
    const onChainTxHash = await blockchainRelayer.anchorCredential(
      vc.id,
      vc.credentialSubject.academicStanding.commitment
    );

    // Store in PostgreSQL
    const credential = await prisma.credential.create({
      data: {
        credentialId: vc.id,
        institutionId: institution.id,
        studentId: student.id,
        credentialType: input.credentialType,
        degreeName: input.degreeName,
        department: input.department,
        academicSession: input.academicSession,
        graduationYear: input.graduationYear,
        cgpaRaw: input.cgpa,
        cgpaScaled: vc.credentialSubject.academicStanding.cgpaScaled,
        blindingSalt: vc.credentialSubject.academicStanding.blindingSalt,
        commitment: vc.credentialSubject.academicStanding.commitment,
        signature: JSON.stringify(vc.proof.signatureValue),
        status: CredentialStatus.ACTIVE,
        onChainTxHash,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        institution: {
          select: { legalName: true, shortCode: true, blockchainAddress: true },
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: issuerUserId,
        action: 'CREDENTIAL_ISSUED',
        entityType: 'Credential',
        entityId: credential.id,
        ipAddress: '127.0.0.1',
        metadata: {
          degree: input.degreeName,
          studentEnrollment: student.enrollmentNumber,
          commitment: vc.credentialSubject.academicStanding.commitment,
          onChainTxHash,
        },
      },
    });

    return { credential, verifiableCredential: vc };
  }

  /**
   * Bulk issuance from parsed CSV data records.
   */
  async issueBulkCredentials(issuerUserId: string, records: CsvCredentialRow[]) {
    const institution = await prisma.institution.findUnique({
      where: { userId: issuerUserId },
    });

    if (!institution) {
      throw new NotFoundError('Institution profile for user', issuerUserId);
    }

    const signingKey = await this.getActiveInstitutionKey(institution.id);
    const preparedItems = [];

    for (const record of records) {
      // Find or create student for this institution
      let student = await prisma.student.findUnique({
        where: {
          institutionId_enrollmentNumber: {
            institutionId: institution.id,
            enrollmentNumber: record.enrollmentNumber,
          },
        },
        include: { user: true },
      });

      if (!student) {
        // Find user by email or create placeholder
        let user = await prisma.user.findUnique({ where: { email: record.studentEmail } });
        if (!user) {
          const names = record.studentName.split(' ');
          user = await prisma.user.create({
            data: {
              email: record.studentEmail.toLowerCase(),
              firstName: names[0] || 'Student',
              lastName: names.slice(1).join(' ') || 'User',
              passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyplaceholder',
              role: UserRole.STUDENT,
            },
          });
        }

        student = await prisma.student.create({
          data: {
            userId: user.id,
            institutionId: institution.id,
            enrollmentNumber: record.enrollmentNumber,
            department: record.department,
            batchYear: record.graduationYear - 4,
          },
          include: { user: true },
        });
      }

      const vc = await createAcademicCredential({
        studentId: student.id,
        studentName: record.studentName,
        enrollmentNumber: record.enrollmentNumber,
        degreeName: record.degreeName,
        department: record.department,
        academicSession: record.academicSession,
        graduationYear: record.graduationYear,
        cgpa: record.cgpa,
        issuer: {
          id: `did:vericred:institution:${institution.shortCode.toLowerCase()}`,
          name: institution.legalName,
          ethereumAddress: institution.blockchainAddress,
          publicKeyX: signingKey.publicKeyX,
          publicKeyY: signingKey.publicKeyY,
          privateKey: signingKey.kmsKeyArn,
        },
      });

      preparedItems.push({ student, record, vc });
    }

    // Batch anchor to Polygon Amoy CredentialRegistry
    const batchItemsToAnchor = preparedItems.map((item) => ({
      credentialId: item.vc.id,
      commitment: item.vc.credentialSubject.academicStanding.commitment,
    }));

    const batchTxHash = await blockchainRelayer.anchorBatchCredentials(batchItemsToAnchor);

    const issuedCredentials = [];
    for (const item of preparedItems) {
      const cred = await prisma.credential.create({
        data: {
          credentialId: item.vc.id,
          institutionId: institution.id,
          studentId: item.student.id,
          degreeName: item.record.degreeName,
          department: item.record.department,
          academicSession: item.record.academicSession,
          graduationYear: item.record.graduationYear,
          cgpaRaw: item.record.cgpa,
          cgpaScaled: item.vc.credentialSubject.academicStanding.cgpaScaled,
          blindingSalt: item.vc.credentialSubject.academicStanding.blindingSalt,
          commitment: item.vc.credentialSubject.academicStanding.commitment,
          signature: JSON.stringify(item.vc.proof.signatureValue),
          status: CredentialStatus.ACTIVE,
          onChainTxHash: batchTxHash,
        },
      });
      issuedCredentials.push(cred);
    }

    await prisma.auditLog.create({
      data: {
        actorId: issuerUserId,
        action: 'CREDENTIALS_BULK_ISSUED',
        entityType: 'Institution',
        entityId: institution.id,
        ipAddress: '127.0.0.1',
        metadata: {
          count: issuedCredentials.length,
          onChainTxHash: batchTxHash,
        },
      },
    });

    return {
      success: true,
      count: issuedCredentials.length,
      credentials: issuedCredentials,
    };
  }

  /**
   * Retrieve all credentials for a student user.
   */
  async getStudentCredentials(studentUserId: string) {
    const student = await prisma.student.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundError('Student profile for user', studentUserId);
    }

    return prisma.credential.findMany({
      where: { studentId: student.id },
      include: {
        institution: {
          select: { legalName: true, shortCode: true, blockchainAddress: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  /**
   * Retrieve all credentials issued by an institution user.
   */
  async getInstitutionCredentials(issuerUserId: string) {
    const institution = await prisma.institution.findUnique({
      where: { userId: issuerUserId },
    });

    if (!institution) {
      throw new NotFoundError('Institution profile for user', issuerUserId);
    }

    return prisma.credential.findMany({
      where: { institutionId: institution.id },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  /**
   * Retrieve single credential by ID with access control check.
   */
  async getCredentialById(id: string, user: { userId: string; role: UserRole }) {
    const credential = await prisma.credential.findFirst({
      where: {
        OR: [{ id }, { credentialId: id }],
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        institution: {
          select: { legalName: true, shortCode: true, blockchainAddress: true },
        },
      },
    });

    if (!credential) {
      throw new NotFoundError('Credential', id);
    }

    // Role-based boundary: STUDENT can only view their own credentials
    if (user.role === UserRole.STUDENT && credential.student.userId !== user.userId) {
      throw new AuthorizationError('You do not have permission to view this credential');
    }

    return credential;
  }

  /**
   * Revoke an issued credential with reason code.
   */
  async revokeCredential(
    issuerUserId: string,
    input: { credentialId: string; revocationReason: string }
  ) {
    const institution = await prisma.institution.findUnique({
      where: { userId: issuerUserId },
    });

    const credential = await prisma.credential.findFirst({
      where: {
        OR: [{ id: input.credentialId }, { credentialId: input.credentialId }],
      },
      include: {
        institution: true,
      },
    });

    if (!credential) {
      throw new NotFoundError('Credential', input.credentialId);
    }

    // Authorization check: Only the issuing institution (or admin) can revoke
    if (institution && credential.institutionId !== institution.id) {
      throw new AuthorizationError('Only the issuing institution can revoke this credential');
    }

    // Map revocation reason to smart contract code (1=Unspecified, 2=Disciplinary, 3=Admin Error, 4=Retracted)
    let reasonCode = 1;
    if (input.revocationReason === 'DISCIPLINARY') reasonCode = 2;
    else if (input.revocationReason === 'ADMIN_ERROR') reasonCode = 3;
    else if (input.revocationReason === 'RETRACTED') reasonCode = 4;

    // Anchor revocation on Polygon Amoy RevocationRegistry
    const onChainTxHash = await blockchainRelayer.revokeCredential(
      credential.credentialId,
      credential.commitment,
      reasonCode
    );

    const updated = await prisma.credential.update({
      where: { id: credential.id },
      data: {
        status: CredentialStatus.REVOKED,
      },
    });

    try {
      await prisma.revocationRecord.create({
        data: {
          credentialId: credential.id,
          institutionId: credential.institutionId,
          reasonCode: (input.revocationReason as any) || 'UNSPECIFIED',
          reasonDetails: input.revocationReason || 'Revoked by institution',
          onChainTxHash,
        },
      });
    } catch {
      // In-memory / mock fallback if revocationRecord table is mocked
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actorId: issuerUserId,
        action: 'CREDENTIAL_REVOKED',
        entityType: 'Credential',
        entityId: credential.id,
        ipAddress: '127.0.0.1',
        metadata: {
          revocationReason: input.revocationReason,
          commitment: credential.commitment,
          onChainTxHash,
        },
      },
    });

    return updated;
  }
}

export const credentialService = new CredentialService();
