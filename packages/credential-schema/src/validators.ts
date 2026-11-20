import { z } from 'zod';

export const issueCredentialInputSchema = z.object({
  studentId: z.string().uuid(),
  credentialType: z
    .enum([
      'DegreeCertificate',
      'AcademicTranscript',
      'Marksheet',
      'Diploma',
      'AcademicAchievementCertificate',
      'OtherAcademicCredential',
    ])
    .default('DegreeCertificate'),
  degreeName: z.string().min(2, 'Degree name is required'),
  department: z.string().min(2, 'Department is required'),
  academicSession: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100),
  cgpa: z.number().min(0.0).max(10.0),
  expiresAt: z.string().datetime().optional(),
});

export const csvCredentialRowSchema = z.object({
  enrollmentNumber: z.string().min(3),
  studentName: z.string().min(2),
  studentEmail: z.string().email(),
  degreeName: z.string().min(2),
  department: z.string().min(2),
  graduationYear: z.coerce.number().int().min(1900).max(2100),
  cgpa: z.coerce.number().min(0.0).max(10.0),
  academicSession: z.string().optional(),
});

export const bulkIssueCredentialSchema = z.object({
  records: z.array(csvCredentialRowSchema).min(1).max(500),
});

export const presentationRequestSchema = z.object({
  credentialId: z.string().uuid(),
  discloseCgpa: z.boolean().default(false),
  discloseDepartment: z.boolean().default(true),
  discloseGraduationYear: z.boolean().default(true),
  discloseStudentName: z.boolean().default(true),
  ttlMinutes: z.number().int().min(1).max(60).default(15),
});

export const zkVerifyInputSchema = z.object({
  proof: z.object({
    pi_a: z.array(z.string()).length(3),
    pi_b: z.array(z.array(z.string()).length(2)).length(3),
    pi_c: z.array(z.string()).length(3),
    protocol: z.string(),
  }),
  publicSignals: z.array(z.string()).min(4),
  requiredThreshold: z.number().min(0).max(10).optional(),
});

export type IssueCredentialInput = z.infer<typeof issueCredentialInputSchema>;
export type CsvCredentialRow = z.infer<typeof csvCredentialRowSchema>;
export type BulkIssueCredentialInput = z.infer<typeof bulkIssueCredentialSchema>;
export type PresentationRequestInput = z.infer<typeof presentationRequestSchema>;
export type ZkVerifyInput = z.infer<typeof zkVerifyInputSchema>;
