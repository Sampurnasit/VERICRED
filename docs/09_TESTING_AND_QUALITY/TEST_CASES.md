# TEST_CASES.md — Formal Test Case Specifications

> **Document ID**: DOC-QA-002  
> **Status**: Confirmed Technical Specification

---

## 1. Authentication & Governance (`TC-AUTH-*`)

### `TC-AUTH-001`: User Registration with Argon2id Hashing
- **Preconditions**: Database running; email `aarav.sen@student.rcciit.ac.in` not registered.
- **Steps**:
  1. Send `POST /api/v1/auth/register` with valid password (`SecurePass123!`) and role `STUDENT`.
  2. Inspect database record for `passwordHash`.
- **Expected Result**: User created with status 201; password hash begins with `$argon2id$`; raw password is never stored.
- **Priority**: Critical | **Status**: Defined

### `TC-AUTH-002`: Unapproved Institution Issuance Rejection
- **Preconditions**: Institution registered with status `PENDING`.
- **Steps**: Attempt to call `POST /api/v1/credentials/issue` using the unapproved institution's access token.
- **Expected Result**: Request fails with status `403 Forbidden` (`INSTITUTION_NOT_APPROVED`).
- **Priority**: High | **Status**: Defined

---

## 2. Credential Issuance & Integrity (`TC-ISSUE-*`)

### `TC-ISSUE-001`: Valid Single Credential Issuance
- **Preconditions**: Institution approved; student profile exists.
- **Steps**: Submit `POST /api/v1/credentials/issue` with student Aarav Sen (CGPA: 8.72).
- **Expected Result**:
  - Response contains `scaledCgpa: 872` and commitment $C = \text{Poseidon}(872, s)$.
  - EdDSA BabyJubjub signature verified.
  - Polygon Amoy transaction hash recorded in database.
- **Priority**: Critical | **Status**: Defined

### `TC-ISSUE-002`: Out-of-Range CGPA Rejection
- **Preconditions**: Authenticated approved institution.
- **Steps**: Submit issuance payload with `cgpa: 10.50` or `cgpa: -0.50`.
- **Expected Result**: Returns `400 Bad Request` with Zod validation error `INVALID_CGPA_RANGE`.
- **Priority**: High | **Status**: Defined

---

## 3. Public Verification & Tamper Detection (`TC-VERIFY-*`)

### `TC-VERIFY-001`: Successful QR Presentation Verification
- **Preconditions**: Valid credential issued; 15-minute presentation generated.
- **Steps**: Call `POST /api/v1/verification/verify` with active `presentationId`.
- **Expected Result**: Returns status `VALID` with all 5 check items marked `true`.
- **Priority**: Critical | **Status**: Defined

### `TC-VERIFY-002`: Tampered Academic Claim Detection
- **Preconditions**: Valid credential exported.
- **Steps**: Modify student degree name from `"Bachelor of Technology"` to `"Doctor of Philosophy"`. Submit for verification.
- **Expected Result**: Returns status `INVALID` (`VC_INVALID_SIGNATURE`).
- **Priority**: Critical | **Status**: Defined

### `TC-VERIFY-003`: Replay Protection (Consumed Nonce Rejection)
- **Preconditions**: Presentation successfully verified once in TC-VERIFY-001.
- **Steps**: Resubmit the exact same `presentationId` for verification.
- **Expected Result**: Returns `410 Gone` (`PRESENTATION_NONCE_ALREADY_CONSUMED`).
- **Priority**: High | **Status**: Defined

---

## 4. On-Chain Revocation (`TC-REVOKE-*`)

### `TC-REVOKE-001`: Dynamic On-Chain Revocation
- **Preconditions**: Credential active on Polygon Amoy.
- **Steps**:
  1. Issuing institution calls `POST /api/v1/credentials/:id/revoke` with reason `DISCIPLINARY`.
  2. Wait for blockchain block confirmation.
  3. Attempt public verification of the credential presentation.
- **Expected Result**: Verification returns status `REVOKED` with `revocationReason: DISCIPLINARY`.
- **Priority**: Critical | **Status**: Defined

### `TC-REVOKE-002`: Unauthorized Revocation Rejection
- **Preconditions**: Credential issued by Institution A.
- **Steps**: Institution B attempts to submit on-chain revocation to `RevocationRegistry.sol`.
- **Expected Result**: Smart contract call reverts with `OnlyOriginalIssuerCanRevoke`.
- **Priority**: Critical | **Status**: Defined

---

## 5. Zero-Knowledge Proofs (`TC-ZK-*`)

### `TC-ZK-001`: Valid CGPA Threshold Proof ($8.72 \ge 8.00$)
- **Preconditions**: Aarav Sen's credential (CGPA: 8.72) loaded into client prover.
- **Steps**:
  1. Generate Groth16 proof with threshold $T = 800$.
  2. Submit proof and public signals to `/api/v1/verification/zk-verify`.
- **Expected Result**:
  - Verification succeeds with status `ELIGIBILITY PROVEN`.
  - Verifier learns strictly that $x \ge 800$.
  - Exact CGPA (8.72) is never transmitted.
- **Priority**: Critical | **Status**: Defined

### `TC-ZK-002`: Proof Generation Failure for Low CGPA ($7.65 \not\ge 8.00$)
- **Preconditions**: Diya Roy's credential (CGPA: 7.65) loaded into client prover.
- **Steps**: Attempt to generate proof with threshold $T = 800$.
- **Expected Result**: Circom witness generator throws error (`GreaterEqThan constraint failed`); no valid proof can be synthesized.
- **Priority**: Critical | **Status**: Defined

### `TC-ZK-003`: Forged Signature Rejection in ZK Verification
- **Preconditions**: Valid witness $x = 872, T = 800$, but signature $(R8, S)$ modified or signed by an unauthorized key.
- **Steps**: Attempt witness computation.
- **Expected Result**: `EdDSAPoseidonVerifier` constraint fails; circuit rejects witness.
- **Priority**: Critical | **Status**: Defined
