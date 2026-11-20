# ER_DIAGRAM.md — Entity Relationship Architecture

> **Document ID**: DOC-DATA-002  
> **Status**: Confirmed Technical Specification

---

## 1. Relational Entity Relationship Diagram

The following Mermaid diagram visualizes the tables, columns, primary keys (`PK`), foreign keys (`FK`), and cardinalities across the VERICRED PostgreSQL relational schema.

```mermaid
erDiagram
    User ||--o| Institution : "operates (1:1)"
    User ||--o| Student : "profile of (1:1)"
    User ||--o{ AuditLog : "initiates (1:N)"
    User ||--o{ InstitutionApproval : "reviews (1:N)"

    Institution ||--o{ InstitutionApproval : "receives (1:N)"
    Institution ||--o{ InstitutionKey : "owns (1:N)"
    Institution ||--o{ Student : "enrolls (1:N)"
    Institution ||--o{ Credential : "issues (1:N)"
    Institution ||--o{ RevocationRecord : "authorizes (1:N)"

    Student ||--o{ Credential : "holds (1:N)"
    Student ||--o{ CredentialPresentation : "shares (1:N)"

    Credential ||--o{ CredentialPresentation : "derived into (1:N)"
    Credential ||--o| RevocationRecord : "invalidated by (1:1)"
    Credential ||--o{ VerificationRequest : "target of (1:N)"

    CredentialPresentation ||--o{ VerificationRequest : "resolved by (1:N)"

    User {
        uuid id PK
        varchar email UK
        varchar passwordHash
        UserRole role
        varchar firstName
        varchar lastName
        boolean isEmailVerified
        timestamptz createdAt
        timestamptz updatedAt
    }

    Institution {
        uuid id PK
        uuid userId FK,UK
        varchar legalName UK
        varchar shortCode UK
        varchar website
        varchar blockchainAddress UK
        InstitutionStatus status
        text accreditationDocUrl
        timestamptz createdAt
        timestamptz updatedAt
    }

    InstitutionApproval {
        uuid id PK
        uuid institutionId FK
        uuid reviewerId FK
        ApprovalAction action
        text decisionNotes
        varchar onChainTxHash
        timestamptz createdAt
    }

    InstitutionKey {
        uuid id PK
        uuid institutionId FK
        varchar keyIdentifier UK
        KeyType keyType
        varchar publicKeyX
        varchar publicKeyY
        varchar kmsKeyArn
        boolean isActive
        timestamptz validFrom
        timestamptz validUntil
    }

    Student {
        uuid id PK
        uuid userId FK,UK
        uuid institutionId FK
        varchar enrollmentNumber
        varchar department
        int batchYear
        timestamptz createdAt
    }

    Credential {
        uuid id PK
        varchar credentialId UK
        uuid institutionId FK
        uuid studentId FK
        varchar credentialType
        varchar degreeName
        varchar department
        int graduationYear
        decimal cgpaRaw
        int cgpaScaled
        varchar blindingSalt
        varchar commitment UK
        text signature
        CredentialStatus status
        varchar onChainTxHash
        timestamptz issuedAt
        timestamptz expiresAt
    }

    CredentialPresentation {
        uuid id PK
        uuid credentialId FK
        uuid holderId FK
        varchar verifierNonce UK
        jsonb disclosedClaims
        boolean isConsumed
        timestamptz expiresAt
        timestamptz createdAt
    }

    VerificationRequest {
        uuid id PK
        uuid presentationId FK
        uuid credentialId FK
        VerificationType verificationType
        VerificationResult resultStatus
        int zkThreshold
        varchar clientIpHash
        varchar userAgent
        timestamptz executedAt
    }

    RevocationRecord {
        uuid id PK
        uuid credentialId FK,UK
        uuid institutionId FK
        RevocationReason reasonCode
        text reasonDetails
        varchar onChainTxHash UK
        timestamptz revokedAt
    }

    AuditLog {
        uuid id PK
        uuid actorId FK
        varchar action
        varchar entityType
        varchar entityId
        varchar ipAddress
        jsonb metadata
        timestamptz createdAt
    }
```

---

## 2. Referential Cardinality Summary

1. **`User` $\leftrightarrow$ `Institution`**: $1 \text{ to } 0..1$. An administrative user account may administer exactly one educational institution profile.
2. **`User` $\leftrightarrow$ `Student`**: $1 \text{ to } 0..1$. A student user account links to exactly one student profile.
3. **`Institution` $\leftrightarrow$ `InstitutionKey`**: $1 \text{ to } 1..N$. An institution holds at least one active EdDSA signing key and history of rotated keys.
4. **`Institution` $\leftrightarrow$ `Credential`**: $1 \text{ to } 0..N$. An approved institution issues many academic credentials.
5. **`Student` $\leftrightarrow$ `Credential`**: $1 \text{ to } 0..N$. A student holds one or more academic credentials (e.g., Degree and Transcript).
6. **`Credential` $\leftrightarrow$ `RevocationRecord`**: $1 \text{ to } 0..1$. A credential can be revoked at most once by its issuing institution.
7. **`Credential` $\leftrightarrow$ `CredentialPresentation`**: $1 \text{ to } 0..N$. A credential generates multiple ephemeral QR presentations over its lifetime.
