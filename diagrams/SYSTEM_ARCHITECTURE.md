# SYSTEM_ARCHITECTURE.md — System Architecture & Topology Diagrams

> **Document ID**: DIAG-001  
> **Status**: Confirmed Technical Specification

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client_Layer ["Client & Prover Tier"]
        Browser_Inst["Institution Dashboard (Next.js 14)"]
        Browser_Student["Student Wallet & Prover (Next.js + snarkjs/WASM)"]
        Browser_Verifier["Public Verification Portal (Next.js 14)"]
        Browser_Admin["Platform Admin Console (Next.js 14)"]
    end

    subgraph Gateway_Tier ["API Gateway & Security Tier"]
        ALB["Application Load Balancer (HTTPS / TLS 1.3)"]
        RateLimiter["Redis Sliding-Window Rate Limiter"]
        AuthMiddleware["JWT / Argon2id RBAC Guard"]
        APIServer["Express / NestJS REST Gateway (apps/api)"]
    end

    subgraph Service_Tier ["Application Service Core"]
        InstSvc["Institution Service"]
        CredSvc["Credential Issuance Service"]
        VerifySvc["Verification Engine"]
        ZkSvc["ZK Proof Service"]
        RelaySvc["Blockchain Relay Service"]
    end

    subgraph Cryptographic_Tier ["Cryptographic Primitives"]
        BabyJub["BabyJubjub Curve Engine"]
        Poseidon["Poseidon Hash Adapter"]
        KMS["AWS KMS / Keystore"]
    end

    subgraph Persistence_Tier ["Data & Cache Tier"]
        DB[(PostgreSQL 16 Multi-AZ)]
        Cache[(Redis 7 Cache / Nonce Store)]
    end

    subgraph Blockchain_Tier ["Polygon Amoy EVM Settlement Layer"]
        IR["InstitutionRegistry.sol"]
        CR["CredentialRegistry.sol"]
        RR["RevocationRegistry.sol"]
    end

    Client_Layer -->|HTTPS / REST| ALB
    ALB --> RateLimiter --> AuthMiddleware --> APIServer
    APIServer --> Service_Tier
    CredSvc --> Cryptographic_Tier
    Service_Tier --> Persistence_Tier
    RelaySvc -->|JSON-RPC| Blockchain_Tier
    VerifySvc -->|Query State| Blockchain_Tier
    Browser_Student -->|In-Browser Groth16 Prover| Browser_Verifier
```

---

## 2. Network Topology & Deployment Zones

```mermaid
graph LR
    subgraph Public_Internet ["Public Zone"]
        Users[Web Clients / Verifiers]
        AmoyNet[Polygon Amoy Validators]
    end

    subgraph DMZ ["Cloudflare Edge / DMZ"]
        WAF[Cloudflare DDoS & WAF]
        EdgeDNS[Edge DNS / CDN]
    end

    subgraph Private_VPC ["Private AWS VPC"]
        ECS[ECS Fargate Tasks]
        RDS[(RDS PostgreSQL 16)]
        Redis[(ElastiCache Redis 7)]
        KMS[(AWS KMS Vault)]
    end

    Users --> WAF --> EdgeDNS --> ECS
    ECS --> RDS
    ECS --> Redis
    ECS --> KMS
    ECS -->|Outbound HTTPS RPC| AmoyNet
```
