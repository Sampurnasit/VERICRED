import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as snarkjs from 'snarkjs';
import {
  generateIssuerKeyPair,
  signCommitment,
  computeAcademicCommitment,
  generateBlindingSalt,
  scaleCgpa,
} from '@vericred/crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const wasmPath = path.resolve(rootDir, 'zk/build/CgpaThresholdValidator_js/CgpaThresholdValidator.wasm');
const zkeyPath = path.resolve(rootDir, 'zk/build/circuit_final.zkey');
const outDir = path.resolve(rootDir, 'blockchain/test/fixtures');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating authentic Groth16 proof calldata for Hardhat EVM test...');
const issuer = await generateIssuerKeyPair();
const scaledCgpa = scaleCgpa(8.72); // 872
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

const { proof, publicSignals } = await snarkjs.groth16.fullProve(circuitInput, wasmPath, zkeyPath);

const calldata = {
  a: [proof.pi_a[0], proof.pi_a[1]],
  b: [
    [proof.pi_b[0][1], proof.pi_b[0][0]],
    [proof.pi_b[1][1], proof.pi_b[1][0]],
  ],
  c: [proof.pi_c[0], proof.pi_c[1]],
  input: publicSignals,
};

fs.writeFileSync(path.join(outDir, 'groth16Calldata.json'), JSON.stringify(calldata, null, 2));
console.log('Saved blockchain/test/fixtures/groth16Calldata.json successfully! 🎉');
