import { describe, it, expect } from 'vitest';
import {
  scaleCgpa,
  unscaleCgpa,
  generateBlindingSalt,
  BN254_PRIME,
  computeAcademicCommitment,
  computePoseidon,
  generateIssuerKeyPair,
  signCommitment,
  verifySignature,
} from '../src/index.js';

describe('Cryptographic Primitives & Scaling Test Suite', { timeout: 30000 }, () => {
  describe('CGPA Fixed-Point Scaling', () => {
    it('should correctly scale standard student CGPAs by factor 100', () => {
      // Demo Student A (Aarav Sen)
      expect(scaleCgpa(8.72)).toBe(872);
      // Demo Student B (Diya Roy)
      expect(scaleCgpa(7.65)).toBe(765);
      // Demo Student C (Rohan Das)
      expect(scaleCgpa(9.12)).toBe(912);
    });

    it('should handle boundary values correctly', () => {
      expect(scaleCgpa(0.0)).toBe(0);
      expect(scaleCgpa(10.0)).toBe(1000);
      expect(unscaleCgpa(872)).toBe(8.72);
      expect(unscaleCgpa(1000)).toBe(10.0);
    });

    it('should throw validation error on out-of-range CGPAs', () => {
      expect(() => scaleCgpa(10.01)).toThrow('CGPA must be between 0.00 and 10.00');
      expect(() => scaleCgpa(-0.01)).toThrow('CGPA must be between 0.00 and 10.00');
      expect(() => scaleCgpa(NaN)).toThrow('CGPA must be a valid number');
    });
  });

  describe('Blinding Salt Generation', () => {
    it('should generate a 254-bit positive integer within BN254 scalar field', () => {
      const salt = generateBlindingSalt();
      expect(typeof salt).toBe('bigint');
      expect(salt > 0n).toBe(true);
      expect(salt < BN254_PRIME).toBe(true);
    });

    it('should generate unique salts across consecutive calls', () => {
      const salt1 = generateBlindingSalt();
      const salt2 = generateBlindingSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('Poseidon Cryptographic Commitments', () => {
    it('should compute deterministic commitments C = Poseidon(scaledCgpa, salt)', async () => {
      const salt = 1948209481029481029481029481029481029481029481029481029481029481n;
      const c1 = await computeAcademicCommitment(872, salt);
      const c2 = await computeAcademicCommitment(872, salt);
      expect(typeof c1).toBe('bigint');
      expect(c1).toBe(c2);
    });

    it('should produce completely different commitments when CGPA or salt changes', async () => {
      const salt = generateBlindingSalt();
      const cAarav = await computeAcademicCommitment(872, salt);
      const cDiya = await computeAcademicCommitment(765, salt);
      expect(cAarav).not.toBe(cDiya);
    });
  });

  describe('EdDSA BabyJubjub Digital Signatures', () => {
    it('should generate an authentic key pair, sign commitment, and verify signature', async () => {
      const keyPair = await generateIssuerKeyPair();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey.x).toBeDefined();
      expect(keyPair.publicKey.y).toBeDefined();

      const salt = generateBlindingSalt();
      const commitment = await computeAcademicCommitment(872, salt);

      const { signature, publicKey } = await signCommitment(keyPair.privateKey, commitment);
      expect(publicKey.x).toBe(keyPair.publicKey.x);
      expect(publicKey.y).toBe(keyPair.publicKey.y);

      // Verify authentic signature
      const isValid = await verifySignature(publicKey, commitment, signature);
      expect(isValid).toBe(true);
    });

    it('should reject a signature if the commitment has been tampered with', async () => {
      const keyPair = await generateIssuerKeyPair();
      const salt = generateBlindingSalt();
      const commitment = await computeAcademicCommitment(872, salt);

      const { signature, publicKey } = await signCommitment(keyPair.privateKey, commitment);

      // Tamper with commitment (e.g., student attempting to verify grade 9.50)
      const tamperedCommitment = await computeAcademicCommitment(950, salt);
      const isValid = await verifySignature(publicKey, tamperedCommitment, signature);
      expect(isValid).toBe(false);
    });

    it('should reject a signature if verified against the wrong public key', async () => {
      const issuer1 = await generateIssuerKeyPair();
      const issuer2 = await generateIssuerKeyPair();

      const salt = generateBlindingSalt();
      const commitment = await computeAcademicCommitment(872, salt);

      // Signed by Issuer 1
      const { signature } = await signCommitment(issuer1.privateKey, commitment);

      // Checked against Issuer 2
      const isValid = await verifySignature(issuer2.publicKey, commitment, signature);
      expect(isValid).toBe(false);
    });
  });
});
