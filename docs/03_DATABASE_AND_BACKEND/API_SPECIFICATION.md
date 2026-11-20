# API_SPECIFICATION.md — RESTful Interface & Endpoint Reference

> **Document ID**: DOC-API-001  
> **Status**: Confirmed Technical Specification  
> **Base URL**: `/api/v1`  
> **Content-Type**: `application/json`

---

## 1. Authentication Endpoints

### 1.1 `POST /auth/register`
- **Purpose**: Register a new user account (Student or Verifier).
- **Auth**: None (Public).
- **Request Body**:
  ```json
  {
    "email": "aarav.sen@student.rcciit.ac.in",
    "password": "SecurePassword123!",
    "firstName": "Aarav",
    "lastName": "Sen",
    "role": "STUDENT"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
        "email": "aarav.sen@student.rcciit.ac.in",
        "role": "STUDENT",
        "firstName": "Aarav",
        "lastName": "Sen"
      }
    }
  }
  ```
- **Error Codes**: `400 BAD_REQUEST`, `409 USER_ALREADY_EXISTS`.

---

### 1.2 `POST /auth/login`
- **Purpose**: Authenticate user and issue HTTP-only JWT cookies.
- **Auth**: None (Public).
- **Request Body**:
  ```json
  {
    "email": "aarav.sen@student.rcciit.ac.in",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`):
  *(Sets `access_token` and `refresh_token` HTTP-only cookies)*
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "c1f2e3d4-5678-90ab-cdef-1234567890ab",
        "email": "aarav.sen@student.rcciit.ac.in",
        "role": "STUDENT",
        "firstName": "Aarav",
        "lastName": "Sen"
      }
    }
  }
  ```
- **Error Codes**: `401 INVALID_CREDENTIALS`, `429 TOO_MANY_REQUESTS`.

---

### 1.3 `POST /auth/logout`
- **Purpose**: Invalidate current session and clear authentication cookies.
- **Auth**: Authenticated (`JWT`).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": { "message": "Successfully logged out" }
  }
  ```

---

## 2. Institution Endpoints

### 2.1 `POST /institutions/register`
- **Purpose**: Register an educational institution for platform review.
- **Auth**: Authenticated (`INSTITUTION`).
- **Request Body**:
  ```json
  {
    "legalName": "RCC Institute of Information Technology",
    "shortCode": "RCC-IIT",
    "website": "https://www.rcciit.org",
    "blockchainAddress": "0x71C83648E75C4782F485B8F9A1058D14881E995F",
    "accreditationDocUrl": "https://storage.vericred.net/docs/rcc-naac.pdf"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "institution": {
        "id": "inst-1111-2222-3333-444455556666",
        "status": "PENDING",
        "legalName": "RCC Institute of Information Technology"
      }
    }
  }
  ```

---

## 3. Credential Lifecycle Endpoints

### 3.1 `POST /credentials/issue`
- **Purpose**: Issue an individual signed academic credential.
- **Auth**: Authenticated (`INSTITUTION`, Approved status only).
- **Request Body**:
  ```json
  {
    "studentId": "stud-1234-5678-90ab-cdef12345678",
    "credentialType": "DegreeCertificate",
    "degreeName": "Bachelor of Technology",
    "department": "Computer Science and Engineering",
    "graduationYear": 2026,
    "cgpa": 8.72
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "credentialId": "urn:uuid:cred-8888-9999-aaaa-bbbbccccdddd",
      "commitment": "12837192837192837192837192837192837192837192837192837192837192",
      "scaledCgpa": 872,
      "status": "ACTIVE",
      "onChainTxHash": "0x3a4f...e12d",
      "issuedAt": "2026-11-20T00:00:00.000Z"
    }
  }
  ```
- **Error Codes**: `400 INVALID_CGPA_RANGE`, `403 INSTITUTION_NOT_APPROVED`.

---

### 3.2 `POST /credentials/bulk-issue`
- **Purpose**: Ingest and process a batch of student credentials via CSV multipart upload.
- **Auth**: Authenticated (`INSTITUTION`, Approved status only).
- **Request**: `multipart/form-data` with field `file: students.csv`.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "totalProcessed": 120,
      "succeeded": 120,
      "failed": 0,
      "batchTxHash": "0x9f8e...1234"
    }
  }
  ```

---

### 3.3 `POST /credentials/:id/revoke`
- **Purpose**: Formally revoke an issued credential on-chain.
- **Auth**: Authenticated (`INSTITUTION`, Original issuer only).
- **Request Body**:
  ```json
  {
    "reasonCode": "DISCIPLINARY",
    "reasonDetails": "Degree rescinded following academic integrity inquiry"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "credentialId": "urn:uuid:cred-8888-9999-aaaa-bbbbccccdddd",
      "status": "REVOKED",
      "onChainTxHash": "0x5b6c...99aa",
      "revokedAt": "2026-11-20T01:15:00.000Z"
    }
  }
  ```

---

## 4. Presentations & QR Endpoints

### 4.1 `POST /presentations/generate`
- **Purpose**: Student creates an ephemeral verifiable presentation and QR token.
- **Auth**: Authenticated (`STUDENT`).
- **Request Body**:
  ```json
  {
    "credentialId": "cred-8888-9999-aaaa-bbbbccccdddd",
    "discloseCgpa": false,
    "discloseDepartment": true,
    "ttlMinutes": 15
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "data": {
      "presentationId": "pres-7777-8888-9999-000011112222",
      "qrUrl": "https://vericred.net/verify/p/pres-7777-8888-9999-000011112222",
      "expiresAt": "2026-11-20T01:30:00.000Z",
      "nonce": "a9f82c4e8b014d59a7f369128d542e88"
    }
  }
  ```

---

## 5. Verification Endpoints (Public)

### 5.1 `POST /verification/verify`
- **Purpose**: Public verification of a standard credential presentation.
- **Auth**: None (Public).
- **Request Body**:
  ```json
  {
    "presentationId": "pres-7777-8888-9999-000011112222"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "overallStatus": "VALID",
      "checks": {
        "signatureValid": true,
        "issuerAuthorized": true,
        "integrityIntact": true,
        "notExpired": true,
        "notRevoked": true
      },
      "credential": {
        "degreeName": "Bachelor of Technology",
        "department": "Computer Science and Engineering",
        "graduationYear": 2026,
        "issuer": "RCC Institute of Information Technology"
      }
    }
  }
  ```

---

### 5.2 `POST /verification/zk-verify`
- **Purpose**: Verify a Groth16 zero-knowledge proof of CGPA eligibility.
- **Auth**: None (Public).
- **Request Body**:
  ```json
  {
    "proof": {
      "pi_a": ["0x12...", "0x34...", "1"],
      "pi_b": [["0x56...", "0x78..."], ["0x9a...", "0xbc..."], ["1", "0"]],
      "pi_c": ["0xde...", "0xf0...", "1"],
      "protocol": "groth16"
    },
    "publicSignals": [
      "12837192837192837192837192837192837192837192837192837192837192",
      "800",
      "1029384756102938475610293847561029384756",
      "9847561029384756102938475610293847561029"
    ]
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "eligibilityProven": true,
      "threshold": "8.0",
      "claim": "CGPA >= 8.0",
      "issuerStatus": "AUTHORIZED",
      "revocationStatus": "ACTIVE"
    }
  }
  ```
- **Error Codes**: `400 ZK_PROOF_INVALID`, `403 ISSUER_KEY_NOT_FOUND`.

---

## 6. Administration Endpoints

### 6.1 `POST /admin/institutions/:id/approve`
- **Purpose**: Admin approves an institution and triggers on-chain registration.
- **Auth**: Authenticated (`ADMIN`).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": { "institutionId": "...", "status": "APPROVED", "onChainTxHash": "0x12..." }
  }
  ```
