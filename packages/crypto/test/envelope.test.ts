import { describe, it, expect } from 'vitest';
import {
  encryptEnvelope,
  decryptEnvelope,
  isEnvelopeEncrypted,
} from '../src/envelope.js';

describe('AES-256-GCM Envelope Encryption for Sensitive Keys at Rest', () => {
  const masterKey = 'super_secret_master_key_for_testing_purposes_at_least_32_chars';
  const privateKeyPlaintext = '1948290384729384729384729384729384729384729384729384729384729384';

  it('correctly encrypts and decrypts a private key string', () => {
    const encrypted = encryptEnvelope(privateKeyPlaintext, masterKey);

    expect(isEnvelopeEncrypted(encrypted)).toBe(true);
    expect(encrypted.startsWith('enc:v1:')).toBe(true);

    const decrypted = decryptEnvelope(encrypted, masterKey);
    expect(decrypted).toBe(privateKeyPlaintext);
  });

  it('produces distinct ciphertexts for identical plaintexts (probabilistic encryption with fresh IV & salt)', () => {
    const enc1 = encryptEnvelope(privateKeyPlaintext, masterKey);
    const enc2 = encryptEnvelope(privateKeyPlaintext, masterKey);

    expect(enc1).not.toBe(enc2);
    expect(decryptEnvelope(enc1, masterKey)).toBe(privateKeyPlaintext);
    expect(decryptEnvelope(enc2, masterKey)).toBe(privateKeyPlaintext);
  });

  it('detects tampering and rejects corrupted ciphertext with authentication error', () => {
    const encrypted = encryptEnvelope(privateKeyPlaintext, masterKey);
    const parts = encrypted.split(':');
    // Tamper with the ciphertext portion (last segment)
    const originalCipher = parts[parts.length - 1];
    const tamperedCipher = 'ff' + originalCipher.slice(2);
    parts[parts.length - 1] = tamperedCipher;
    const tampered = parts.join(':');

    expect(() => decryptEnvelope(tampered, masterKey)).toThrow();
  });

  it('rejects decryption when the wrong master secret is provided', () => {
    const encrypted = encryptEnvelope(privateKeyPlaintext, masterKey);
    const wrongKey = 'wrong_master_key_for_testing_purposes_at_least_32_chars';

    expect(() => decryptEnvelope(encrypted, wrongKey)).toThrow();
  });

  it('safely passes through legacy unencrypted strings for backwards compatibility', () => {
    const legacyPlaintext = 'arn:aws:kms:us-east-1:123456789012:key/demo-keystore';
    expect(isEnvelopeEncrypted(legacyPlaintext)).toBe(false);

    const result = decryptEnvelope(legacyPlaintext, masterKey);
    expect(result).toBe(legacyPlaintext);
  });
});
