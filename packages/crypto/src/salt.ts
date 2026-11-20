// BN254 scalar field prime p (order of the curve)
export const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617'
);

export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  }
  return bytes;
}

/**
 * Generates a cryptographically secure 254-bit random field element blinding salt.
 * Ensures the value strictly lies within the scalar field of BN254 (0 < salt < p).
 */
export function generateBlindingSalt(): bigint {
  while (true) {
    const bytes = getRandomBytes(32);
    // Mask top 2 bits to guarantee value is 254 bits and less than prime p
    bytes[0] &= 0x3f;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    const salt = BigInt(`0x${hex}`);
    if (salt > 0n && salt < BN254_PRIME) {
      return salt;
    }
  }
}
