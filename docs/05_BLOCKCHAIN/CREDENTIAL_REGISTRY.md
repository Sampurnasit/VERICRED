# CREDENTIAL_REGISTRY.md — Credential Existence & Commitment Anchoring

> **Document ID**: DOC-BLOCKCHAIN-004  
> **Status**: Confirmed Technical Specification  
> **Contract**: `CredentialRegistry.sol`

---

## 1. Purpose & Responsibilities

`CredentialRegistry.sol` provides an immutable on-chain record that a specific academic credential was legitimately minted by an authorized institution at a specific point in time. It prevents fraudulent backdating and binds the credential's cryptographic commitment ($C$) to the issuing university's address.

```mermaid
flowchart LR
    IssuerAddress[Institution EVM Address] -->|issueCredential(credHash, commitment)| CR[CredentialRegistry]
    CR -->|Query Authorization| IR[InstitutionRegistry]
    IR -->|isAuthorized == true| CR
    CR -->|Store Mapping & Emit Event| Blockchain[(Polygon Amoy State)]
```

---

## 2. Storage Architecture & Anti-Bloat Strategy

To prevent excessive blockchain storage fees and avoid polluting the EVM state with personal data:
- **`credHash` (`bytes32`)**: The SHA-256 digest of the canonical credential identifier and schema.
- **`commitment` (`bytes32`)**: The salted Poseidon hash of the student's scaled academic grade ($C = \text{Poseidon}(x, s)$).
- **`issuedAt` (`uint64`)**: The block timestamp when the transaction was mined.
- **`issuer` (`address`)**: The verified university address that executed the issuance.

### Storage Layout Optimization
All fields are packed into exactly **two 32-byte storage slots**:
- Slot 0: `address issuer` (20 bytes) + `uint64 issuedAt` (8 bytes) = 28 bytes.
- Slot 1: `bytes32 commitment` = 32 bytes.

---

## 3. Function Signatures & Interface

```solidity
interface ICredentialRegistry {
    function issueCredential(
        bytes32 credHash,
        bytes32 commitment
    ) external returns (bool);

    function issueCredentialBatch(
        bytes32[] calldata credHashes,
        bytes32[] calldata commitments
    ) external returns (bool);

    function getCredentialIssuer(
        bytes32 credHash
    ) external view returns (address);

    function getCredentialCommitment(
        bytes32 credHash
    ) external view returns (bytes32);

    function credentialExists(
        bytes32 credHash
    ) external view returns (bool);
}
```

---

## 4. Batch Issuance Optimization

For university graduating classes (e.g., 500+ degrees), `issueCredentialBatch` executes atomic batch anchoring:
- Iterates across arrays in memory, asserting `credHashes.length == commitments.length`.
- Emits a batch issuance event, reducing individual transaction gas overhead by $\approx 40\%$ compared to individual transactions.
