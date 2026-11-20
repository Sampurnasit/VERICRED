# CHANGELOG.md — Project Version History

All notable changes to the **VERICRED** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-20

### Added
- **Production Deployment Orchestration**:
  - Authored `docker-compose.prod.yml` provisioning production-grade PostgreSQL 16, Redis 7 (with append-only persistence and auth), API service, and Next.js standalone runner with isolated network bridging and automated healthchecks.
  - Built multi-stage Dockerfile for backend REST service (`apps/api/Dockerfile`) with automated Prisma generation, non-root user execution, and production caching.
  - Built multi-stage Dockerfile for frontend web portal (`apps/web/Dockerfile`) with Next.js standalone output optimization.
- **Continuous Integration & Delivery (`.github/workflows/ci.yml`)**:
  - Implemented GitHub Actions CI/CD workflow running PostgreSQL 16 and Redis 7 service containers.
  - Automated gates for monorepo dependency resolution, workspace build, TypeScript typecheck (`pnpm -r typecheck`), Prisma database migrations, automated unit & integration test suites, and Next.js production builds.
- **Master Demonstration Runbook (`DEMO_RUNBOOK.md`)**:
  - Created comprehensive, step-by-step master demonstration guide detailing quick-start commands, personas (Platform Admin, Dean Rostova, Aarav Sen, Verifier), and executable walkthroughs for Scenarios 1 through 5.
- **Environment Configuration Templates**:
  - Created `.env.example` at root, `apps/api/.env.example`, and `apps/web/.env.example` documenting all configuration keys, contract addresses, and security parameters.
- **Platform Verification & Quality Assurance**:
  - Monorepo verified with 79 passing automated tests (100% pass rate).
  - 0 TypeScript errors across all 9 packages.
  - Next.js production build passing with 14 static pages generated.

---

## [0.6.0] - 2026-11-20

### Added
- **Security Hardening (`apps/api`)**:
  - Implemented defense-in-depth Helmet middleware with strict Content-Security-Policy (CSP), HSTS preload (31536000s), `X-Frame-Options: DENY`, and `Cross-Origin-Resource-Policy: cross-origin`.
  - Built sliding-window rate limiting middleware (`apps/api/src/middleware/rateLimiter.ts`) enforcing rate limits on authentication (`/api/v1/auth`, 15 req/min) and public verification (`/api/v1/verify`, 100 req/min) with standard RFC headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`) and JSend `429 RATE_LIMIT_EXCEEDED` envelopes.
  - Implemented secure credential revocation API endpoint (`POST /api/v1/credentials/:id/revoke`) with strict institutional authority checks and immutable audit logging.
  - Added unit test suite in `apps/api/test/security.test.ts` (3/3 passing).
- **Master Demonstration Scenarios Suite (`apps/api/test/e2eDemonstrations.test.ts`)**:
  - Authored comprehensive end-to-end integration test suite testing all 5 Master Demonstration Scenarios:
    - **Scenario 1 (Issuance)**: Full issuance lifecycle with BabyJubjub signing and Poseidon commitment calculation ($C == \text{Poseidon}(872, s)$).
    - **Scenario 2 (Standard QR Verification)**: Ephemeral presentation generation with cryptographic nonce, multi-step verification, and single-use replay defense.
    - **Scenario 3 (Zero-Knowledge Selective Disclosure)**: Groth16 proof generation and verification for $8.72 \ge 8.00$, verifying raw GPA is not exposed.
    - **Scenario 4 (Tampering Detection)**: Detecting tampered academic claims, forged digital signatures, forged ZK public signals, and out-of-range student eligibility.
    - **Scenario 5 (Dynamic Revocation)**: Revoking credentials with disciplinary reason codes, immediate rejection of standard QR presentations, and rejection of ZK proof verification.
  - 12/12 demonstration scenario tests passing!
- **Zero-Knowledge Circuit Boundary Testing (`zk/test/zkCircuit.test.ts`)**:
  - Expanded circuit test coverage to 7 tests, verifying:
    - Rejection of out-of-range CGPA claims ($x = 1001 > 1000$).
    - Rejection of commitment mismatch ($C \ne \text{Poseidon}(x, s)$).
    - Rejection of corrupted Groth16 proof coordinates ($\pi_a, \pi_b, \pi_c$).
- **Playwright Frontend Testing Setup (`apps/web`)**:
  - Installed and configured `@playwright/test` with `playwright.config.ts`.
  - Authored `apps/web/e2e/demonstrationScenarios.spec.ts` testing the UI flows for institution issuance, student wallet QR presentations, ZK prover modals, multi-tab verification console, and revocation indicators.
- **Monorepo Quality & Test Verification**:
  - Total automated tests passing: **79/79 across all packages** (`@vericred/crypto`: 10, `@vericred/zk`: 7, `@vericred/api`: 42, `@vericred/blockchain`: 20).
  - 0 TypeScript compilation errors (`pnpm -r typecheck`).
  - Next.js production build (`next build`) passing with all 14 static routes prerendered.

---

## [0.5.0] - 2026-11-20

### Added
- **Circom 2.1 Zero-Knowledge Circuits (`zk/circuits`)**:
  - Authored `CgpaThresholdValidator.circom` with Poseidon commitment verification ($C = \text{Poseidon}(x, s)$), fixed-point domain constraints ($0 \le x \le 1000$), comparator template ($x \ge T$), and in-circuit EdDSA BabyJubjub signature verification.
  - Successfully compiled circuit with `circom.exe` yielding 7,652 non-linear constraints and 989 linear constraints across 8,638 wires.
- **Cryptographic Setup & Ceremony Pipeline (`zk/scripts/setupZk.mjs`)**:
  - Automated 14th-order BN254 Powers of Tau Phase 1 ceremony (16,384 constraints).
  - Executed Groth16 Phase 2 circuit-specific setup producing proving key (`circuit_final.zkey`), verification key (`verification_key.json`), and on-chain verifier (`Groth16Verifier.sol`).
  - Automated artifact distribution across `apps/api`, `apps/web/public/zk/`, and `blockchain/contracts/`.
- **EVM Verifier Contract (`blockchain/contracts/Groth16Verifier.sol`)**:
  - Exported and compiled `Groth16Verifier.sol` with Hardhat and ethers.js typings.
- **Off-Chain Verification Engine (`apps/api`)**:
  - Implemented `verifyZkProof()` in `VerificationService` performing real BN254 cryptographic pairing checks via `snarkjs.groth16.verify`.
  - Added public API endpoint `POST /api/v1/verify/zk` binding public signals to on-chain accredited institution keys (`InstitutionKey`) and checking dynamic revocation status.
  - Added 4 unit tests in `apps/api/test/zkVerification.test.ts` (all passing).
- **Client-Side ZK Prover & Verification UI (`apps/web`)**:
  - Built interactive ZK proof generator modal in `/student/wallet` with fixed-point cutoff customization and real witness calculation.
  - Built multi-tab verification console in `/verify` supporting W3C presentations and zero-knowledge Groth16 proof pairing checks with sample proof loader.
  - Configured Next.js webpack fallback and `snarkjs` declaration typings.
- **Automated Verification**:
  - 4/4 Vitest tests passing in `@vericred/zk` verifying valid proof generation, tampered signal rejection, sub-threshold constraint failure, and forged signature rejection.
  - 58 total passing unit tests across the entire VERICRED monorepo.

---

## [0.4.0] - 2026-11-20

### Added
- **Smart Contract Layer (`blockchain/contracts`)**:
  - Implemented `InstitutionRegistry.sol` with OpenZeppelin `Ownable2Step`, institution self-registration, administrative accreditation approval, and BabyJubjub public signing key rotation.
  - Implemented `CredentialRegistry.sol` for on-chain anchoring of salted Poseidon commitments ($C = \text{Poseidon}(x, s)$) and credential digests, optimized into packed two-slot storage with single and atomic batch issuance (`issueCredentialBatch`).
  - Implemented `RevocationRegistry.sol` guaranteeing sovereign institutional authority: strictly requiring `msg.sender == originalIssuer` and blocking even platform administrators from revoking university credentials.
  - Authored standard Solidity interfaces (`IInstitutionRegistry`, `ICredentialRegistry`, `IRevocationRegistry`).
- **Hardhat Test Suite & Automation**:
  - Passed 17 unit tests in Hardhat with Chai and Ethers.js v6 covering registration, approvals, key rotation, batch anchoring, revocation reasons, and security boundaries.
  - Authored deployment automation script (`scripts/deploy.ts`) outputting `deployments.json`.
- **Blockchain Relay Client (`packages/contract-client`)**:
  - Exported canonical deployment addresses (`DEFAULT_CONTRACT_ADDRESSES`).
  - Implemented `VeriCredContractClient` with typed methods for authorization checks, credential commitment verification, and real-time revocation status lookups.

---

## [0.3.0] - 2026-11-20

### Added
- **W3C VC 2.0 Engine (`@vericred/credential-schema`)**:
  - Implemented W3C Verifiable Credentials Data Model 2.0 type definitions and JSON-LD contexts.
  - Authored deterministic canonicalizer (`canonicalJsonStringify`) and SHA-256 claim digest calculator.
  - Implemented BabyJubjub signing adapter (`createAcademicCredential`) generating Poseidon commitments $C = \text{Poseidon}(x, s)$ and fixed-point scaled CGPA ($8.72 \rightarrow 872$).
  - Implemented selective disclosure presentation generator (`createVerifiablePresentation`) supporting privacy-preserving redaction of raw grades while preserving cryptographic commitments.
- **Backend Credential Lifecycle Engine (`apps/api`)**:
  - Added single credential issuance endpoint (`POST /api/v1/credentials/issue`) gated by `requireApprovedInstitution`.
  - Added bulk CSV credential issuance parser (`POST /api/v1/credentials/issue-bulk`) with pre-flight dry-run error detection.
  - Added student presentation generation endpoint (`POST /api/v1/presentations`) with unique nonce and TTL expiration.
  - Added public presentation lookup endpoint (`GET /api/v1/presentations/:nonce`).
  - Added public cryptographic verification endpoints (`POST /api/v1/verify/presentation` and `POST /api/v1/verify/credential`) with tamper detection and revocation audit logging.
  - Added 6 integration test suites in Vitest covering issuance, bulk parsing, presentation creation, and multi-step verification (all 23 tests passing).
- **Institution Issuance UI (`apps/web`)**:
  - Authored `/institution/issue` page with live cryptographic preview, reactive form validation, and batch CSV uploader.
  - Verified static generation across 14 pages in Next.js production build (`next build`).

---

## [0.2.0] - 2026-11-20

### Added
- **Authentication & RBAC Engine (`apps/api`)**:
  - Implemented multi-tenant user authentication with Argon2id password hashing and HTTP-only JWTs.
  - Added refresh token rotation and session revocation (`/api/v1/auth/refresh`).
  - Added Role-Based Access Control guards (`authenticate`, `requireRole`, `requireApprovedInstitution`) for `ADMIN`, `INSTITUTION`, `STUDENT`, and `VERIFIER` roles.
  - Added consortium administrator module (`/api/v1/admin`) for pending institution reviews, approvals, suspensions, and tamper-evident audit logging.
  - Implemented 17 automated tests in Vitest covering user registration, Argon2id validation, token refresh, and RBAC boundary enforcement (all passing).
- **Next.js 14 Frontend UI Shells (`apps/web`)**:
  - Configured Tailwind CSS theme tokens matching `DESIGN_SYSTEM.md` (Deep Navy `#0B1226`, Slate `#141F39`, Electric Blue `#458BFF`, Cyan `#45D7E0`).
  - Authored responsive Root Layout, Navbar, and Footer with cryptographic protocol status indicators.
  - Authored Public Landing Page (`/`) with Hero, architectural pillar breakdown, and quick test persona pills.
  - Authored Auth Pages (`/login`, `/register`) with tabbed role selection and one-click demo persona auto-fill.
  - Authored Student Wallet Shell (`/student/overview`, `/student/wallet`) displaying degree credential cards and an interactive Groth16 selective disclosure proof generator.
  - Authored Accredited Institution Portal (`/institution/overview`, `/institution/students`) with KPI metrics and enrolled student directory.
  - Authored Consortium Governance Portal (`/admin/overview`, `/admin/institutions`) with on-chain university approval/suspension actions.
  - Authored Public Verifier Portal (`/verify`) with QR code scanning simulation and multi-step cryptographic verification report card.
  - Successfully verified Next.js production build (`next build`) generating 13 static pages.

---

## [0.1.0] - 2026-11-20

### Added
- **Monorepo Foundation**: Initialized Turborepo monorepo with pnpm workspaces across 9 projects (`apps/web`, `apps/api`, `packages/shared`, `packages/crypto`, `packages/credential-schema`, `packages/contract-client`, `blockchain`, `zk`).
- **Cryptographic Engine (`@vericred/crypto`)**:
  - Implemented Poseidon algebraic hashing wrapper for zero-knowledge arithmetic circuits.
  - Implemented EdDSA digital signatures over the BabyJubjub twisted Edwards curve.
  - Implemented deterministic fixed-point integer CGPA scaling ($8.72 \rightarrow 872$, domain $[0, 1000]$).
  - Implemented CSPRNG 254-bit blinding salt generator for the BN254 scalar field.
  - Passed 10 automated unit tests in Vitest covering all cryptographic primitives.
- **W3C VC 2.0 Schemas (`@vericred/credential-schema`)**: Formal JSON Schema draft 2020-12, JSON-LD context document, and Zod input validators.
- **Relational Persistence (`apps/api/prisma`)**:
  - Authored PostgreSQL Prisma schema with all 10 domain entities (`User`, `Institution`, `InstitutionApproval`, `InstitutionKey`, `Student`, `Credential`, `CredentialPresentation`, `VerificationRequest`, `RevocationRecord`, `AuditLog`).
  - Generated Prisma Client v6.
  - Authored master demonstration seed script (`prisma/seed.ts`) with RCC-IIT and 3 student profiles.
- **Deployment Infrastructure**: Added `docker-compose.yml` for PostgreSQL 16 and Redis 7 containerization.

### Planned for Phase 4 - Phase 5 (v0.2.0-beta)
- Smart contract deployment on Polygon Amoy testnet (`InstitutionRegistry`, `CredentialRegistry`, `RevocationRegistry`).
- Circom zero-knowledge circuit for fixed-point integer CGPA threshold proofs ($x \ge T$).
- In-circuit issuer signature verification preventing unauthenticated witness generation.
- Browser-based Groth16 proof generation and public verification pipeline.

### Planned for Phase 6 - Phase 7 (v1.0.0)
- End-to-end integration and automated Playwright test suite for all demonstration scenarios.
- Security hardening, Redis rate-limiting, and comprehensive threat mitigations.
- Cloud deployment and interactive demo release with RCC-IIT fictional seed data.

---

## [0.0.1] - 2026-11-20

### Added
- Created complete foundational architecture documentation suite comprising 70+ technical specification files across 11 modules.
- Created `project_overview.md` master requirements blueprint.
- Defined system architecture, component breakdown, and end-to-end data flow specifications.
- Specified formal relational database schema, Prisma models, and ER diagrams.
- Formulated mathematical model and Circom circuit specification for CGPA threshold proofs bound to EdDSA BabyJubjub issuer signatures.
- Designed smart contract architecture and security boundaries for Polygon Amoy deployment.
- Established development guidelines, agent operating instructions, project roadmap, and task tracker.
