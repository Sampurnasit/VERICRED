import { z } from 'zod';
import { UserRole } from '../types/index.js';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const registerInstitutionSchema = z.object({
  legalName: z.string().min(2, 'Legal institution name is required'),
  shortCode: z.string().min(2, 'Short code is required').max(32),
  website: z.string().url('Must be a valid website URL'),
  blockchainAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Must be a valid Ethereum address'),
  accreditationDocUrl: z.string().url().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type RegisterInstitutionInput = z.infer<typeof registerInstitutionSchema>;
