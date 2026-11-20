# MASTER PROMPT: BUILD VERICRED
## Decentralized Academic Credential Issuance & Privacy-Preserving Verification Network

You are an elite team consisting of:
- A senior full-stack software architect
- A senior React/TypeScript frontend engineer
- A backend and database engineer
- A blockchain and Solidity engineer
- A cryptography and Zero-Knowledge Proof engineer
- A UI/UX designer
- A security engineer
- A QA and automation engineer

Your task is to design, develop, test, and deliver a complete, professional, working Web3 application called **VERICRED**.

Do not create merely a landing page, static prototype, or collection of disconnected dashboards. Build a functional, integrated, end-to-end system with real authentication, database persistence, credential issuance, cryptographic verification, blockchain integration, revocation, and a working privacy-preserving proof demonstration.

You must work systematically, inspect your implementation, run the application, identify errors, and fix them.

---

# 1. PROJECT IDENTITY

**Project Name:** VERICRED

**Tagline:** Your Achievements. Your Credentials. Your Control.

**Project Category:** Web3 / Blockchain / Digital Identity / Privacy-Preserving Verification

### Project Vision

VERICRED is a decentralized academic credential issuance and verification network that allows educational institutions to issue cryptographically signed academic credentials, students to own and control their credentials, and recruiters or universities to independently verify their authenticity.

The platform should eliminate unnecessary manual verification, make credential tampering detectable, support credential revocation, and enable students to prove specific academic requirements without revealing their complete academic records.

### Core Differentiator

**Prove your academic eligibility without revealing your academic history.**

Example:

A recruiter requires a candidate to have a CGPA of at least 8.0.

Instead of revealing the student's exact CGPA, marksheet, or complete academic history, the student generates a Zero-Knowledge Proof demonstrating:

CGPA ≥ 8.0

The verifier checks the proof without learning the student's actual CGPA.

This is the signature feature of VERICRED and must be treated as a major engineering priority.

---

# 2. CORE STAKEHOLDERS

Build the platform around three primary stakeholders.

### A. Educational Institutions — Credential Issuers

Institutions should be able to:
- Register and authenticate.
- Manage their institutional profile.
- Manage student records.
- Create academic credentials.
- Issue individual credentials.
- Bulk issue credentials.
- Digitally sign credentials.
- Publish credential references and status information to the blockchain.
- Revoke previously issued credentials.
- Monitor issued credentials.
- View issuance and verification statistics.
- Manage authorized issuer keys.

### B. Students — Credential Holders

Students should be able to:
- Register and authenticate.
- Access their personal dashboard.
- Receive credentials issued by institutions.
- View credential details.
- Store credentials securely.
- Download or export credentials.
- Share credentials through QR codes or secure verification links.
- Generate Zero-Knowledge Proofs.
- Selectively disclose academic claims.
- View credential verification history.
- Check the revocation status of their credentials.

The student must retain control of their credential data and private keys.

### C. Recruiters / Universities — Credential Verifiers

Verifiers should be able to:
- Open the public verification portal.
- Scan a student's QR code.
- Enter a secure verification link.
- Verify credential authenticity.
- Verify issuer authorization.
- Check credential integrity.
- Check credential expiration.
- Check current revocation status.
- Verify Zero-Knowledge Proofs.
- Request specific academic eligibility claims.
- Generate a verification report.

Basic verification should work without requiring a verifier account.

---

# 3. PRODUCT MODULES

Develop the following major modules.

## Module 1: Public Website

Create a polished public-facing website.

Pages:
1. Home
2. How It Works
3. Features
4. Technology
5. About VERICRED
6. Contact
7. Login
8. Register

### Landing Page Requirements

Create a premium, modern Web3/FinTech landing page.

Hero section:

Headline:
"Your Achievements. Your Credentials. Your Control."

Subheadline:
"Academic credentials that are independently verifiable, tamper-evident, and privacy-preserving."

Primary CTA:
"Get Started"

Secondary CTA:
"Verify a Credential"

Include:
- Animated credential verification illustration.
- Trust and privacy highlights.
- Institution → Student → Verifier workflow.
- Zero-Knowledge Proof demonstration section.
- Feature cards.
- Technology overview.
- FAQ.
- Footer.

Do not use generic cryptocurrency marketing aesthetics.

The website should communicate institutional trust, academic credibility, privacy, and security.

## Module 2: Authentication and Authorization

Implement:
- Email and password registration.
- Login and logout.
- Secure password hashing.
- Session or JWT-based authentication.
- Forgot password workflow.
- Role-based access control.
- Protected routes.
- User profile management.

Roles:
- ADMIN
- INSTITUTION
- STUDENT
- VERIFIER (optional registered verifier role)

An institution account must not automatically become a trusted credential issuer.

Issuer registration must have an approval process.

Create a platform administrator interface to approve, suspend, and manage institutions.

## Module 3: Institution Dashboard

Design a professional institutional dashboard.

Sidebar:
- Overview
- Institution Profile
- Students
- Credentials
- Issue Credential
- Bulk Issuance
- Revocations
- Issuer Keys
- Verification Analytics
- Settings

### Dashboard Overview

Display:
- Total registered students.
- Total credentials issued.
- Active credentials.
- Revoked credentials.
- Total verification requests.
- Recent issuance activity.
- Recent verification activity.

### Student Management

Allow institutions to:
- Add students.
- Edit student information.
- Search and filter students.
- Import students through CSV.
- View student credential history.

### Credential Issuance

Create a credential issuance form with:

- Student name
- Student ID / enrollment number
- Institution name
- Degree
- Department / branch
- Academic session
- Graduation year
- CGPA
- Credential issue date
- Optional expiration date

Credential types:
- Degree Certificate
- Academic Transcript
- Marksheet
- Diploma
- Academic Achievement Certificate
- Other Academic Credential

On submission:

1. Validate the data.
2. Construct the credential using the defined credential schema.
3. Generate a cryptographic commitment.
4. Sign the credential using the institution's authorized signing key.
5. Store the credential securely.
6. Anchor the required reference and status information on the blockchain.
7. Deliver the credential to the student's wallet.
8. Display a successful issuance confirmation.

Never store an institution's private signing key as ordinary plaintext in the application database.

### Bulk Issuance

Allow CSV upload.

Process records with:
- Validation.
- Duplicate detection.
- Error reporting.
- Batch processing.
- Individual credential generation.
- Issuance status tracking.

## Module 4: Student Credential Wallet

Create a student-controlled credential wallet.

Sidebar:
- Overview
- My Credentials
- Credential Details
- Share Credential
- ZK Proof Generator
- Verification History
- Security Settings

### Wallet Overview

Display:
- Total credentials.
- Active credentials.
- Revoked credentials.
- Recent sharing activity.

### Credential Cards

Each credential should display:
- Degree or credential type.
- Issuing institution.
- Graduation year.
- Issue date.
- Verification status.

### Credential Detail Page

Display the complete credential information to its authorized holder.

Include:
- Credential details.
- Issuer identity.
- Issuer signature status.
- Blockchain reference.
- Issue date.
- Current revocation status.
- QR sharing option.
- Download/export option.

### Credential Sharing

Implement secure credential presentations.

Important:
- QR codes must not contain complete academic records.
- Use an opaque presentation reference or secure presentation token.
- Use short expiration periods.
- Use a verifier challenge/nonce.
- Prevent replay attacks.
- Avoid exposing permanent student identifiers in public verification URLs.

Students should be able to choose which claims to disclose.

## Module 5: Public Credential Verification Portal

This is a critical module.

Create a clean, accessible verification interface.

Verification methods:
1. Scan QR code.
2. Enter verification link.
3. Enter credential reference.
4. Verify a Zero-Knowledge Proof.

### Verification Process

When a verifier submits a credential presentation:

1. Retrieve the relevant credential or presentation.
2. Validate its structure.
3. Verify the issuer's cryptographic signature.
4. Confirm the issuer is authorized.
5. Validate credential integrity.
6. Check expiration.
7. Retrieve the latest revocation status.
8. Verify any supplied Zero-Knowledge Proof.
9. Display the result.

### Verification Results

Use clear visual status indicators.

VALID:
- Authentic credential.
- Trusted issuer.
- Integrity verified.
- Not revoked.
- Not expired.

INVALID:
- Invalid signature.
- Modified credential.
- Unknown or unauthorized issuer.
- Invalid proof.

REVOKED:
- Credential was revoked by its authorized issuer.

EXPIRED:
- Credential is no longer valid according to its validity period.

PENDING / UNVERIFIABLE:
- Blockchain or verification service unavailable.
- Required issuer information unavailable.

Never display VALID if a critical verification check could not be completed.

Display a detailed verification report with individual check results.

## Module 6: Zero-Knowledge Proof System

This is VERICRED's most important differentiating feature.

Implement an actual Zero-Knowledge Proof workflow, not a simulated frontend animation.

### Primary Use Case

A student owns an institution-issued academic credential containing a CGPA.

A recruiter specifies:

"Prove that your CGPA is at least 8.0."

The student generates a proof without revealing the exact CGPA.

The verifier learns only that the required condition is satisfied.

### Proposed Technical Stack

- Circom
- snarkjs
- Groth16
- Poseidon hashing
- A circuit-compatible issuer signature scheme
- Solidity-compatible verification where appropriate

### Mathematical Objective

The proof should establish:

There exist private values x and s such that:

C = Poseidon(x, s)

and

x ≥ T

Where:
- x = actual CGPA in a defined integer-scaled representation.
- s = private random salt.
- C = authenticated academic commitment.
- T = public eligibility threshold.

The circuit must also establish that the commitment and academic value are bound to a credential authorized by a trusted issuer.

### Critical Cryptographic Requirement

Do not implement a circuit that merely proves:

"Some number is greater than 8."

The proof must be bound to an authentic institution-issued credential.

The circuit must verify:
- Credential commitment consistency.
- Issuer authorization through a trusted issuer public key.
- Issuer signature authenticity using a circuit-compatible signature construction.
- CGPA threshold satisfaction.

The issuer public key must be authenticated through the trusted issuer registry.

Use a documented, circuit-compatible signing construction, such as an appropriate EdDSA-Poseidon implementation, and carefully document the selected signature suite.

Do not assume ordinary Ed25519 signature verification is inexpensive or straightforward inside a Circom circuit.

If the chosen signature scheme is not a standardized W3C credential proof suite, clearly document the custom cryptographic adapter and do not falsely claim full proof-suite interoperability.

### Public Inputs

The proof should expose only the minimum necessary public inputs, such as:
- Credential commitment.
- Eligibility threshold.
- Issuer identifier or authenticated key reference.
- Credential status/nullifier reference, if required by the design.

### Private Inputs

Keep private:
- Exact CGPA.
- Random salt.
- Other academic information.
- Any additional private witness values.

### Proof Generation Flow

1. Student selects a credential.
2. Student chooses an eligibility condition.
3. Student enters or selects the threshold.
4. Application retrieves the necessary private credential information.
5. The client or a secure proof-generation process constructs the witness.
6. Circom generates the proof.
7. snarkjs produces the Groth16 proof.
8. The student shares the proof through a presentation.
9. Verifier validates the proof and all associated credential status checks.

Never send the exact CGPA to the verifier during a threshold-only proof.

### Additional Future ZK Claims

Design the architecture so that it can later support:
- Graduation year eligibility.
- Degree ownership.
- Branch or department eligibility.
- CGPA ranges.
- Minimum credit requirements.
- Multiple academic conditions.

For the MVP, prioritize one fully working CGPA threshold proof.

If cryptographic binding is incomplete, label the implementation as a prototype and do not present it as a secure proof of credential ownership.

## Module 7: Blockchain Layer

Use Solidity and Hardhat.

Target network:
- Polygon Amoy Testnet as the primary deployment target.
- Ethereum Sepolia as an optional alternative.

Do not deploy to mainnet during development.

### Smart Contracts

Create three contracts.

#### A. InstitutionRegistry.sol

Responsibilities:
- Register institutions.
- Approve institutions.
- Suspend institutions.
- Maintain issuer identity.
- Register authorized issuer public keys.
- Support key rotation.
- Track issuer status.

Functions:
- registerInstitution()
- approveInstitution()
- suspendInstitution()
- updateIssuerKey()
- isAuthorized()

#### B. CredentialRegistry.sol

Responsibilities:
- Register credential references.
- Associate credentials with authorized issuers.
- Store credential commitments.
- Maintain issuance metadata.

Functions:
- issueCredential()
- getCredentialIssuer()
- getCredentialStatus()
- credentialExists()

#### C. RevocationRegistry.sol

Responsibilities:
- Maintain credential revocation status.
- Allow only the authorized issuer to revoke credentials.
- Provide current status for verification.

Functions:
- revokeCredential()
- isRevoked()

### Blockchain Data Policy

Never place the following on-chain:
- Student names.
- Email addresses.
- Enrollment numbers.
- Exact CGPA.
- Marksheets.
- Plaintext academic records.
- Private keys.

Store only the minimum information necessary for trust and status management.

Use random opaque credential references and appropriately constructed salted commitments.

Avoid unsalted hashes of predictable academic information because they can be guessed through dictionary attacks.

### Smart Contract Security

Implement:
- Access control.
- Issuer authorization.
- Reentrancy protections where applicable.
- Input validation.
- Event emission.
- Key rotation.
- Revocation authorization.
- Unit tests.

Include deployment scripts and a contract interaction layer in the backend.

## Module 8: Administrator Dashboard

Create an administrator dashboard.

Features:
- Total registered institutions.
- Pending institution approvals.
- Approved institutions.
- Suspended institutions.
- Total users.
- Total credentials.
- Recent platform activity.
- Issuer management.
- Institution approval.
- Institution suspension.
- Audit logs.

The administrator should not be able to modify a student's issued academic result or forge an institution's signature.

---

# 4. TECHNICAL ARCHITECTURE

Use a maintainable monorepo architecture.

Recommended structure:

vericred/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── institutions/
│       │   ├── students/
│       │   ├── credentials/
│       │   ├── verification/
│       │   ├── presentations/
│       │   ├── revocation/
│       │   ├── blockchain/
│       │   ├── zk/
│       │   └── audit/
│       └── tests/
│
├── packages/
│   ├── shared/
│   ├── credential-schema/
│   ├── crypto/
│   └── contract-client/
│
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   ├── test/
│   └── hardhat.config.ts
│
├── zk/
│   ├── circuits/
│   ├── scripts/
│   ├── build/
│   └── README.md
│
├── prisma/
│   └── schema.prisma
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── API.md
│   ├── BLOCKCHAIN.md
│   └── ZK_DESIGN.md
│
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md

You may adjust this architecture when there is a clear engineering reason, but preserve separation between frontend, backend, blockchain, cryptographic logic, and ZK circuits.

### Frontend

Use:
- React
- TypeScript
- Next.js
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form
- Zod
- TanStack Query
- A suitable chart library

### Backend

Use:
- Node.js
- TypeScript
- Express or NestJS
- PostgreSQL
- Prisma ORM
- Zod validation
- Secure authentication middleware

### Blockchain

Use:
- Solidity
- Hardhat
- Ethers.js
- OpenZeppelin libraries
- Polygon Amoy

### Credentials and Cryptography

Use:
- W3C Verifiable Credentials Data Model 2.0 as the credential data model.
- DIDs where appropriate.
- A documented digital signature suite.
- Secure hashing and salted commitments.
- Web Crypto API for browser-side cryptographic operations where suitable.

### Zero-Knowledge Proofs

Use:
- Circom
- snarkjs
- Groth16
- Poseidon
- A properly documented circuit-compatible signature scheme.

Do not substitute a fake proof, hardcoded result, or ordinary JavaScript comparison for a real ZK proof.

---

# 5. DATABASE DESIGN

Use PostgreSQL and Prisma.

Create appropriate models for:

- User
- Institution
- InstitutionApproval
- InstitutionKey
- Student
- Credential
- CredentialPresentation
- VerificationRequest
- RevocationRecord
- AuditLog

### Important Database Rules

1. Every user must have a defined role.
2. Institutions must have an approval status.
3. Students may be associated with institutions.
4. Credentials must have unique identifiers.
5. Credentials must reference their issuing institution.
6. Credential signatures must be verifiable.
7. Revocation history must be auditable.
8. Verification requests must not unnecessarily store sensitive academic information.
9. Private signing keys must not be stored as ordinary database fields.
10. Never store private ZK witness values in verification logs.

Use proper indexes, relationships, unique constraints, and migrations.

---

# 6. USER INTERFACE AND DESIGN SYSTEM

The UI must look like a premium enterprise-grade Web3 SaaS platform.

### Visual Direction

Theme:
- Modern.
- Minimal.
- Professional.
- Trustworthy.
- Clean.
- Technology-focused.
- Institutional rather than speculative crypto.

### Color Palette

Primary background: #0B1226

Secondary background: #141F39

Card background: #1A2A48

Primary accent: #458BFF

Secondary accent: #45D7E0

Success: #4AD2A0

Warning: #FFC75C

Error: #FF707D

Main text: #F5F8FF

Muted text: #A9B7CF

Use a consistent color system with accessible contrast.

### Typography

Use:
- Inter
- Space Grotesk

### UI Requirements

- Consistent sidebar navigation.
- Responsive dashboards.
- Reusable components.
- Proper empty states.
- Loading states.
- Error states.
- Toast notifications.
- Confirmation dialogs.
- Search and filtering.
- Pagination.
- Accessible forms.
- Skeleton loading.
- Responsive mobile layouts.
- Smooth but restrained animations.

Avoid:
- Excessive gradients.
- Excessive glassmorphism.
- Unnecessary glowing effects.
- Huge rounded cards everywhere.
- Overloaded dashboards.
- Generic AI-generated layouts.
- Fake blockchain transaction animations.

Use real data and actual application states wherever possible.

---

# 7. SECURITY AND PRIVACY REQUIREMENTS

Security is a fundamental product requirement.

Implement:

### Authentication
- Password hashing using Argon2id or bcrypt with secure parameters.
- Secure session handling.
- Authorization checks on the backend.
- Rate limiting.
- CSRF protection where applicable.
- Input validation.
- Protection against common OWASP vulnerabilities.

### Credential Security
- Cryptographic signatures.
- Signature verification.
- Secure credential storage.
- Integrity checks.
- Issuer authorization.
- Revocation checking.
- Expiration validation.

### Key Security
- Private keys must never be committed to source control.
- Never expose private keys through frontend environment variables.
- Use environment variables only for development secrets.
- Separate issuer signing keys from user authentication secrets.
- Design a secure key management interface.
- Support key rotation.
- Document production-grade HSM/KMS integration as a future requirement.

### Privacy
- Never store plaintext personal academic data on-chain.
- Do not expose exact CGPA when the user requests threshold-only proof.
- Do not expose unnecessary student identifiers.
- Use short-lived presentations.
- Bind presentations to verifier challenges.
- Prevent replay.
- Minimize persistent verification logs.
- Encrypt sensitive credential data at rest and in transit.
- Make student-side private key control explicit.

### Important Trust Principle

Blockchain does not independently establish whether an academic result is factually correct.

VERICRED must establish:
- Who issued the credential.
- Whether the issuer was authorized.
- Whether the credential has been modified.
- Whether the credential is currently revoked or expired.

The institution remains responsible for the correctness of the academic information it issues.

---

# 8. COMPLETE USER WORKFLOWS

Implement and test the following workflows.

### Workflow A: Institution Registration

1. Institution visits the website.
2. Creates an institution account.
3. Submits institution details.
4. Administrator reviews the application.
5. Administrator approves the institution.
6. Institution receives access to its dashboard.
7. Institution configures its issuer key.

### Workflow B: Credential Issuance

1. Institution logs in.
2. Selects a student.
3. Opens Issue Credential.
4. Enters academic details.
5. Application validates the details.
6. Credential is constructed.
7. Credential is cryptographically signed.
8. Credential commitment is generated.
9. Blockchain records the appropriate reference and status.
10. Student receives the credential.

### Workflow C: Student Sharing

1. Student logs in.
2. Opens My Credentials.
3. Selects a credential.
4. Chooses Share Credential.
5. Selects the claims to disclose.
6. Generates a secure presentation.
7. Receives a QR code or sharing link.
8. Shares it with the verifier.

### Workflow D: Public Verification

1. Recruiter opens the verification portal.
2. Scans the QR code.
3. Application retrieves the presentation.
4. Verifies signature and issuer authorization.
5. Checks credential integrity.
6. Checks expiration and revocation.
7. Displays a verification report.

### Workflow E: Zero-Knowledge Verification

1. Recruiter requests CGPA ≥ 8.0.
2. Student selects their academic credential.
3. Student generates a ZK proof.
4. Exact CGPA remains private.
5. Student shares the proof.
6. Verifier validates the proof.
7. Verifier confirms the threshold condition.
8. The result displays only whether the requirement is satisfied.

### Workflow F: Revocation

1. Institution opens its credential management dashboard.
2. Selects an issued credential.
3. Requests revocation.
4. System verifies the institution's authorization.
5. Revocation transaction is submitted.
6. Blockchain records the revocation.
7. Subsequent verification attempts return REVOKED.

---

# 9. DEMONSTRATION DATA

Create realistic seed data for a demonstration environment.

Use a fictional institution:

Institution: RCC Institute of Information Technology (Demo Institution)

Create three fictional students:

Student A:
- Name: Aarav Sen
- Student ID: VC2026001
- Degree: B.Tech
- Department: Computer Science and Engineering
- Graduation Year: 2026
- CGPA: 8.72

Student B:
- Name: Diya Roy
- Student ID: VC2026002
- Degree: B.Tech
- Department: Information Technology
- Graduation Year: 2026
- CGPA: 7.65

Student C:
- Name: Rohan Das
- Student ID: VC2026003
- Degree: B.Tech
- Department: Computer Science and Engineering
- Graduation Year: 2026
- CGPA: 9.12

Use fictional data only.

Create demo accounts for:
- Platform administrator.
- Institution administrator.
- Three students.

Provide demo credentials in the development README only.

Never use real student information or production credentials.

---

# 10. END-TO-END DEMONSTRATION SCENARIO

The final application must support this demonstration.

### Demonstration 1: Credential Issuance

Institution issues a B.Tech credential to Aarav Sen with CGPA 8.72.

Show:
- Successful credential creation.
- Digital signature.
- Credential commitment.
- Blockchain transaction/reference.
- Student wallet delivery.

### Demonstration 2: Standard Verification

Student generates a QR code.

Recruiter scans the QR code.

Result:

VALID CREDENTIAL

Show:
- Issuer authorized.
- Signature verified.
- Integrity verified.
- Status active.
- Credential not expired.

### Demonstration 3: Zero-Knowledge Proof

Recruiter requests:

"CGPA must be at least 8.0."

Student generates the proof.

Result:

ELIGIBILITY PROVEN

Do not reveal the student's exact CGPA.

Show the proof verification status and public threshold.

### Demonstration 4: Tampering Detection

Modify the academic CGPA in a test copy of the credential.

Attempt verification.

Expected result:

INVALID CREDENTIAL

Show that the signature or commitment verification failed.

### Demonstration 5: Revocation

Institution revokes the credential.

Attempt verification again.

Expected result:

REVOKED CREDENTIAL

This must demonstrate that revocation status is checked dynamically rather than relying on an old cached result.

---

# 11. DEVELOPMENT STRATEGY

Do not try to implement everything in one unstructured operation.

Follow these phases.

## Phase 1: Project Foundation

- Inspect the workspace.
- Initialize the monorepo.
- Configure package management.
- Set up frontend.
- Set up backend.
- Configure PostgreSQL.
- Set up Prisma.
- Configure environment variables.
- Create shared types and validation schemas.
- Prepare documentation.

Deliverable: Running application foundation.

## Phase 2: UI and Authentication

- Build public website.
- Build login and registration.
- Implement authentication.
- Implement role-based routing.
- Build institution dashboard.
- Build student dashboard.
- Build administrator dashboard.
- Build verifier interface.

Deliverable: Functional application UI connected to backend authentication and database.

## Phase 3: Credential Management

- Create credential schema.
- Implement institution/student management.
- Implement credential issuance.
- Implement signing.
- Implement student wallet.
- Implement secure sharing.
- Implement credential verification.

Deliverable: Complete working credential lifecycle without blockchain dependency.

## Phase 4: Blockchain Integration

- Build Solidity contracts.
- Write comprehensive contract tests.
- Deploy contracts to local Hardhat network.
- Integrate backend with contracts.
- Configure Polygon Amoy.
- Implement issuer registration.
- Implement credential anchoring.
- Implement revocation.
- Display transaction references.

Deliverable: Working blockchain-backed credential lifecycle.

## Phase 5: Zero-Knowledge Proof

This phase must be started early as a technical risk assessment, even while the UI is being developed.

First:
- Prototype the CGPA threshold circuit.
- Select and document the signature scheme.
- Validate credential commitment binding.
- Validate issuer authorization inside the circuit.
- Test witness generation.
- Generate and verify Groth16 proofs.

Then:
- Integrate proof generation.
- Build student ZK interface.
- Build verifier proof validation.
- Bind proof verification to current credential status.

Deliverable: One real end-to-end CGPA threshold proof.

## Phase 6: Testing and Security

Test:
- Authentication.
- Authorization.
- Institution approval.
- Credential issuance.
- Signature verification.
- Tampering detection.
- Revocation.
- Expiration.
- QR presentations.
- Replay prevention.
- ZK proof generation.
- ZK proof verification.
- Invalid proof rejection.
- Blockchain failures.
- API errors.

Deliverable: Stable, tested application.

## Phase 7: Final Polish

- Improve UI consistency.
- Add loading and empty states.
- Add error handling.
- Add responsive layouts.
- Add audit logs.
- Add demo seed scripts.
- Add setup documentation.
- Add deployment documentation.
- Run a complete end-to-end demonstration.

Deliverable: Hackathon-ready VERICRED application.

---

# 12. TESTING REQUIREMENTS

Create automated tests.

### Frontend
- Form validation.
- Authentication flows.
- Role-based navigation.
- Credential display.
- QR generation.
- Verification status rendering.

### Backend
- Authentication endpoints.
- Institution authorization.
- Credential issuance.
- Signature verification.
- Presentation expiration.
- Revocation authorization.
- Verification endpoints.

### Smart Contracts
- Institution registration.
- Institution approval.
- Unauthorized issuer rejection.
- Key rotation.
- Credential issuance.
- Revocation.
- Access control.

### ZK
- Valid threshold proof accepted.
- Invalid threshold proof rejected.
- Tampered witness rejected.
- Incorrect commitment rejected.
- Unauthorized issuer rejected.
- Invalid signature rejected.
- Modified public inputs rejected.

Never use frontend-only checks as a substitute for backend or cryptographic validation.

---

# 13. ENVIRONMENT AND DEVELOPER EXPERIENCE

Create:

- .env.example
- README.md
- Database migration commands.
- Seed commands.
- Smart contract deployment scripts.
- Contract testing scripts.
- ZK compilation scripts.
- ZK setup instructions.
- Frontend development commands.
- Backend development commands.
- Docker Compose configuration where appropriate.

The project should run locally with a documented setup process.

Support a local blockchain network for development so the application does not depend on a public testnet during every development session.

Do not hardcode API keys, RPC URLs, private keys, or passwords.

---

# 14. ENGINEERING RULES — FOLLOW STRICTLY

1. Do not build a static-only prototype.
2. Do not use fake blockchain transaction hashes.
3. Do not simulate signature verification with a Boolean value.
4. Do not simulate ZK proofs with JavaScript comparisons.
5. Do not expose private keys.
6. Do not store personal academic information on-chain.
7. Do not trust frontend role checks alone.
8. Do not allow unauthorized institutions to issue credentials.
9. Do not allow arbitrary users to revoke credentials.
10. Do not claim a credential is valid when verification checks are unavailable.
11. Do not claim full W3C interoperability without implementing and testing the required standards.
12. Do not make unverified claims about blockchain security.
13. Do not leave critical buttons non-functional.
14. Do not leave major pages as placeholders.
15. Do not create unnecessary complexity before the core workflows work.
16. Use modular, typed, reusable code.
17. Add comments for important cryptographic and blockchain operations.
18. Run tests after each major development phase.
19. Fix TypeScript, linting, compilation, and runtime errors before proceeding.
20. Keep documentation synchronized with actual implementation.

When a feature cannot be completed securely within the MVP, explicitly mark it as incomplete rather than presenting a mock implementation as production functionality.

---

# 15. FINAL ACCEPTANCE CRITERIA

VERICRED will be considered successfully implemented when:

- The public website works.
- Users can register and log in.
- Roles and permissions work correctly.
- Institutions can be approved.
- Institutions can issue signed academic credentials.
- Students can receive and view credentials.
- Students can share credentials through secure QR presentations.
- Recruiters can verify credentials without an account.
- Signature and integrity checks work.
- Revocation works through the blockchain.
- Current revocation status is checked during verification.
- One actual CGPA threshold ZK proof works.
- The ZK proof is bound to an authentic issuer-authorized credential.
- The verifier does not learn the exact CGPA in the threshold-only flow.
- Tampered credentials fail verification.
- Revoked credentials fail verification.
- Automated tests pass.
- The application has proper setup and deployment documentation.

---

# 16. HOW YOU SHOULD START

Before writing code:

1. Inspect the current workspace.
2. Check the installed tools and available development environment.
3. Prepare a concise architecture plan.
4. Identify the riskiest technical components.
5. Create a phased implementation checklist.
6. Create the initial folder structure.
7. Explain the development sequence briefly.

Then begin implementation.

Do not stop after generating the architecture document.

Continue building the actual application phase by phase.

After each phase:
- Run the relevant application or tests.
- Inspect the output.
- Fix discovered errors.
- Update the checklist.
- Record completed and remaining functionality.

If a decision is necessary, choose the most secure, maintainable, and technically realistic option. Ask me only when an essential decision cannot reasonably be inferred.

**Your ultimate objective is to deliver a fully integrated, demonstrable, technically credible VERICRED platform — not merely a visually attractive frontend.**

Start by inspecting the workspace and creating the implementation plan. Then proceed with Phase 1.