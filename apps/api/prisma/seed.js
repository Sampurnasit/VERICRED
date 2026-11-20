"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2_1 = __importDefault(require("argon2"));
const crypto_1 = require("@vericred/crypto");
const shared_1 = require("@vericred/shared");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding VERICRED database with master demonstration data...');
    const passwordHash = await argon2_1.default.hash('AdminPass123!', shared_1.APP_CONSTANTS.ARGON2_PARAMS);
    const instPasswordHash = await argon2_1.default.hash('InstitutePass123!', shared_1.APP_CONSTANTS.ARGON2_PARAMS);
    const studentPasswordHash = await argon2_1.default.hash('StudentPass123!', shared_1.APP_CONSTANTS.ARGON2_PARAMS);
    // 1. Platform Administrator
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@vericred.net' },
        update: {},
        create: {
            email: 'admin@vericred.net',
            passwordHash,
            role: client_1.UserRole.ADMIN,
            firstName: 'Platform',
            lastName: 'Administrator',
            isEmailVerified: true,
        },
    });
    // 2. Institution Officer
    const instUser = await prisma.user.upsert({
        where: { email: shared_1.DEMO_INSTITUTION.ADMIN_EMAIL },
        update: {},
        create: {
            email: shared_1.DEMO_INSTITUTION.ADMIN_EMAIL,
            passwordHash: instPasswordHash,
            role: client_1.UserRole.INSTITUTION,
            firstName: 'Dr. Elena',
            lastName: 'Rostova',
            isEmailVerified: true,
        },
    });
    // 3. Approved Institution: RCC-IIT
    const institution = await prisma.institution.upsert({
        where: { shortCode: shared_1.DEMO_INSTITUTION.SHORT_CODE },
        update: {},
        create: {
            userId: instUser.id,
            legalName: shared_1.DEMO_INSTITUTION.LEGAL_NAME,
            shortCode: shared_1.DEMO_INSTITUTION.SHORT_CODE,
            website: shared_1.DEMO_INSTITUTION.WEBSITE,
            blockchainAddress: shared_1.DEMO_INSTITUTION.BLOCKCHAIN_ADDRESS,
            status: client_1.InstitutionStatus.APPROVED,
        },
    });
    // 4. Institution EdDSA Keypair
    const keyPair = await (0, crypto_1.generateIssuerKeyPair)();
    await prisma.institutionKey.create({
        data: {
            institutionId: institution.id,
            keyIdentifier: `did:vericred:institution:${shared_1.DEMO_INSTITUTION.SHORT_CODE.toLowerCase()}#key-1`,
            keyType: client_1.KeyType.BABYJUBJUB_EDDSA,
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
                role: client_1.UserRole.STUDENT,
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
        // Issue Academic Credential
        const scaledCgpa = (0, crypto_1.scaleCgpa)(s.cgpa);
        const salt = (0, crypto_1.generateBlindingSalt)();
        const commitment = await (0, crypto_1.computeAcademicCommitment)(scaledCgpa, salt);
        const { signature } = await (0, crypto_1.signCommitment)(keyPair.privateKey, commitment);
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
                status: client_1.CredentialStatus.ACTIVE,
                onChainTxHash: '0x3a4f9182bcde7102938475610293847561029384756102938475610293847561',
            },
        });
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
//# sourceMappingURL=seed.js.map