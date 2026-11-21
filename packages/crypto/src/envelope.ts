import crypto from 'crypto';

const ENVELOPE_PREFIX = 'enc:v1:';
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits for AES-256
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16; // 128 bits
const DIGEST = 'sha256';

/**
 * Checks if a string value is an AES-256-GCM envelope-encrypted ciphertext.
 */
export function isEnvelopeEncrypted(value: string): boolean {
  return typeof value === 'string' && value.startsWith(ENVELOPE_PREFIX);
}

/**
 * Encrypts a sensitive string (such as an institutional private key)
 * using AES-256-GCM envelope encryption with PBKDF2 key derivation.
 *
 * @param plaintext The secret plaintext to encrypt.
 * @param masterSecret Server master secret key.
 * @returns Serialized envelope: `enc:v1:<saltHex>:<ivHex>:<authTagHex>:<ciphertextHex>`
 */
export function encryptEnvelope(plaintext: string, masterSecret: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty plaintext');
  }
  if (!masterSecret) {
    throw new Error('Master secret is required for envelope encryption');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive 256-bit encryption key
  const key = crypto.pbkdf2Sync(masterSecret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${ENVELOPE_PREFIX}${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts an AES-256-GCM envelope-encrypted ciphertext.
 * If the value is not an encrypted envelope, it safely returns the raw value
 * to maintain transparent backwards compatibility with legacy unencrypted keys.
 *
 * @param envelope Encrypted envelope or raw plaintext string.
 * @param masterSecret Server master secret key.
 * @returns Decrypted plaintext string.
 */
export function decryptEnvelope(envelope: string, masterSecret: string): string {
  if (!envelope) {
    return envelope;
  }

  // Graceful fallback for unencrypted legacy keys / fixtures
  if (!isEnvelopeEncrypted(envelope)) {
    return envelope;
  }

  if (!masterSecret) {
    throw new Error('Master secret is required for envelope decryption');
  }

  const parts = envelope.slice(ENVELOPE_PREFIX.length).split(':');
  if (parts.length !== 4) {
    throw new Error('Malformed envelope format');
  }

  const [saltHex, ivHex, authTagHex, ciphertextHex] = parts;

  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const key = crypto.pbkdf2Sync(masterSecret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}
