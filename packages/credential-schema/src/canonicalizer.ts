import crypto from 'node:crypto';

/**
 * Deterministically stringifies an object by sorting its keys recursively.
 * Guarantees cryptographic consistency across diverse runtime environments.
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalJsonStringify(item)).join(',')}]`;
  }

  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = sortedKeys.map((key) => {
    const value = (obj as Record<string, unknown>)[key];
    return `"${key}":${canonicalJsonStringify(value)}`;
  });

  return `{${pairs.join(',')}}`;
}

/**
 * Computes a standard SHA-256 hex digest of the canonical JSON claims.
 */
export function computeClaimDigestSha256(claims: unknown): string {
  const canonical = canonicalJsonStringify(claims);
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}
