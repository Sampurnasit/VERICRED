# INTEGRATION_ARCHITECTURE.md — External Systems & Gateway Interfaces

> **Document ID**: DOC-ARCH-005  
> **Status**: Confirmed Technical Specification

---

## 1. External Integration Topology

VERICRED is designed to interface with external blockchain networks, cryptographic key management systems, registrar databases, and distributed storage infrastructure.

```mermaid
flowchart TD
    subgraph VERICRED_Core ["VERICRED Backend Core"]
        API[Express / NestJS Gateway]
        Relay[Blockchain Transaction Relay]
    end

    subgraph Blockchain_Networks ["EVM Blockchain Networks"]
        AmoyPrimary["Polygon Amoy Primary RPC (Alchemy / Infura)"]
        AmoyFallback["Polygon Amoy Public Fallback Node"]
        Sepolia["Ethereum Sepolia (Optional Secondary)"]
    end

    subgraph Key_Management ["Key Management & HSM"]
        DevKeystore["Development Keystore (Local AES-256)"]
        AwsKms["AWS KMS / HashiCorp Vault (Production)"]
    end

    subgraph Data_Sources ["Institutional Systems"]
        SIS_CSV["Registrar CSV Exports (SIS / ERP)"]
        Webhooks["Inbound / Outbound Event Webhooks"]
    end

    subgraph Distributed_Storage ["Public Distribution"]
        IPFS["IPFS / Filecoin Gateway (Schemas & VKeys)"]
    end

    Relay -->|JSON-RPC with Fallback| AmoyPrimary
    Relay -.->|Failover| AmoyFallback
    API -->|Key Signing Request| AwsKms
    API -.->|Dev Fallback| DevKeystore
    API <--|Batch Ingestion| SIS_CSV
    API -->|Host Verification Keys| IPFS
```

---

## 2. EVM Blockchain Integration (Polygon Amoy)

### 2.1 RPC Provider Management & Failover
To prevent single-point-of-failure vulnerabilities during on-chain credential anchoring or revocation checks, the blockchain client uses an auto-switching `FallbackProvider`:

- **Primary Provider**: Alchemy / Infura dedicated RPC (`https://polygon-amoy.g.alchemy.com/v2/${API_KEY}`)
- **Secondary Provider**: QuickNode Dedicated Endpoint
- **Tertiary Provider**: Official Public RPC (`https://rpc-amoy.polygon.technology/`)
- **Quorum Configuration**: Read operations query high-priority nodes; write transactions use exponential backoff retry across providers.

### 2.2 Transaction Relay & Gas Optimization
The backend `BlockchainRelayService` manages:
- **EIP-1559 Gas Estimation**: Queries current `maxFeePerGas` and `maxPriorityFeePerGas` to ensure inclusion within $\le 2$ blocks.
- **Nonce Queuing**: Manages transaction nonces in Redis to prevent nonce collision under concurrent issuance workloads.
- **Re-org Protection**: Requires 5 block confirmations on Polygon Amoy before marking an on-chain transaction as permanently confirmed in the database.

---

## 3. Key Management & Cryptographic Signers

### 3.1 Development vs. Production Profiles

| Parameter | Development Profile | Production Profile |
| :--- | :--- | :--- |
| **Storage Mechanism** | Encrypted local file (`keystore.json`) | AWS KMS / HashiCorp Vault Transit Engine |
| **Encryption Standard**| AES-256-GCM with PBKDF2 derivation | Hardware-enforced AES-256 HSM keys |
| **Key Extraction** | Available only to backend memory | Non-extractable (asymmetric sign via KMS API) |
| **Audit Trails** | Local Winston logging | AWS CloudTrail / Vault immutable audit logs |

---

## 4. Institutional SIS / ERP Integration (Bulk CSV)

Higher education institutions utilize disparate Student Information Systems (Ellucian Banner, Oracle PeopleSoft, Workday Student). VERICRED integrates via a standardized, schema-validated CSV bulk issuance ingestor:
- **Encoding**: UTF-8, RFC 4180 compliant.
- **Dry-Run Validation Pipeline**: Parses and validates all rows against Zod schemas; reports row-level errors before generating cryptographic signatures.
- **Atomic Batch Execution**: Commits database records and dispatches batched blockchain transactions to minimize gas overhead.

---

## 5. Decentralized Storage (IPFS / Verification Key CDN)

Public cryptographic artifacts required for independent verification are distributed via decentralized storage:
- **Artifacts Hosted**:
  1. `CgpaThresholdValidator.vkey.json`: Public Groth16 verification key.
  2. `academicCredential.schema.json`: W3C VC JSON-LD schema definitions.
- **Content Addressing**: Referenced via permanent IPFS CIDs (`ipfs://bafy...`) mirrored across public Cloudflare and Pinata IPFS gateways.
