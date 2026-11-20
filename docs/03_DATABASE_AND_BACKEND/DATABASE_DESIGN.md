# DATABASE_DESIGN.md — Relational Schema & Persistence Architecture

> **Document ID**: DOC-DATA-001  
> **Status**: Confirmed Technical Specification  
> **Database Engine**: PostgreSQL 16+ via Prisma ORM

---

## 1. Database Architecture & Design Principles

The VERICRED relational schema is engineered to guarantee strict referential integrity (ACID), zero plaintext exposure of private cryptographic keys, complete auditable tracking of credential lifecycles, and rapid verification query resolution.

### Core Database Rules
1. **Zero Private Key Storage in Plaintext**: Institution private signing keys are never stored as regular plaintext columns in database tables. Keystore references point to encrypted KMS vaults.
2. **Sensitive Data Classification**: Columns are categorized into `PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, and `RESTRICTED`.
3. **Immutability of Cryptographic Records**: Credential commitments, signatures, and revocation records cannot be modified once written (`UPDATE` statements prohibited on issuance tables; append-only audit tracking).

---

## 2. Comprehensive Entity Specifications

### 2.1 `User`
- **Purpose**: Core identity record for system users across all roles (`ADMIN`, `INSTITUTION`, `STUDENT`, `VERIFIER`).
- **Data Classification**: `CONFIDENTIAL` (Contains PII and password hashes).

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique user identifier |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Normalized user email |
| `passwordHash` | `VARCHAR(255)` | `NOT NULL` | Argon2id password hash |
| `role` | `UserRole` (ENUM) | `NOT NULL, default='STUDENT'` | `ADMIN`, `INSTITUTION`, `STUDENT`, `VERIFIER` |
| `firstName` | `VARCHAR(100)` | `NOT NULL` | User given name |
| `lastName` | `VARCHAR(100)` | `NOT NULL` | User family name |
| `isEmailVerified`| `BOOLEAN` | `NOT NULL, default=false` | Email verification flag |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Last modification timestamp |

- **Indexes**: `CREATE INDEX idx_user_email ON "User"(email);`, `CREATE INDEX idx_user_role ON "User"(role);`
- **Relationships**: 1:1 with `Institution` (optional), 1:1 with `Student` (optional), 1:N with `AuditLog`.

---

### 2.2 `Institution`
- **Purpose**: Educational institution metadata, accreditation profile, and issuer status.
- **Data Classification**: `INTERNAL` / `PUBLIC`.

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique institution ID |
| `userId` | `UUID` | `NOT NULL, UNIQUE, FK -> User(id)` | Administrative account owner |
| `legalName` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Official legal institution name |
| `shortCode` | `VARCHAR(32)` | `NOT NULL, UNIQUE` | Acronym (e.g., `RCC-IIT`) |
| `website` | `VARCHAR(255)` | `NOT NULL` | Accredited domain URL |
| `blockchainAddress`| `VARCHAR(42)`| `NOT NULL, UNIQUE` | Ethereum address for contract calls |
| `status` | `InstitutionStatus` (ENUM) | `NOT NULL, default='PENDING'`| `PENDING`, `APPROVED`, `SUSPENDED`, `REJECTED` |
| `accreditationDocUrl`| `TEXT` | `NULLABLE` | Proof of government accreditation |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Registration timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Profile update timestamp |

- **Indexes**: `CREATE INDEX idx_institution_status ON "Institution"(status);`, `CREATE INDEX idx_institution_address ON "Institution"(blockchainAddress);`
- **Relationships**: 1:1 with `User`, 1:N with `InstitutionApproval`, 1:N with `InstitutionKey`, 1:N with `Credential`.

---

### 2.3 `InstitutionApproval`
- **Purpose**: Complete audit trail of administrative approval/suspension decisions.
- **Data Classification**: `INTERNAL`.

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique approval audit ID |
| `institutionId`| `UUID` | `NOT NULL, FK -> Institution(id)` | Subject institution |
| `reviewerId` | `UUID` | `NOT NULL, FK -> User(id)` | Admin user executing the review |
| `action` | `ApprovalAction` (ENUM) | `NOT NULL` | `APPROVE`, `SUSPEND`, `REJECT`, `REACTIVATE` |
| `decisionNotes` | `TEXT` | `NOT NULL` | Written justification |
| `onChainTxHash` | `VARCHAR(66)` | `NULLABLE` | Polygon Amoy confirmation transaction hash |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Decision timestamp |

---

### 2.4 `InstitutionKey`
- **Purpose**: Registered cryptographic signing keys (EdDSA BabyJubjub) associated with the institution.
- **Data Classification**: `RESTRICTED` (Public key exposed; private key NEVER stored in db).

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique key record ID |
| `institutionId` | `UUID` | `NOT NULL, FK -> Institution(id)` | Owning institution |
| `keyIdentifier` | `VARCHAR(64)` | `NOT NULL, UNIQUE` | Key ID (e.g., `did:vericred:rcciit#key-1`) |
| `keyType` | `KeyType` (ENUM) | `NOT NULL, default='BABYJUBJUB_EDDSA'`| Cryptographic curve and algorithm |
| `publicKeyX` | `VARCHAR(78)` | `NOT NULL` | BabyJubjub point X (decimal string / hex) |
| `publicKeyY` | `VARCHAR(78)` | `NOT NULL` | BabyJubjub point Y (decimal string / hex) |
| `kmsKeyArn` | `VARCHAR(255)` | `NOT NULL` | Reference ARN to AWS KMS / Vault vault path |
| `isActive` | `BOOLEAN` | `NOT NULL, default=true` | Key active state |
| `validFrom` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Key activation date |
| `validUntil` | `TIMESTAMPTZ` | `NULLABLE` | Key expiration date (rotation) |

- **Indexes**: `CREATE INDEX idx_instkey_active ON "InstitutionKey"(institutionId, isActive);`

---

### 2.5 `Student`
- **Purpose**: Student profile and institution enrollment mappings.
- **Data Classification**: `CONFIDENTIAL` (PII).

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique student profile ID |
| `userId` | `UUID` | `NOT NULL, UNIQUE, FK -> User(id)` | Owning user account |
| `institutionId` | `UUID` | `NOT NULL, FK -> Institution(id)` | Current enrolled university |
| `enrollmentNumber` | `VARCHAR(64)` | `NOT NULL` | University roll / student ID (e.g., `VC2026001`) |
| `department` | `VARCHAR(100)` | `NOT NULL` | Academic branch (e.g., `CSE`) |
| `batchYear` | `INT` | `NOT NULL` | Graduation cohort year |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Creation timestamp |

- **Unique Constraints**: `UNIQUE(institutionId, enrollmentNumber)`

---

### 2.6 `Credential`
- **Purpose**: Authoritative record of an issued academic credential.
- **Data Classification**: `RESTRICTED` (Contains academic records, salted commitment, and signature).

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique credential UUID |
| `credentialId` | `VARCHAR(128)` | `NOT NULL, UNIQUE` | W3C URI (`urn:uuid:...`) |
| `institutionId` | `UUID` | `NOT NULL, FK -> Institution(id)` | Issuing authority |
| `studentId` | `UUID` | `NOT NULL, FK -> Student(id)` | Credential subject |
| `credentialType`| `VARCHAR(64)` | `NOT NULL` | `DegreeCertificate`, `Transcript` |
| `degreeName` | `VARCHAR(128)` | `NOT NULL` | e.g., `Bachelor of Technology` |
| `department` | `VARCHAR(128)` | `NOT NULL` | e.g., `Computer Science and Engineering` |
| `graduationYear`| `INT` | `NOT NULL` | Graduation year (e.g., 2026) |
| `cgpaRaw` | `DECIMAL(4, 2)`| `NOT NULL` | Plaintext CGPA (e.g., 8.72) |
| `cgpaScaled` | `INT` | `NOT NULL` | Fixed-point integer (e.g., 872) |
| `blindingSalt` | `VARCHAR(78)` | `NOT NULL` | 254-bit blinding salt $s$ (decimal string) |
| `commitment` | `VARCHAR(78)` | `NOT NULL, UNIQUE` | $C = \text{Poseidon}(\text{cgpaScaled}, s)$ |
| `signature` | `TEXT` | `NOT NULL` | EdDSA BabyJubjub signature ($R8x, R8y, S$) |
| `status` | `CredentialStatus` (ENUM)| `NOT NULL, default='ACTIVE'` | `ACTIVE`, `REVOKED`, `EXPIRED` |
| `onChainTxHash` | `VARCHAR(66)` | `NULLABLE` | Polygon Amoy anchoring transaction hash |
| `issuedAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Issuance date |
| `expiresAt` | `TIMESTAMPTZ` | `NULLABLE` | Credential expiration date |

- **Indexes**: `CREATE INDEX idx_credential_student ON "Credential"(studentId);`, `CREATE INDEX idx_credential_commitment ON "Credential"(commitment);`

---

### 2.7 `CredentialPresentation`
- **Purpose**: Ephemeral verifiable presentation tokens generated for QR code sharing.
- **Data Classification**: `INTERNAL`.

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique presentation ID |
| `credentialId` | `UUID` | `NOT NULL, FK -> Credential(id)` | Parent credential |
| `holderId` | `UUID` | `NOT NULL, FK -> Student(id)` | Presenting student |
| `verifierNonce` | `VARCHAR(64)` | `NOT NULL, UNIQUE` | 128-bit challenge nonce |
| `disclosedClaims`| `JSONB` | `NOT NULL` | Mask of disclosed fields |
| `isConsumed` | `BOOLEAN` | `NOT NULL, default=false` | Replay protection flag |
| `expiresAt` | `TIMESTAMPTZ` | `NOT NULL` | Expiration (typically 15 min TTL) |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Generation timestamp |

---

### 2.8 `VerificationRequest`
- **Purpose**: Log of public credential or zero-knowledge verification attempts.
- **Data Classification**: `INTERNAL` (No private student witnesses logged).

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique log ID |
| `presentationId`| `UUID` | `NULLABLE, FK -> CredentialPresentation(id)`| Presentation reference |
| `credentialId` | `UUID` | `NULLABLE, FK -> Credential(id)` | Direct credential reference |
| `verificationType`| `VerificationType` (ENUM)| `NOT NULL` | `STANDARD_QR`, `ZK_PROOF`, `DIRECT_LOOKUP` |
| `resultStatus` | `VerificationResult` (ENUM)| `NOT NULL` | `VALID`, `INVALID`, `REVOKED`, `EXPIRED` |
| `zkThreshold` | `INT` | `NULLABLE` | Requested threshold (e.g., 800) |
| `clientIpHash` | `VARCHAR(64)` | `NOT NULL` | Salted SHA-256 hash of verifier IP |
| `userAgent` | `VARCHAR(255)` | `NULLABLE` | Browser user-agent string |
| `executedAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Verification timestamp |

---

### 2.9 `RevocationRecord`
- **Purpose**: Immutable history of credential revocation events.
- **Data Classification**: `INTERNAL` / `PUBLIC`.

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique revocation ID |
| `credentialId` | `UUID` | `NOT NULL, UNIQUE, FK -> Credential(id)`| Revoked credential |
| `institutionId` | `UUID` | `NOT NULL, FK -> Institution(id)` | Revoking institution |
| `reasonCode` | `RevocationReason` (ENUM)| `NOT NULL` | `DISCIPLINARY`, `ADMIN_ERROR`, `RETRACTED` |
| `reasonDetails` | `TEXT` | `NOT NULL` | Descriptive statement |
| `onChainTxHash` | `VARCHAR(66)` | `NOT NULL, UNIQUE` | Polygon Amoy revocation tx hash |
| `revokedAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Timestamp of revocation |

---

### 2.10 `AuditLog`
- **Purpose**: Tamper-evident administrative and security audit logging.
- **Data Classification**: `RESTRICTED`.

| Column | Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PK, default=gen_random_uuid()` | Unique audit log ID |
| `actorId` | `UUID` | `NOT NULL, FK -> User(id)` | Identity performing action |
| `action` | `VARCHAR(64)` | `NOT NULL` | e.g., `INSTITUTION_APPROVED`, `KEY_ROTATED` |
| `entityType` | `VARCHAR(64)` | `NOT NULL` | Target table / entity |
| `entityId` | `VARCHAR(64)` | `NOT NULL` | Target record UUID |
| `ipAddress` | `VARCHAR(45)` | `NOT NULL` | IPv4 or IPv6 address |
| `metadata` | `JSONB` | `NULLABLE` | Contextual diff / parameters |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL, default=now()` | Timestamp |

---

## 3. Prisma Schema Definition (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  INSTITUTION
  STUDENT
  VERIFIER
}

enum InstitutionStatus {
  PENDING
  APPROVED
  SUSPENDED
  REJECTED
}

enum ApprovalAction {
  APPROVE
  SUSPEND
  REJECT
  REACTIVATE
}

enum KeyType {
  BABYJUBJUB_EDDSA
  ED25519
  SECP256K1
}

enum CredentialStatus {
  ACTIVE
  REVOKED
  EXPIRED
}

enum VerificationType {
  STANDARD_QR
  ZK_PROOF
  DIRECT_LOOKUP
}

enum VerificationResult {
  VALID
  INVALID
  REVOKED
  EXPIRED
}

enum RevocationReason {
  DISCIPLINARY
  ADMIN_ERROR
  RETRACTED
}
```
