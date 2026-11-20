-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSTITUTION', 'STUDENT', 'VERIFIER');

-- CreateEnum
CREATE TYPE "InstitutionStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('APPROVE', 'SUSPEND', 'REJECT', 'REACTIVATE');

-- CreateEnum
CREATE TYPE "KeyType" AS ENUM ('BABYJUBJUB_EDDSA', 'ED25519', 'SECP256K1');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('STANDARD_QR', 'ZK_PROOF', 'DIRECT_LOOKUP');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('VALID', 'INVALID', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RevocationReason" AS ENUM ('UNSPECIFIED', 'DISCIPLINARY', 'ADMIN_ERROR', 'RETRACTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "blockchainAddress" TEXT NOT NULL,
    "status" "InstitutionStatus" NOT NULL DEFAULT 'PENDING',
    "accreditationDocUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionApproval" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "decisionNotes" TEXT NOT NULL,
    "onChainTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionKey" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "keyIdentifier" TEXT NOT NULL,
    "keyType" "KeyType" NOT NULL DEFAULT 'BABYJUBJUB_EDDSA',
    "publicKeyX" TEXT NOT NULL,
    "publicKeyY" TEXT NOT NULL,
    "kmsKeyArn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "InstitutionKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "batchYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "credentialType" TEXT NOT NULL DEFAULT 'DegreeCertificate',
    "degreeName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "academicSession" TEXT,
    "graduationYear" INTEGER NOT NULL,
    "cgpaRaw" DECIMAL(4,2) NOT NULL,
    "cgpaScaled" INTEGER NOT NULL,
    "blindingSalt" TEXT NOT NULL,
    "commitment" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "onChainTxHash" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CredentialPresentation" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "holderId" TEXT NOT NULL,
    "verifierNonce" TEXT NOT NULL,
    "disclosedClaims" JSONB NOT NULL,
    "isConsumed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CredentialPresentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "presentationId" TEXT,
    "credentialId" TEXT,
    "verificationType" "VerificationType" NOT NULL,
    "resultStatus" "VerificationResult" NOT NULL,
    "zkThreshold" INTEGER,
    "clientIpHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevocationRecord" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "reasonCode" "RevocationReason" NOT NULL DEFAULT 'UNSPECIFIED',
    "reasonDetails" TEXT NOT NULL,
    "onChainTxHash" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevocationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_userId_key" ON "Institution"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_legalName_key" ON "Institution"("legalName");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_shortCode_key" ON "Institution"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_blockchainAddress_key" ON "Institution"("blockchainAddress");

-- CreateIndex
CREATE INDEX "Institution_status_idx" ON "Institution"("status");

-- CreateIndex
CREATE INDEX "Institution_blockchainAddress_idx" ON "Institution"("blockchainAddress");

-- CreateIndex
CREATE INDEX "InstitutionApproval_institutionId_idx" ON "InstitutionApproval"("institutionId");

-- CreateIndex
CREATE INDEX "InstitutionApproval_reviewerId_idx" ON "InstitutionApproval"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionKey_keyIdentifier_key" ON "InstitutionKey"("keyIdentifier");

-- CreateIndex
CREATE INDEX "InstitutionKey_institutionId_isActive_idx" ON "InstitutionKey"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_institutionId_idx" ON "Student"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_institutionId_enrollmentNumber_key" ON "Student"("institutionId", "enrollmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_commitment_key" ON "Credential"("commitment");

-- CreateIndex
CREATE INDEX "Credential_studentId_idx" ON "Credential"("studentId");

-- CreateIndex
CREATE INDEX "Credential_institutionId_idx" ON "Credential"("institutionId");

-- CreateIndex
CREATE INDEX "Credential_commitment_idx" ON "Credential"("commitment");

-- CreateIndex
CREATE UNIQUE INDEX "CredentialPresentation_verifierNonce_key" ON "CredentialPresentation"("verifierNonce");

-- CreateIndex
CREATE INDEX "CredentialPresentation_credentialId_idx" ON "CredentialPresentation"("credentialId");

-- CreateIndex
CREATE INDEX "CredentialPresentation_holderId_idx" ON "CredentialPresentation"("holderId");

-- CreateIndex
CREATE INDEX "CredentialPresentation_verifierNonce_idx" ON "CredentialPresentation"("verifierNonce");

-- CreateIndex
CREATE INDEX "VerificationRequest_presentationId_idx" ON "VerificationRequest"("presentationId");

-- CreateIndex
CREATE INDEX "VerificationRequest_credentialId_idx" ON "VerificationRequest"("credentialId");

-- CreateIndex
CREATE INDEX "VerificationRequest_resultStatus_idx" ON "VerificationRequest"("resultStatus");

-- CreateIndex
CREATE UNIQUE INDEX "RevocationRecord_credentialId_key" ON "RevocationRecord"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "RevocationRecord_onChainTxHash_key" ON "RevocationRecord"("onChainTxHash");

-- CreateIndex
CREATE INDEX "RevocationRecord_institutionId_idx" ON "RevocationRecord"("institutionId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Institution" ADD CONSTRAINT "Institution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionApproval" ADD CONSTRAINT "InstitutionApproval_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionApproval" ADD CONSTRAINT "InstitutionApproval_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionKey" ADD CONSTRAINT "InstitutionKey_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialPresentation" ADD CONSTRAINT "CredentialPresentation_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialPresentation" ADD CONSTRAINT "CredentialPresentation_holderId_fkey" FOREIGN KEY ("holderId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "CredentialPresentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevocationRecord" ADD CONSTRAINT "RevocationRecord_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevocationRecord" ADD CONSTRAINT "RevocationRecord_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
