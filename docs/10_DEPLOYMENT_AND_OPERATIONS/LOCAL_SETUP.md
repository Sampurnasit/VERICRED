# LOCAL_SETUP.md — Local Development Environment Setup Guide

> **Document ID**: DOC-OPS-001  
> **Status**: Confirmed Technical Specification

---

## 1. Prerequisites & Tooling Requirements

Ensure the following tools are installed on your workstation:
- **Node.js**: `v20.12.0 LTS` or higher
- **pnpm**: `v9.0.0` or higher (`npm install -g pnpm`)
- **Docker & Docker Compose**: Docker Desktop 4.28+ (for PostgreSQL 16 & Redis 7)
- **Rust & Cargo**: (Required if compiling Circom circuits from source)
- **Circom Compiler**: `v2.1.8+` (`cargo install --git https://github.com/iden3/circom.git`)
- **snarkjs**: `npm install -g snarkjs`

---

## 2. Step-by-Step Installation Runbook

```bash
# 1. Clone Repository
git clone https://github.com/vericred/vericred.git
cd vericred

# 2. Install Monorepo Dependencies
pnpm install

# 3. Configure Local Environment
cp .env.example .env

# 4. Start Local PostgreSQL and Redis via Docker Compose
docker-compose up -d

# 5. Execute Prisma Database Migrations & Seed Demo Data
pnpm --filter @vericred/api db:migrate
pnpm --filter @vericred/api db:seed

# 6. Compile Smart Contracts & Start Local Hardhat EVM Node
pnpm --filter @vericred/blockchain compile
# In a separate terminal:
pnpm --filter @vericred/blockchain hardhat node

# 7. Deploy Contracts to Local Hardhat Node
pnpm --filter @vericred/blockchain hardhat run scripts/deploy.ts --network localhost

# 8. Compile Circom Circuits & Build WASM / ZKey Artifacts
pnpm --filter @vericred/zk build:circuits

# 9. Start Web & API Development Servers Concurrently
pnpm dev
```

---

## 3. Local Service Endpoints

- **Web Application**: `http://localhost:3000`
- **Backend API Gateway**: `http://localhost:4000/api/v1`
- **PostgreSQL Connection**: `postgresql://postgres:postgres@localhost:5432/vericred_dev`
- **Redis Connection**: `redis://localhost:6379`
- **Hardhat EVM RPC**: `http://127.0.0.1:8545`
