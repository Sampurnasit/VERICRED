import jwt, { type SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole } from '@vericred/shared';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  studentId?: string;
}

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: ENV.JWT_ACCESS_EXPIRATION,
  };
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: ENV.JWT_REFRESH_EXPIRATION,
  };
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;
}
