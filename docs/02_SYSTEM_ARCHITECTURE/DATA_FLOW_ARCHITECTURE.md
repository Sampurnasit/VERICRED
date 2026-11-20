# DATA_FLOW_ARCHITECTURE.md — System Data Flows & Sequences

> **Document ID**: DOC-ARCH-003  
> **Status**: Confirmed Technical Specification

---

## 1. End-to-End System Data Flow Overview

This document specifies the step-by-step movement of data across actors, frontend applications, API gateways, databases, cryptographic engines, and the Polygon Amoy blockchain.

```mermaid
flowchart LR
    A[Institution] -->|1. Issue & Sign| B(Backend API)
    B -->|2. Store Encrypted| C[(PostgreSQL)]
    B -->|3. Anchor Commitment| D[Polygon Amoy]
    B -->|4. Deliver| E[Student Wallet]
    E -->|5. Generate Presentation / ZK| F[Verifier Portal]
    F -->|6. Verify Signature & Status| D
```

---

## 2. Sequence 1: Institution Registration & Approval

```mermaid
sequenceDiagram
    autonumber
    actor Inst as Institution Officer
    participant Web as Web Portal
    participant API as Backend API
    participant DB as PostgreSQL
    actor Admin as Platform Admin
    participant BC as Polygon Amoy (IR)

    Inst->>Web: Register Account & Submit Accreditation Info
    Web->>API: POST /api/v1/auth/register-institution
    API->>DB: Insert User & Institution (Status: PENDING)
    API-->>Web: 201 Created (Pending Review Notice)

    Admin->>Web: Inspect Pending Applications
    Web->>API: GET /api/v1/admin/institutions/pending
    API->>DB: Fetch Pending Institutions
    API-->>Web: Institution Application Data

    Admin->>Web: Click "Approve Institution"
    Web->>API: POST /api/v1/admin/institutions/:id/approve
    API->>DB: Update Institution Status -> APPROVED
    API->>BC: Submit approveInstitution(instAddress)
    BC-->>API: Tx Confirmed (Event Emitted)
    API-->>Web: Institution Approved Successfully
```

---

## 3. Sequence 2: Academic Credential Issuance & Anchoring

```mermaid
sequenceDiagram
    autonumber
    actor Inst as Institution Officer
    participant Web as Institution Dashboard
    participant API as Backend API
    participant Crypto as @vericred/crypto
    participant DB as PostgreSQL
    participant BC as Polygon Amoy (CR)
    participant Stud as Student Wallet

    Inst->>Web: Input Student Academic Record (CGPA: 8.72)
    Web->>API: POST /api/v1/credentials/issue
    API->>API: Scale CGPA: 8.72 * 100 = 872
    API->>Crypto: Generate 254-bit Salt (s)
    API->>Crypto: Compute C = Poseidon(872, s)
    API->>Crypto: Sign (C, schemaDigest) with Inst EdDSA Key
    API->>DB: Save Credential Record (Status: ACTIVE, C, Signature)
    API->>BC: submit issueCredential(credId, instAddress, C)
    BC-->>API: Tx Hash & Block Number Confirmed
    API->>DB: Update Credential with onChainTxHash
    API->>Stud: Notify & Deliver Credential to Student Dashboard
    API-->>Web: 201 Issued (Display Tx Hash & Credential ID)
```

---

## 4. Sequence 3: Student Sovereign Sharing & QR Generation

```mermaid
sequenceDiagram
    autonumber
    actor Stud as Student
    participant Wallet as Student Web Wallet
    participant API as Backend API
    participant Redis as Redis Cache
    actor Verifier as Recruiter

    Stud->>Wallet: Select Credential & Click "Share"
    Wallet->>Wallet: Select Claims to Disclose (Degree, Year; Omit Exact Marks)
    Wallet->>API: POST /api/v1/presentations/generate
    API->>API: Generate 128-bit Ephemeral Nonce & UUID (presentationId)
    API->>Redis: Store Presentation Metadata (TTL: 15 mins, Nonce, Scope)
    API-->>Wallet: Return presentationUrl: https://vericred.net/verify/p/:id
    Wallet->>Wallet: Render Dynamic QR Code on Screen
    Verifier->>Wallet: Scan QR Code with Smartphone / Webcam
```

---

## 5. Sequence 4: Public Credential Verification

```mermaid
sequenceDiagram
    autonumber
    actor Verifier as Recruiter
    participant Portal as Public Verify Portal
    participant API as Backend API
    participant DB as PostgreSQL
    participant Redis as Redis Cache
    participant BC as Polygon Amoy (IR & RR)

    Verifier->>Portal: Scan QR or Open /verify/p/:presentationId
    Portal->>API: GET /api/v1/verification/presentation/:id
    API->>Redis: Lookup Presentation by ID & Verify Nonce Freshness
    API->>DB: Fetch Signed Credential Record
    API->>API: Verify EdDSA Signature against Issuer Public Key
    API->>BC: Query InstitutionRegistry.isAuthorized(issuerAddress)
    BC-->>API: Returns: true
    API->>BC: Query RevocationRegistry.isRevoked(credHash)
    BC-->>API: Returns: false
    API->>Redis: Invalidate Ephemeral Nonce (Prevent Replay)
    API-->>Portal: Verification Result (Status: VALID, Integrity: OK, Not Revoked)
    Portal-->>Verifier: Display Green Verification Report
```

---

## 6. Sequence 5: Zero-Knowledge Proof Generation & Verification

```mermaid
sequenceDiagram
    autonumber
    actor Stud as Student
    actor Verifier as Recruiter
    participant Browser as Student Browser (snarkjs/WASM)
    participant Portal as Public Verify Portal
    participant API as Backend API
    participant BC as Polygon Amoy (IR & RR)

    Verifier->>Stud: Request Requirement: CGPA >= 8.0
    Stud->>Browser: Select Credential & Enter Threshold: 8.0 (800)
    Browser->>Browser: Load Private Witness: x=872, s, EdDSA Signature
    Browser->>Browser: Compute Witness via CgpaThresholdValidator.wasm
    Browser->>Browser: Generate Groth16 Proof (A, B, C) via .zkey
    Browser->>Portal: Transmit Proof + Public Inputs: [C, 800, Ax, Ay]
    Portal->>API: POST /api/v1/verification/zk-verify
    API->>API: Execute snarkjs.groth16.verify(vkey, publicInputs, proof)
    Note over API: Verifies: 872 >= 800, C == Poseidon(872, s), Signature Valid
    API->>BC: Verify Issuer Key [Ax, Ay] in InstitutionRegistry
    BC-->>API: Key Verified Active
    API->>BC: Verify Commitment C in RevocationRegistry
    BC-->>API: Status: Not Revoked
    API-->>Portal: Result: ELIGIBILITY PROVEN (Exact CGPA Remains Hidden)
    Portal-->>Verifier: Display "Candidate Meets CGPA >= 8.0" (Verified)
```

---

## 7. Sequence 6: Credential Revocation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Inst as Institution Officer
    participant Web as Institution Dashboard
    participant API as Backend API
    participant DB as PostgreSQL
    participant BC as Polygon Amoy (RR)
    actor Verifier as Recruiter

    Inst->>Web: Select Credential -> Click "Revoke"
    Web->>API: POST /api/v1/credentials/:id/revoke (Reason: Disciplinary)
    API->>DB: Check Caller is Authorized Officer of Issuing Institution
    API->>BC: Submit revokeCredential(credHash, reasonCode)
    BC-->>API: Revocation Event Emitted on Blockchain
    API->>DB: Update Credential Status -> REVOKED, Record Audit Log
    API-->>Web: Confirmation: Credential Revoked on Chain

    Note over Verifier: Subsequent Verification Attempt
    Verifier->>API: Request Verification for Revoked Credential
    API->>BC: Query RevocationRegistry.isRevoked(credHash)
    BC-->>API: Returns: true
    API-->>Verifier: Status: REVOKED (Display Revocation Timestamp & Notice)
```
