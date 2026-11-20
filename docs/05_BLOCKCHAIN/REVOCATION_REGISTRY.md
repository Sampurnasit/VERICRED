# REVOCATION_REGISTRY.md — Dynamic Revocation & Status Enforcement

> **Document ID**: DOC-BLOCKCHAIN-005  
> **Status**: Confirmed Technical Specification  
> **Contract**: `RevocationRegistry.sol`

---

## 1. Purpose & Responsibilities

`RevocationRegistry.sol` guarantees that an issuing institution can permanently and immutably invalidate a credential if an academic integrity breach, degree retraction, or administrative error occurs. Verifiers query this registry during every verification check to guarantee dynamic validity.

```mermaid
flowchart TD
    Verifier[Verifier / Recruiter] -->|Query: isCredentialRevoked(credHash)| RR[RevocationRegistry.sol]
    RR -->|Read Storage: mapping isRevoked| State[(Polygon Amoy Storage)]
    State -->|returns false| Active[Status: ACTIVE]
    State -->|returns true| Revoked[Status: REVOKED (Display Reason & Timestamp)]
```

---

## 2. Revocation Reason Taxonomy

When revoking a credential, the institution passes a standardized `uint8 reasonCode`:

| Code (`uint8`) | Reason Name | Operational Meaning |
| :--- | :--- | :--- |
| **`0`** | `UNSPECIFIED` | Default generic invalidation |
| **`1`** | `DISCIPLINARY` | Plagiarism, academic dishonesty, conduct code breach |
| **`2`** | `ADMIN_ERROR` | Clerical typographical mistake or duplicate issuance |
| **`3`** | `RETRACTED` | Student withdrew, transferred, or degree replaced |

---

## 3. Strict Authorization Guardrails

To prevent unauthorized parties or malicious actors from revoking credentials:
1. `RevocationRegistry` queries `CredentialRegistry.getCredentialIssuer(credHash)`.
2. The caller's address (`msg.sender`) must strictly match the registered issuer address:
   ```solidity
   address registeredIssuer = credentialRegistry.getCredentialIssuer(credHash);
   if (msg.sender != registeredIssuer) {
       revert OnlyOriginalIssuerCanRevoke(msg.sender, registeredIssuer);
   }
   ```
3. Even the contract deployer / platform administrator **cannot** revoke a university's credential, preserving sovereign institutional authority.

---

## 4. Function Signatures & Interface

```solidity
interface IRevocationRegistry {
    function revokeCredential(
        bytes32 credHash,
        uint8 reasonCode
    ) external returns (bool);

    function isCredentialRevoked(
        bytes32 credHash
    ) external view returns (bool);

    function getRevocationDetails(
        bytes32 credHash
    ) external view returns (
        bool revoked,
        uint8 reasonCode,
        uint64 revokedAt,
        address revokedBy
    );
}
```
