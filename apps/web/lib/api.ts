/**
 * VERICRED Frontend API Client
 * Enterprise-grade typed HTTP client interfacing @vericred/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Retrieve stored token from browser storage
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vericred_access_token');
}

/**
 * Persist or clear authentication token
 */
export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('vericred_access_token', token);
  } else {
    localStorage.removeItem('vericred_access_token');
  }
}

/**
 * Core HTTP Request Execution
 */
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include HTTP-only cookies
  });

  const json: ApiResponse<T> = await response.json().catch(() => {
    throw new ApiError('Failed to parse API response', 'PARSE_ERROR');
  });

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    const errorCode = json.error?.code || 'HTTP_ERROR';
    throw new ApiError(errorMsg, errorCode, json.error?.details);
  }

  return json.data as T;
}

// ── Service Endpoints ──────────────────────────────────────────────────────────

export const api = {
  auth: {
    async login(email: string, password: string) {
      const data = await request<{ user: any; accessToken: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.accessToken) {
        setStoredToken(data.accessToken);
      }
      return data;
    },

    async register(payload: {
      email: string;
      password: string;
      role: 'STUDENT' | 'INSTITUTION' | 'VERIFIER';
      firstName: string;
      lastName: string;
      institutionName?: string;
      shortCode?: string;
      website?: string;
      blockchainAddress?: string;
    }) {
      const data = await request<{ user: any; accessToken: string }>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data.accessToken) {
        setStoredToken(data.accessToken);
      }
      return data;
    },

    async me() {
      return request<{ user: any }>('/api/v1/auth/me', {
        method: 'GET',
      });
    },

    async logout() {
      try {
        await request('/api/v1/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },
  },

  credentials: {
    async getMyStudentCredentials() {
      return request<{ credentials: any[] }>('/api/v1/credentials/student', {
        method: 'GET',
      });
    },

    async getMyInstitutionCredentials() {
      return request<{ credentials: any[] }>('/api/v1/credentials/institution', {
        method: 'GET',
      });
    },

    async getById(id: string) {
      return request<{ credential: any }>(`/api/v1/credentials/${id}`, {
        method: 'GET',
      });
    },

    async issueSingle(payload: {
      studentId: string;
      degreeName: string;
      department: string;
      graduationYear: number;
      cgpa: number;
      academicSession?: string;
      credentialType?: string;
    }) {
      return request<{ credential: any; verifiableCredential: any }>('/api/v1/credentials/issue', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async issueBulk(records: any[]) {
      return request<{ issuedCount: number; credentials: any[] }>('/api/v1/credentials/issue-bulk', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
    },

    async revoke(credentialId: string, revocationReason: string) {
      return request<{ credential: any; message: string }>(`/api/v1/credentials/${credentialId}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ revocationReason }),
      });
    },
  },

  presentations: {
    async create(payload: {
      credentialIds: string[];
      verifierAudience?: string;
      expirationSeconds?: number;
    }) {
      return request<{
        presentation: any;
        nonce: string;
        expiresAt: string;
        qrCodeUri: string;
      }>('/api/v1/presentations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getByNonce(nonce: string) {
      return request<{ presentation: any; metadata: any }>(`/api/v1/presentations/${nonce}`, {
        method: 'GET',
      });
    },
  },

  verification: {
    async verifyPresentation(presentation: any) {
      return request<any>('/api/v1/verify/presentation', {
        method: 'POST',
        body: JSON.stringify({ presentation }),
      });
    },

    async verifyZkProof(proof: any, publicSignals: string[], requiredThreshold?: number) {
      return request<any>('/api/v1/verify/zk', {
        method: 'POST',
        body: JSON.stringify({ proof, publicSignals, requiredThreshold }),
      });
    },
  },

  institutions: {
    async getProfile() {
      return request<{ institution: any }>('/api/v1/institutions/me', {
        method: 'GET',
      });
    },

    async getStudents() {
      return request<{ students: any[] }>('/api/v1/institutions/students', {
        method: 'GET',
      });
    },

    async enrollStudent(payload: {
      firstName: string;
      lastName: string;
      email: string;
      enrollmentNumber: string;
      department: string;
      batchYear: number;
    }) {
      return request<{ student: any }>('/api/v1/institutions/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  admin: {
    async getAllInstitutions() {
      return request<{ institutions: any[] }>('/api/v1/admin/institutions', {
        method: 'GET',
      });
    },

    async getPendingInstitutions() {
      return request<{ institutions: any[] }>('/api/v1/admin/institutions/pending', {
        method: 'GET',
      });
    },

    async approveInstitution(id: string) {
      return request<{ institution: any; message: string }>(`/api/v1/admin/institutions/${id}/approve`, {
        method: 'POST',
      });
    },

    async suspendInstitution(id: string) {
      return request<{ institution: any; message: string }>(`/api/v1/admin/institutions/${id}/suspend`, {
        method: 'POST',
      });
    },

    async getAuditLogs() {
      return request<{ logs: any[] }>('/api/v1/admin/audit-logs', {
        method: 'GET',
      });
    },
  },
};
