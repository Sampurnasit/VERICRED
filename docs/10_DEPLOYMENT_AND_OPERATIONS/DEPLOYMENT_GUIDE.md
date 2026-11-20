# DEPLOYMENT_GUIDE.md — Production Cloud Deployment Architecture

> **Document ID**: DOC-OPS-003  
> **Status**: Confirmed Technical Specification

---

## 1. Production Topology Overview

VERICRED is deployed across modern cloud infrastructure designed for high availability, zero-downtime rolling updates, and global low-latency CDN edge delivery.

```mermaid
flowchart TD
    DNS[Route 53 / Cloudflare DNS] --> CDN[Cloudflare Edge CDN]
    CDN -->|Static Assets & Pages| Vercel[Vercel Serverless / Edge (Next.js)]
    CDN -->|API & Verification Traffic| ALB[AWS Application Load Balancer]
    ALB --> ECS[AWS ECS Fargate / Docker Cluster (apps/api)]
    ECS --> RDS[(AWS RDS Aurora PostgreSQL 16 Multi-AZ)]
    ECS --> ElastiCache[(AWS ElastiCache Redis 7 Cluster)]
    ECS --> KMS[AWS KMS Hardware Security Module]
    ECS -->|JSON-RPC| AmoyNodes[Alchemy Dedicated Amoy RPC Cluster]
```

---

## 2. Component Deployment Guides

### 2.1 Frontend Portal (`apps/web`) on Vercel
- **Build Command**: `pnpm --filter @vericred/web build`
- **Output Directory**: `.next`
- **Environment Injections**: `NEXT_PUBLIC_*` contract addresses and CDN artifact paths.
- **Headers**: Injects strict CSP headers prohibiting inline scripts without nonces.

### 2.2 Backend REST Service (`apps/api`) on AWS ECS Fargate
- **Containerization**: Packaged via multi-stage Dockerfile (`node:20-alpine`).
- **Orchestration**: Runs minimum 2 tasks across distinct availability zones behind an Application Load Balancer.
- **Autoscaling**: Triggers additional tasks when average CPU exceeds $70\%$ or request latency exceeds $400\,\text{ms}$.

### 2.3 Relational Persistence (AWS RDS PostgreSQL 16)
- **Engine**: PostgreSQL 16.2 Multi-AZ deployment.
- **Connection Pooling**: Managed via AWS RDS Proxy / PgBouncer to prevent connection exhaustion.
- **Backups**: Automated daily snapshots retained for 30 days; continuous point-in-time recovery (PITR) with 5-minute RPO.

---

## 3. Production Launch Checklist

- [ ] All smart contracts deployed to Polygon Amoy and verified on Polygonscan.
- [ ] Relayer EOA wallet funded with at least 50 POL for gas subsidies.
- [ ] AWS KMS asymmetric key pairs provisioned for institutional signers.
- [ ] All secrets rotated out of development placeholders.
- [ ] Redis sliding-window rate limiters enabled.
- [ ] End-to-end smoke test executed against production verification endpoint.
