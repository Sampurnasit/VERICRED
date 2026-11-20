# DATA_FLOW_DIAGRAMS.md — Functional Data Flow Models (DFD Level 0 & Level 1)

> **Document ID**: DIAG-005  
> **Status**: Confirmed Technical Specification

---

## 1. DFD Level 0 — Context Diagram

```mermaid
flowchart TD
    subgraph Entities ["External Entities"]
        Inst[Educational Institution]
        Stud[Student / Holder]
        Verif[Verifier / Recruiter]
        Chain[(Polygon Amoy Blockchain)]
    end

    subgraph System ["0. VERICRED Platform Core"]
        Core((VERICRED Engine))
    end

    Inst -->|Institution Application & Issuer Keys| Core
    Inst -->|Academic Records & Revocation Requests| Core
    Core -->|Delivered Verifiable Credentials| Stud
    Stud -->|Verifiable Presentations & ZK Proofs| Core
    Core -->|Verification Reports| Verif
    Core -->|Opaque Anchors & Revocations| Chain
    Chain -->|On-Chain Status & Public Keys| Core
```

---

## 2. DFD Level 1 — Detailed Functional Decomposition

```mermaid
flowchart TB
    Inst[Institution] -->|Academic Claims| P1[1.0 Issuance & Signing Engine]
    P1 -->|Store Record| D1[(PostgreSQL: Credentials)]
    P1 -->|Anchor C| P2[2.0 Blockchain Relay]
    P2 -->|Transactions| D2[(Polygon Amoy Contracts)]
    P1 -->|Deliver VC| D3[(Student Sovereign Wallet)]
    
    Stud[Student] -->|Configure Claims| P3[3.0 Presentation Generator]
    D3 -->|Raw VC| P3
    P3 -->|Store Nonce| D4[(Redis: Nonce Store)]
    P3 -->|Render QR| Verif[Verifier]
    
    Stud -->|Select Threshold| P4[4.0 Client-Side ZK Prover]
    D3 -->|Private Witness x, s| P4
    P4 -->|Groth16 Proof| Verif
    
    Verif -->|Scan QR / Proof| P5[5.0 Verification Pipeline]
    D4 -->|Check Nonce| P5
    D2 -->|Query Status & Keys| P5
    P5 -->|Verification Report| Verif
```
