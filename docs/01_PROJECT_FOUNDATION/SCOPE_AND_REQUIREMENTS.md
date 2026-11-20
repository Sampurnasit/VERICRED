# SCOPE_AND_REQUIREMENTS.md — System Scope & Boundary Management

> **Document ID**: DOC-FOUNDATION-003  
> **Status**: Confirmed Technical Specification

---

## 1. Scope Governance Strategy

To ensure rapid, defect-free delivery without architectural drift, VERICRED enforces strict boundary separation across delivery tiers:
1. **MVP (Minimum Viable Product)**: Core functionality required for an operational, end-to-end credential issuance and verification platform.
2. **Hackathon Demonstration Features**: Concrete, demonstrable scenarios highlighting differentiators (e.g., ZK proofs, on-chain revocation, instant QR scanning).
3. **Post-MVP Features**: High-value enhancements planned for subsequent sprint cycles.
4. **Long-Term Features**: Future research initiatives and enterprise integrations.
5. **Explicitly Excluded Features**: Anti-patterns or out-of-scope capabilities rejected to protect system security and simplicity.

---

## 2. Scope Matrix

```mermaid
quadrantChart
    title Feature Scope & Value Matrix
    x-axis Low Architectural Risk --> High Architectural Risk
    y-axis High MVP Priority --> Post-MVP / Future
    quadrant-1 Research & Complex (Post-MVP)
    quadrant-2 Core Differentiators (MVP)
    quadrant-3 Core Foundation (MVP)
    quadrant-4 Defer / Exclude
    "PostgreSQL & Auth": [0.15, 0.90]
    "W3C VC Issuance": [0.25, 0.85]
    "On-Chain Registries": [0.45, 0.80]
    "ZK CGPA Threshold": [0.65, 0.75]
    "Dynamic QR Verification": [0.30, 0.70]
    "Bulk CSV Issuance": [0.20, 0.65]
    "Multi-Attribute ZK": [0.85, 0.35]
    "Hardware HSM / KMS": [0.70, 0.30]
    "DID:ION / Sidetree": [0.90, 0.15]
    "Paid Credential Marketplace": [0.40, 0.10]
```

---

## 3. Tier 1: Minimum Viable Product (MVP) Core

The following capabilities constitute the mandatory baseline:

- **Authentication & RBAC**:
  - Secure registration and login via Argon2id.
  - Four distinct roles: `ADMIN`, `INSTITUTION`, `STUDENT`, `VERIFIER`.
  - Administrator approval workflow for new institutions.
- **Credential Issuance Engine**:
  - Single credential issuance web form with real-time field validation.
  - Standard academic schema: Student Name, Student ID, Degree, Branch, Session, Year, CGPA.
  - Fixed-point integer conversion ($8.72 \rightarrow 872$) and salted Poseidon commitment ($C = \text{Poseidon}(x, s)$).
  - Off-chain EdDSA signing over BabyJubjub curve.
- **Student Wallet**:
  - Web-based credential repository displaying active and revoked credentials.
  - Full credential detail inspection and JSON export.
  - Ephemeral Verifiable Presentation generator with 15-minute TTL and verifier nonce.
  - Dynamic QR code generation with opaque presentation URL.
- **Public Verification Portal**:
  - Unauthenticated access.
  - Camera-based QR code scanning and direct URL lookup.
  - Multi-check validation: signature integrity, issuer authorization, expiration, and on-chain revocation status.
  - Detailed verification report displaying individual pass/fail metrics.
- **Blockchain Anchoring (Polygon Amoy)**:
  - `InstitutionRegistry.sol`: Approved institution addresses and active public keys.
  - `CredentialRegistry.sol`: Credential ID, issuer address, and cryptographic commitment.
  - `RevocationRegistry.sol`: On-chain revocation mapping and timestamps.
- **Zero-Knowledge Proof Demonstrator**:
  - Exactly **one** working end-to-end ZK circuit: **CGPA Threshold Proof** ($\text{CGPA} \ge T$).
  - Circuit enforces range condition, commitment opening, and issuer signature verification.
  - In-browser proof generation via `snarkjs` and public verification in the portal.

---

## 4. Tier 2: Hackathon Demonstration Features

Features engineered specifically to demonstrate technical depth during live evaluations:

1. **Demonstration 1 (Issuance)**: Real-time credential issuance to fictional student Aarav Sen (8.72 CGPA), showcasing immediate commitment anchoring on Polygon Amoy.
2. **Demonstration 2 (Standard QR Verification)**: Instant smartphone/webcam QR scan yielding a green `VALID CREDENTIAL` report with complete issuer provenance.
3. **Demonstration 3 (Privacy-Preserving ZK Proof)**: Recruiter requests $\text{CGPA} \ge 8.0$. Aarav generates a Groth16 proof; recruiter verifies `ELIGIBILITY PROVEN` without learning Aarav's 8.72 CGPA.
4. **Demonstration 4 (Tamper Detection)**: Manual tampering of student CGPA or certificate payload results in an immediate red `INVALID SIGNATURE` alert.
5. **Demonstration 5 (On-Chain Revocation)**: Institution revokes credential on Polygon Amoy; immediate re-verification yields a red `REVOKED CREDENTIAL` status.
6. **Bulk Issuance Engine**: CSV parser processing 50+ student credential rows with pre-flight dry-run error checking.

---

## 5. Tier 3: Post-MVP Enhancements

Planned for implementation after hackathon baseline stabilization:

- **Multi-Attribute Zero-Knowledge Circuits**:
  - Proving graduation year range (e.g., $2024 \le \text{year} \le 2026$).
  - Degree ownership proofs without disclosing GPA or branch.
  - Department/Branch set-membership proofs (e.g., $\text{branch} \in \{\text{CSE}, \text{IT}, \text{ECE}\}$).
- **Advanced Identity Standards**:
  - Implementation of W3C `did:web` and `did:key` resolution methods.
  - Support for BBS+ signatures and JSON-LD selective disclosure cryptography.
- **Enterprise Key Management**:
  - Direct integration with AWS CloudHSM and HashiCorp Vault for institutional signing keys.
  - Multisig governance contracts for institution registration approval.
- **Mobile Native Applications**:
  - Dedicated iOS and Android sovereign wallet apps utilizing Biometric Secure Enclaves.

---

## 6. Tier 4: Long-Term Research & Explorations

- **Cross-Chain Credential Attestation**: Interoperability with Ethereum Mainnet, Arbitrum, and Optimism via LayerZero or Chainlink CCIP.
- **Recursive zk-SNARKs**: Using Nova or Halo2 to aggregate hundreds of course-level marks into a single constant-size transcript proof.
- **Decentralized Storage Migration**: Storing encrypted credential blobs on IPFS / Filecoin with client-side decryption keys.

---

## 7. Explicitly Excluded Features (Out of Scope)

The following items are strictly prohibited from being built during current phases:

1. **Storing Plaintext Academic Data On-Chain**: Anti-pattern. Violates GDPR, FERPA, and basic data privacy principles.
2. **Tokenized Credential NFTs (ERC-721 / ERC-1155)**: Academic credentials are non-transferable, private attestation claims, not tradable collectibles.
3. **Direct Centralized LMS / ERP Integrations**: Direct API connectors to Banner, Canvas, Blackboard, or PeopleSoft are excluded; bulk CSV upload suffices for MVP.
4. **Monetized Verification Fees / In-App Payments**: Adding payment gateways or crypto paywalls introduces unnecessary friction for public verification.
5. **Simulated / Mock Cryptography**: Replacing real Circom proofs or EdDSA signatures with boolean stubs is forbidden in production code.
