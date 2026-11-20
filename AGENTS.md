# AGENTS.md — Autonomous AI Agent Operating Manual

> **Scope**: Permanent operational instructions, constraints, safety protocols, and quality standards for Antigravity and all autonomous AI coding agents operating within the VERICRED repository.

---

## 1. Prime Directives for AI Agents

Every autonomous agent working within the VERICRED codebase must strictly obey the following 14 Prime Directives. Violation of these directives represents a critical project failure.

1. **Read the Master Blueprint First**: Before initiating any substantial code change, architectural modification, or new feature branch, read `project_overview.md` to ground your context in the core vision.
2. **Read Subsystem Documentation**: Never modify a subsystem (e.g., blockchain, zero-knowledge circuits, cryptography, database) without first reading the corresponding technical specification located in `docs/`.
3. **Strict Adherence to Documented Architecture**: Adhere strictly to the monorepo design, data schemas, API contracts, and cryptographic protocols defined in `docs/02_SYSTEM_ARCHITECTURE/` and related directories. Do not invent alternate architectures or unapproved dependencies.
4. **Isolate Scope (Minimize Blast Radius)**: Confine all changes strictly to the task at hand. Avoid refactoring unrelated modules, renaming common types, reformatting arbitrary files, or deleting existing tests.
5. **No Fake Cryptography**: NEVER introduce mock, simulated, or pseudo-cryptographic implementations in production code paths. 
   - No hardcoded Boolean verification results (e.g., `return true // simulated check`).
   - No JavaScript comparisons substituting for Groth16 zero-knowledge proof verification.
   - If a cryptographic dependency is blocked or in prototype phase, it must be explicitly labeled `PROTOTYPE_STUB_ONLY` with an accompanying warning log and isolated from production verification endpoints.
6. **Zero Key & Secret Exposure**:
   - NEVER commit private keys, mnemonic phrases, API secrets, or database credentials to git.
   - NEVER expose institution private signing keys to frontend client bundles or unauthenticated API responses.
   - Restrict dev-mode keys strictly to `.env.example` placeholders or ephemeral test fixtures.
7. **No Plaintext Academic Data On-Chain**:
   - Under NO circumstance may a student's real name, email, roll/enrollment number, raw CGPA, grades, or transcripts be written to smart contracts or on-chain events.
   - On-chain storage is strictly limited to: opaque bytes32 credential hashes, salted Poseidon commitments ($C = \text{Poseidon}(x, s)$), issuer public keys, and cryptographic revocation status bitmasks/nullifiers.
8. **Enforce Server-Side Authorization**: Never rely on frontend route guards or client-side checks for security boundaries. Every API endpoint must independently validate the user's JWT, role (`ADMIN`, `INSTITUTION`, `STUDENT`, `VERIFIER`), institution approval state, and resource ownership.
9. **Mandatory Test Verification**: After modifying any backend route, frontend component, contract method, or Circom circuit, run the corresponding test suite and verify that all tests pass before declaring work complete.
10. **Maintain Synchronized Documentation**: Whenever code, API parameters, database schemas, or smart contract ABIs change, immediately update the relevant documentation in `docs/` and `diagrams/`.
11. **Maintain the Task Tracker**: Record progress diligently. After completing or advancing an engineering task, update `TASK_TRACKER.md` with accurate status markers (`[ ]`, `[~]`, `[x]`, `[!]`).
12. **Evidence-Based Completion**: Never claim a feature is "Complete" or "Production-Ready" without providing verifiable proof: successful test runs, terminal logs, compilation output, and runtime verification.
13. **Pre-Flight Conflict Resolution**: If a conflict is discovered between existing implementation code and the specification docs, do not silently overwrite either. Document the discrepancy, analyze the trade-offs, and update the documentation or code deliberately.
14. **Incremental, Reviewable Evolution**: Break complex tasks into small, self-contained, reviewable commits or pull requests following the project's conventional commit format.

---

## 2. Technical Stack and Conventions

### 2.1 Workspace Structure
The monorepo uses `pnpm` workspaces coordinated with Turborepo:
- `apps/web`: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, shadcn/ui.
- `apps/api`: Node.js, Express / NestJS, TypeScript, Prisma ORM, Zod.
- `packages/shared`: Universal TypeScript interfaces, enums, DTOs, and error codes.
- `packages/credential-schema`: W3C VC 2.0 schemas, context documents, and Zod validators.
- `packages/crypto`: EdDSA (BabyJubjub), Poseidon hash wrapper, and WebCrypto utilities.
- `blockchain`: Solidity 0.8.24, Hardhat, Ethers.js, OpenZeppelin.
- `zk`: Circom 2.1+, snarkjs, Groth16 verification keys and witness generators.

### 2.2 Naming Conventions
- **Directories**: kebab-case (e.g., `credential-management`, `zk-circuits`).
- **Files**:
  - React Components: PascalCase (e.g., `CredentialCard.tsx`, `QrScannerModal.tsx`).
  - Hooks / Utilities / Services: camelCase (e.g., `useCredential.ts`, `poseidonHasher.ts`, `credentialService.ts`).
  - Documentation: UPPER_SNAKE_CASE (e.g., `SYSTEM_ARCHITECTURE.md`).
- **Classes / Types / Interfaces**: PascalCase (e.g., `VerifiableCredential`, `InstitutionRegistryService`).
- **Variables / Functions**: camelCase (e.g., `verifyCredentialSignature()`, `scaledCgpa`).
- **Constants / Enums**: UPPER_SNAKE_CASE (e.g., `MAX_EXPIRATION_SECONDS`, `CredentialStatus.ACTIVE`).
- **Solidity Contracts**: PascalCase for contracts (`InstitutionRegistry.sol`), camelCase for functions (`issueCredential()`), `_` prefix for internal/private variables (`_isAuthorized`).
- **Circom Circuits**: PascalCase for templates (`template CgpaThresholdValidator()`).

### 2.3 Error Handling & HTTP Responses
All backend API responses must follow the standardized JSend-compliant envelope structure defined in [API_ERROR_HANDLING.md](docs/03_DATABASE_AND_BACKEND/API_ERROR_HANDLING.md):

```typescript
// Success Response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

// Error Response
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;       // e.g., "VC_INVALID_SIGNATURE"
    message: string;    // Human-readable explanation
    details?: unknown;  // Detailed validation errors (e.g., Zod field issues)
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

Never leak database stack traces, SQL syntax errors, or server internal details to verifiers or unauthenticated users.

### 2.4 Logging Standards
- Use structured JSON logging in production (Pino or Winston).
- Include `requestId`, `userId`, `institutionId`, and `timestamp` in log contexts.
- Log Levels:
  - `DEBUG`: Fine-grained cryptographic step tracing (in dev only).
  - `INFO`: Normal lifecycle events (user registered, credential issued, verification attempted).
  - `WARN`: Suspicious activity, rate-limit warnings, expired presentation attempts.
  - `ERROR`: System faults, database errors, blockchain RPC failure, contract reverts.
- **CRITICAL**: Never log plaintext passwords, private keys, authorization tokens, or raw student ZK witnesses.

---

## 3. Cryptography & ZK Guardrails

### 3.1 Dual-Signature Architecture
VERICRED supports two distinct cryptographic signature profiles:
1. **W3C VC Profile (Off-Chain Verification)**: Ed25519 or ECDSA (secp256k1) signatures for standard W3C VC 2.0 interoperability.
2. **ZK-SNARK Profile (In-Circuit Verification)**: EdDSA signatures over the **BabyJubjub** twisted Edwards curve using the **Poseidon** cryptographic hash function. Ordinary Ed25519 over Curve25519 is prohibitively expensive to compute inside Circom R1CS constraints; therefore, the ZK pipeline exclusively utilizes BabyJubjub/Poseidon.

### 3.2 CGPA Representation
- All academic grade points must be converted to fixed-point integers to avoid floating-point non-determinism in arithmetic circuits.
- **Scale Factor**: 100 ($10^2$).
  - A CGPA of $8.72$ becomes integer $872$.
  - A threshold of $8.00$ becomes integer $800$.
- Range Constraints: Circom circuits must enforce $0 \le x \le 1000$ to prevent integer overflow/underflow attacks in the finite scalar field $\mathbb{F}_p$.

---

## 4. Operational Runbook for AI Agents

When executing a task assigned by the user or an issue tracker:
1. **Locate Target Module**: Identify which monorepo package owns the functionality.
2. **Consult Associated Doc**: Read the subsystem markdown file in `docs/`.
3. **Formulate Step Plan**: Formulate the proposed changes mentally, ensuring all 14 Prime Directives are respected.
4. **Implement Incrementally**: Write clean, modular, fully typed TypeScript, Solidity, or Circom code.
5. **Execute Unit/Integration Tests**: Run `pnpm test` (or package-specific test script) and verify pass conditions.
6. **Update Tracking & Docs**: Mark progress in `TASK_TRACKER.md` and document any schema/endpoint changes.
7. **Report Clearly**: Provide the user with a concise summary of changes, test outputs, and next actionable steps.
