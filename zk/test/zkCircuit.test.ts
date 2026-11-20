import { describe, it, expect, beforeAll } from 'vitest';
import * as snarkjs from 'snarkjs';
import path from 'path';
import fs from 'fs';
import {
  generateIssuerKeyPair,
  signCommitment,
  computeAcademicCommitment,
  generateBlindingSalt,
  scaleCgpa,
} from '@vericred/crypto';

describe('ZK-SNARK Circuit & Groth16 Prover Verification', () => {
  const buildDir = path.resolve(__dirname, '../build');
  const wasmPath = path.join(buildDir, 'CgpaThresholdValidator_js/CgpaThresholdValidator.wasm');
  const zkeyPath = path.join(buildDir, 'circuit_final.zkey');
  const vkeyPath = path.join(buildDir, 'verification_key.json');

  let vKey: any;

  beforeAll(() => {
    expect(fs.existsSync(wasmPath)).toBe(true);
    expect(fs.existsSync(zkeyPath)).toBe(true);
    expect(fs.existsSync(vkeyPath)).toBe(true);
    vKey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
  });

  it('generates a valid Groth16 proof for an eligible student (CGPA 8.72 >= 8.00)', async () => {
    // 1. Institution generates BabyJubjub signing key pair
    const issuer = await generateIssuerKeyPair();

    // 2. Student credential parameters: CGPA 8.72 (872), threshold 8.00 (800)
    const scaledCgpa = scaleCgpa(8.72); // 872
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);

    // 3. Institution signs the commitment
    const { signature } = await signCommitment(issuer.privateKey, commitment);

    // 4. Construct circuit input
    const circuitInput = {
      commitment: commitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    // 5. Generate Groth16 proof and public signals
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath,
      zkeyPath
    );

    expect(proof).toBeDefined();
    expect(proof.pi_a).toBeDefined();
    expect(proof.pi_b).toBeDefined();
    expect(proof.pi_c).toBeDefined();

    // Public signals should match [commitment, threshold, issuerPubKeyX, issuerPubKeyY]
    expect(publicSignals).toHaveLength(4);
    expect(publicSignals[0]).toBe(commitment.toString());
    expect(publicSignals[1]).toBe('800');
    expect(publicSignals[2]).toBe(issuer.publicKey.x);
    expect(publicSignals[3]).toBe(issuer.publicKey.y);

    // 6. Cryptographic Groth16 verification via pairing check against vKey
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    expect(isValid).toBe(true);
  }, 30000);

  it('rejects verification if public signals are tampered (e.g. forged threshold)', async () => {
    const issuer = await generateIssuerKeyPair();
    const scaledCgpa = scaleCgpa(8.72);
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);
    const { signature } = await signCommitment(issuer.privateKey, commitment);

    const circuitInput = {
      commitment: commitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath,
      zkeyPath
    );

    // Attacker modifies public signal to claim proof was for threshold 900
    const tamperedSignals = [...publicSignals];
    tamperedSignals[1] = '900';

    const isValid = await snarkjs.groth16.verify(vKey, tamperedSignals, proof);
    expect(isValid).toBe(false);
  }, 30000);

  it('rejects witness generation when scaledCgpa < threshold', async () => {
    const issuer = await generateIssuerKeyPair();
    const scaledCgpa = scaleCgpa(7.50); // 750 < 800
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);
    const { signature } = await signCommitment(issuer.privateKey, commitment);

    const circuitInput = {
      commitment: commitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    // Constraint error expected in GreaterEqThan comparator
    await expect(
      snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('rejects witness generation when signature is forged / invalid', async () => {
    const issuer = await generateIssuerKeyPair();
    const attacker = await generateIssuerKeyPair();
    const scaledCgpa = scaleCgpa(8.72);
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);

    // Attacker signs instead of legitimate issuer
    const { signature } = await signCommitment(attacker.privateKey, commitment);

    const circuitInput = {
      commitment: commitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x, // Claimed to be legitimate issuer
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    // Constraint error expected in EdDSAPoseidonVerifier
    await expect(
      snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('rejects witness generation when scaledCgpa > 1000 (out of academic range)', async () => {
    const issuer = await generateIssuerKeyPair();
    const scaledCgpa = 1001; // Invalid: > 10.00
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);
    const { signature } = await signCommitment(issuer.privateKey, commitment);

    const circuitInput = {
      commitment: commitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    // Constraint error expected in rangeCheckCgpa (1000 >= 1001 === 0)
    await expect(
      snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('rejects witness generation when commitment does not match Poseidon(scaledCgpa, salt)', async () => {
    const issuer = await generateIssuerKeyPair();
    const scaledCgpa = scaleCgpa(8.72);
    const salt = generateBlindingSalt();
    const trueCommitment = await computeAcademicCommitment(scaledCgpa, salt);
    const { signature } = await signCommitment(issuer.privateKey, trueCommitment);

    // Mismatched commitment supplied
    const fakeCommitment = BigInt(12345678901234567890n);

    const circuitInput = {
      commitment: fakeCommitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    // Constraint error expected in hasher.out === commitment
    await expect(
      snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('rejects verification when Groth16 proof points are corrupted', async () => {
    const issuer = await generateIssuerKeyPair();
    const scaledCgpa = scaleCgpa(8.72);
    const salt = generateBlindingSalt();
    const commitment = await computeAcademicCommitment(scaledCgpa, salt);
    const { signature } = await signCommitment(issuer.privateKey, commitment);

    const circuitInput = {
      commitment: commitment.toString(),
      threshold: '800',
      issuerPubKeyX: issuer.publicKey.x,
      issuerPubKeyY: issuer.publicKey.y,
      scaledCgpa: scaledCgpa.toString(),
      salt: salt.toString(),
      sigR8x: signature.r8x,
      sigR8y: signature.r8y,
      sigS: signature.s,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInput,
      wasmPath,
      zkeyPath
    );

    // Corrupt proof pi_a coordinate
    const corruptedProof = {
      ...proof,
      pi_a: ['1234567890', '9876543210', '1'],
    };

    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, corruptedProof);
    expect(isValid).toBe(false);
  }, 30000);
});
