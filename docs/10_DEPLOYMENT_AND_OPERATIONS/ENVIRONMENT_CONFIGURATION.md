# ENVIRONMENT_CONFIGURATION.md — Environment Variables & Secrets Reference

> **Document ID**: DOC-OPS-002  
> **Status**: Confirmed Technical Specification

---

## 1. Environment Variable Catalog

The following variables configure the runtime environment across development, testing, and production:

| Variable Name | Required | Default / Example (Dev) | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `test`, `production`) |
| `PORT` | No | `4000` | HTTP port for backend REST API service |
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/vericred_dev` | PostgreSQL connection URI |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection URI for queues and cache |
| `JWT_ACCESS_SECRET`| Yes | `dev-insecure-access-secret-min32chars!!` | Secret key for signing 15-min JWT access tokens |
| `JWT_REFRESH_SECRET`| Yes | `dev-insecure-refresh-secret-min32chars!!` | Secret key for signing 7-day JWT refresh tokens |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed frontend origin for CORS headers |
| `POLYGON_AMOY_RPC_URL`| Yes | `https://rpc-amoy.polygon.technology/` | Polygon Amoy EVM JSON-RPC provider endpoint |
| `RELAYER_PRIVATE_KEY` | Dev | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | Hardhat Account #0 (Dev only! NEVER commit prod key) |
| `NEXT_PUBLIC_INSTITUTION_REGISTRY`| Yes | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Deployed `InstitutionRegistry.sol` address |
| `NEXT_PUBLIC_CREDENTIAL_REGISTRY` | Yes | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Deployed `CredentialRegistry.sol` address |
| `NEXT_PUBLIC_REVOCATION_REGISTRY` | Yes | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Deployed `RevocationRegistry.sol` address |

---

## 2. `.env.example` Baseline Template

Developers should copy this template to `.env`:

```env
# Server Runtime
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000

# Persistence & In-Memory Cache
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vericred_dev?schema=public"
REDIS_URL="redis://localhost:6379"

# Authentication Secrets (Generate via: openssl rand -base64 32)
JWT_ACCESS_SECRET="CHANGE_ME_IN_PRODUCTION_SECRET_KEY_MIN_32_CHARS"
JWT_REFRESH_SECRET="CHANGE_ME_IN_PRODUCTION_SECRET_KEY_MIN_32_CHARS"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# EVM Blockchain Integration
POLYGON_AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"
POLYGON_AMOY_CHAIN_ID=80002
RELAYER_PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000000"

# Smart Contract Addresses (Populated after deployment)
NEXT_PUBLIC_INSTITUTION_REGISTRY="0x0000000000000000000000000000000000000000"
NEXT_PUBLIC_CREDENTIAL_REGISTRY="0x0000000000000000000000000000000000000000"
NEXT_PUBLIC_REVOCATION_REGISTRY="0x0000000000000000000000000000000000000000"

# Public Artifact Hosting (CDN / IPFS)
NEXT_PUBLIC_ZK_VKEY_URL="/circuits/CgpaThresholdValidator.vkey.json"
NEXT_PUBLIC_ZK_WASM_URL="/circuits/CgpaThresholdValidator.wasm"
NEXT_PUBLIC_ZK_ZKEY_URL="/circuits/CgpaThresholdValidator.zkey"
```
