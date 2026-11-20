import { PrismaClient, UserRole, InstitutionStatus, ApprovalAction, KeyType, CredentialStatus } from '@prisma/client';
import argon2 from 'argon2';
import { scaleCgpa, generateBlindingSalt, computeAcademicCommitment, generateIssuerKeyPair, signCommitment } from '@vericred/crypto';
import { DEMO_INSTITUTION, APP_CONSTANTS } from '@vericred/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VERICRED database with master demonstration data...');

  const passwordHash = await argon2.hash('AdminPass123!', APP_CONSTANTS.ARGON2_PARAMS);
  const instPasswordHash = await argon2.hash('InstitutePass123!', APP_CONSTANTS.ARGON2_PARAMS);
  const studentPasswordHash = await argon2.hash('StudentPass123!', APP_CONSTANTS.ARGON2_PARAMS);

  // 1. Platform Administrator
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vericred.net' },
    update: {},
    create: {
      email: 'admin@vericred.net',
      passwordHash,
      role: UserRole.ADMIN,
      firstName: 'Platform',
      lastName: 'Administrator',
      isEmailVerified: true,
    },
  });

  // 2. Institution Officer
  const instUser = await prisma.user.upsert({
    where: { email: DEMO_INSTITUTION.ADMIN_EMAIL },
    update: {},
    create: {
      email: DEMO_INSTITUTION.ADMIN_EMAIL,
      passwordHash: instPasswordHash,
      role: UserRole.INSTITUTION,
      firstName: 'Dr. Elena',
      lastName: 'Rostova',
      isEmailVerified: true,
    },
  });

  // 3. Approved Institution: RCC-IIT
  const institution = await prisma.institution.upsert({
    where: { shortCode: DEMO_INSTITUTION.SHORT_CODE },
    update: {},
    create: {
      userId: instUser.id,
      legalName: DEMO_INSTITUTION.LEGAL_NAME,
      shortCode: DEMO_INSTITUTION.SHORT_CODE,
      website: DEMO_INSTITUTION.WEBSITE,
      blockchainAddress: DEMO_INSTITUTION.BLOCKCHAIN_ADDRESS,
      status: InstitutionStatus.APPROVED,
    },
  });

  // 4. Institution EdDSA Keypair
  const keyPair = await generateIssuerKeyPair();
  const keyIdentifier = `did:vericred:institution:${DEMO_INSTITUTION.SHORT_CODE.toLowerCase()}#key-1`;
  await prisma.institutionKey.upsert({
    where: { keyIdentifier },
    update: {
      publicKeyX: keyPair.publicKey.x,
      publicKeyY: keyPair.publicKey.y,
    },
    create: {
      institutionId: institution.id,
      keyIdentifier,
      keyType: KeyType.BABYJUBJUB_EDDSA,
      publicKeyX: keyPair.publicKey.x,
      publicKeyY: keyPair.publicKey.y,
      kmsKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/demo-keystore',
      isActive: true,
    },
  });

  // 5. Seed Students
  const studentsData = [
    {
      email: 'aarav.sen@student.rcciit.ac.in',
      firstName: 'Aarav',
      lastName: 'Sen',
      enrollment: 'VC2026001',
      degree: 'Bachelor of Technology',
      department: 'Computer Science and Engineering',
      graduationYear: 2026,
      cgpa: 8.72,
    },
    {
      email: 'diya.roy@student.rcciit.ac.in',
      firstName: 'Diya',
      lastName: 'Roy',
      enrollment: 'VC2026002',
      degree: 'Bachelor of Technology',
      department: 'Information Technology',
      graduationYear: 2026,
      cgpa: 7.65,
    },
    {
      email: 'rohan.das@student.rcciit.ac.in',
      firstName: 'Rohan',
      lastName: 'Das',
      enrollment: 'VC2026003',
      degree: 'Bachelor of Technology',
      department: 'Computer Science and Engineering',
      graduationYear: 2026,
      cgpa: 9.12,
    },
  ];

  for (const s of studentsData) {
    const studentUser = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: studentPasswordHash,
        role: UserRole.STUDENT,
        firstName: s.firstName,
        lastName: s.lastName,
        isEmailVerified: true,
      },
    });

    const student = await prisma.student.upsert({
      where: {
        institutionId_enrollmentNumber: {
          institutionId: institution.id,
          enrollmentNumber: s.enrollment,
        },
      },
      update: {},
      create: {
        userId: studentUser.id,
        institutionId: institution.id,
        enrollmentNumber: s.enrollment,
        department: s.department,
        batchYear: s.graduationYear,
      },
    });

    // Issue Academic Credential if not already present
    const existingCred = await prisma.credential.findFirst({
      where: { studentId: student.id, status: CredentialStatus.ACTIVE },
    });

    if (!existingCred) {
      const scaledCgpa = scaleCgpa(s.cgpa);
      const salt = generateBlindingSalt();
      const commitment = await computeAcademicCommitment(scaledCgpa, salt);
      const { signature } = await signCommitment(keyPair.privateKey, commitment);

      await prisma.credential.create({
        data: {
          credentialId: `urn:uuid:${crypto.randomUUID()}`,
          institutionId: institution.id,
          studentId: student.id,
          degreeName: s.degree,
          department: s.department,
          graduationYear: s.graduationYear,
          cgpaRaw: s.cgpa,
          cgpaScaled: scaledCgpa,
          blindingSalt: salt.toString(),
          commitment: commitment.toString(),
          signature: JSON.stringify(signature),
          status: CredentialStatus.ACTIVE,
          onChainTxHash: '0x3a4f9182bcde7102938475610293847561029384756102938475610293847561',
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
