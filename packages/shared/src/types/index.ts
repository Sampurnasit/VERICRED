export enum UserRole {
  ADMIN = 'ADMIN',
  INSTITUTION = 'INSTITUTION',
  STUDENT = 'STUDENT',
  VERIFIER = 'VERIFIER',
}

export enum InstitutionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export enum ApprovalAction {
  APPROVE = 'APPROVE',
  SUSPEND = 'SUSPEND',
  REJECT = 'REJECT',
  REACTIVATE = 'REACTIVATE',
}

export enum KeyType {
  BABYJUBJUB_EDDSA = 'BABYJUBJUB_EDDSA',
  ED25519 = 'ED25519',
  SECP256K1 = 'SECP256K1',
}

export enum CredentialStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum VerificationType {
  STANDARD_QR = 'STANDARD_QR',
  ZK_PROOF = 'ZK_PROOF',
  DIRECT_LOOKUP = 'DIRECT_LOOKUP',
}

export enum VerificationResult {
  VALID = 'VALID',
  INVALID = 'INVALID',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum RevocationReason {
  UNSPECIFIED = 'UNSPECIFIED',
  DISCIPLINARY = 'DISCIPLINARY',
  ADMIN_ERROR = 'ADMIN_ERROR',
  RETRACTED = 'RETRACTED',
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}
