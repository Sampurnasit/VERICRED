# SEQUENCE_DIAGRAMS.md — System Sequence Specifications

> **Document ID**: DIAG-004  
> **Status**: Confirmed Technical Specification

---

## 1. Zero-Knowledge Proof Generation & Verification Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter as Recruiter / Verifier
    actor Student as Student (Wallet UI)
    participant Worker as Browser Web Worker (snarkjs/WASM)
    participant Portal as Public Verify Portal
    participant API as Backend API
    participant Amoy as Polygon Amoy (IR & RR)

    Recruiter->>Student: Request: "Prove CGPA >= 8.0"
    Student->>Student: Selects Credential & Enters T = 8.0 (800)
    Student->>Worker: Load Witness Inputs: x=872, s, Sig(R8, S), C, Ax, Ay
    Worker->>Worker: Compute WASM Witness
    Worker->>Worker: Generate Groth16 Proof (A, B, C) via .zkey
    Worker-->>Student: Proof & Public Signals Ready
    Student->>Portal: Submit Presentation (Proof, [C, 800, Ax, Ay])
    Portal->>API: POST /api/v1/verification/zk-verify
    API->>API: snarkjs.groth16.verify(vkey, publicSignals, proof)
    API->>Amoy: InstitutionRegistry.isIssuerKeyAuthorized(Ax, Ay)
    Amoy-->>API: Returns: true (Key Active & Accredited)
    API->>Amoy: RevocationRegistry.isCommitmentRevoked(C)
    Amoy-->>API: Returns: false (Credential Active)
    API-->>Portal: Result: ELIGIBILITY PROVEN (Status: VALID)
    Portal-->>Recruiter: Displays "Candidate Meets CGPA >= 8.0" (Verified)
```

---

## 2. Dynamic Credential Revocation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Inst as University Registrar
    participant Portal as Institution Console
    participant API as Backend API
    participant Amoy as Polygon Amoy (RR)
    actor Verifier as Recruiter

    Inst->>Portal: Selects Credential & Clicks "Revoke"
    Portal->>API: POST /api/v1/credentials/:id/revoke (Reason: DISCIPLINARY)
    API->>Amoy: Submit revokeCredential(credHash, 1)
    Amoy-->>API: Tx Confirmed & Event Emitted
    API-->>Portal: 200 OK (Revoked on Blockchain)

    Note over Verifier: Subsequent Verification Attempt
    Verifier->>API: Request Verification for Revoked Credential
    API->>Amoy: Query isCredentialRevoked(credHash)
    Amoy-->>API: Returns: true
    API-->>Verifier: Status: REVOKED (Displays Warning & Reason)
```

For all other end-to-end data flow sequences, see [DATA_FLOW_ARCHITECTURE.md](../docs/02_SYSTEM_ARCHITECTURE/DATA_FLOW_ARCHITECTURE.md).
