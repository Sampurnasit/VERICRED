# CI_CD_PIPELINE.md — Continuous Integration & Continuous Delivery

> **Document ID**: DOC-OPS-004  
> **Status**: Confirmed Technical Specification  
> **Platform**: GitHub Actions

---

## 1. CI/CD Pipeline Workflow Topology

VERICRED employs an automated GitHub Actions pipeline executing rigorous validation gates on every commit and pull request.

```mermaid
flowchart TD
    PR[Pull Request Submitted] --> Step1[1. Lint & Format Check: eslint, prettier]
    Step1 --> Step2[2. Type Check: tsc --noEmit]
    Step2 --> Step3[3. Unit & Integration Tests: Vitest]
    Step3 --> Step4[4. Smart Contract Tests & Slither: Hardhat]
    Step4 --> Step5[5. ZK Circuit Compilation & Verification: circom_tester]
    Step5 --> Step6[6. Docker Build & Vulnerability Scan: Trivy]
    Step6 --> Merge[PR Approved for Merge to main]
    Merge --> DeployStaging[Automated Deploy to Staging]
```

---

## 2. GitHub Actions Workflow Configuration (`.github/workflows/ci.yml`)

```yaml
name: VERICRED CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    name: Lint, Typecheck & Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgrespassword
          POSTGRES_DB: vericred_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint & Code Style
        run: pnpm lint

      - name: TypeScript Typecheck
        run: pnpm typecheck

      - name: Prisma Migrations
        run: pnpm --filter @vericred/api prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgrespassword@localhost:5432/vericred_test

      - name: Run Unit & Integration Tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgrespassword@localhost:5432/vericred_test
          REDIS_URL: redis://localhost:6379

      - name: Hardhat Smart Contract Tests & Coverage
        run: pnpm --filter @vericred/blockchain hardhat test

      - name: Circom ZK Circuit Tests
        run: pnpm --filter @vericred/zk test
```
