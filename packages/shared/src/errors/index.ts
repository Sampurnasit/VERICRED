export class VeriCredError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'VeriCredError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends VeriCredError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_FAILED', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends VeriCredError {
  constructor(message = 'Invalid authentication credentials', code = 'AUTH_INVALID_CREDENTIALS') {
    super(message, code, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends VeriCredError {
  constructor(message = 'Access forbidden: insufficient permissions', code = 'AUTH_FORBIDDEN_ROLE') {
    super(message, code, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends VeriCredError {
  constructor(resource: string, identifier?: string) {
    super(`${resource}${identifier ? ` '${identifier}'` : ''} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class InvalidSignatureError extends VeriCredError {
  constructor(message = 'Cryptographic signature verification failed') {
    super(message, 'VC_INVALID_SIGNATURE', 422);
    this.name = 'InvalidSignatureError';
  }
}

export class RevokedCredentialError extends VeriCredError {
  constructor(message = 'This credential has been revoked by the issuing authority') {
    super(message, 'VC_REVOKED', 422);
    this.name = 'RevokedCredentialError';
  }
}
