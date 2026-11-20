# ER_DIAGRAM.md — Canonical Entity Relationship Diagram

> **Document ID**: DIAG-003  
> **Status**: Confirmed Technical Specification  
> **Canonical Schema Reference**: [docs/03_DATABASE_AND_BACKEND/DATABASE_DESIGN.md](../docs/03_DATABASE_AND_BACKEND/DATABASE_DESIGN.md)

---

## 1. Full Relational Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| Institution : "administers (1:1)"
    User ||--o| Student : "profile of (1:1)"
    User ||--o{ AuditLog : "initiates (1:N)"
    User ||--o{ InstitutionApproval : "reviews (1:N)"

    Institution ||--o{ InstitutionApproval : "receives (1:N)"
    Institution ||--o{ InstitutionKey : "provisions (1:N)"
    Institution ||--o{ Student : "enrolls (1:N)"
    Institution ||--o{ Credential : "issues (1:N)"
    Institution ||--o{ RevocationRecord : "authorizes (1:N)"

    Student ||--o{ Credential : "custodies (1:N)"
    Student ||--o{ CredentialPresentation : "generates (1:N)"

    Credential ||--o{ CredentialPresentation : "derived into (1:N)"
    Credential ||--o| RevocationRecord : "invalidated by (1:1)"
    Credential ||--o{ VerificationRequest : "target of (1:N)"

    CredentialPresentation ||--o{ VerificationRequest : "scanned as (1:N)"

    User {
        uuid id PK
        varchar email UK
        varchar passwordHash
        UserRole role
        varchar firstName
        varchar lastName
        boolean isEmailVerified
        timestamptz createdAt
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
    }

    CredentialPresentation {
        uuid id PK
        uuid credentialId FK
        uuid holderId FK
        varchar verifierNonce UK
        jsonb disclosedClaims
        boolean isConsumed
        timestamptz expiresAt
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
```

For complete field types, indexes, and constraints, see [DATABASE_DESIGN.md](../docs/03_DATABASE_AND_BACKEND/DATABASE_DESIGN.md).
