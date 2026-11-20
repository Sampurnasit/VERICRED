import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const zkDir = path.resolve(rootDir, 'zk');
const buildDir = path.resolve(zkDir, 'build');
const snarkjsCli = path.resolve(zkDir, 'node_modules/snarkjs/build/cli.cjs');
const circomBin = path.resolve(zkDir, 'bin/circom.exe');

console.log('=== VERICRED ZK-SNARK PIPELINE SETUP ===');
console.log(`Working Directory: ${zkDir}`);
console.log(`Build Directory: ${buildDir}`);

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Step 1: Circom Compilation
console.log('\n[Step 1/5] Compiling CgpaThresholdValidator.circom...');
const circomCmd = `"${circomBin}" "${path.join(zkDir, 'circuits/CgpaThresholdValidator.circom')}" --r1cs --wasm --sym -o "${buildDir}" -l "${path.join(zkDir, 'node_modules')}"`;
console.log(`Running: ${circomCmd}`);
execSync(circomCmd, { stdio: 'inherit' });

// Step 2: Powers of Tau Phase 1
const ptau0 = path.join(buildDir, 'pot14_0000.ptau');
const ptauFinal = path.join(buildDir, 'pot14_final.ptau');
const ptauPrepared = path.join(buildDir, 'pot14_prepared.ptau');

if (!fs.existsSync(ptauPrepared)) {
  console.log('\n[Step 2/5] Running Powers of Tau Phase 1 Ceremony (Power 14 = 16,384 constraints)...');
  execSync(`node "${snarkjsCli}" powersoftau new bn128 14 "${ptau0}" -v`, { stdio: 'inherit' });
  execSync(`node "${snarkjsCli}" powersoftau contribute "${ptau0}" "${ptauFinal}" --name="VeriCred Phase1" -v -e="vericred_phase1_entropy_seed_2026"`, { stdio: 'inherit' });
  execSync(`node "${snarkjsCli}" powersoftau prepare phase2 "${ptauFinal}" "${ptauPrepared}" -v`, { stdio: 'inherit' });
} else {
  console.log('\n[Step 2/5] Powers of Tau Phase 1 already prepared.');
}

// Step 3: Groth16 Phase 2 Circuit-Specific Ceremony
console.log('\n[Step 3/5] Groth16 Phase 2 Setup...');
const r1csPath = path.join(buildDir, 'CgpaThresholdValidator.r1cs');
const zkey0 = path.join(buildDir, 'circuit_0000.zkey');
const zkeyFinal = path.join(buildDir, 'circuit_final.zkey');
const vkeyPath = path.join(buildDir, 'verification_key.json');
const verifierSolPath = path.join(buildDir, 'Groth16Verifier.sol');

if (!fs.existsSync(zkeyFinal)) {
  execSync(`node "${snarkjsCli}" groth16 setup "${r1csPath}" "${ptauPrepared}" "${zkey0}"`, { stdio: 'inherit' });
  execSync(`node "${snarkjsCli}" zkey contribute "${zkey0}" "${zkeyFinal}" --name="VeriCred Phase2" -v -e="vericred_phase2_entropy_seed_2026"`, { stdio: 'inherit' });
}

console.log('Exporting verification key and Solidity verifier contract...');
execSync(`node "${snarkjsCli}" zkey export verificationkey "${zkeyFinal}" "${vkeyPath}"`, { stdio: 'inherit' });
execSync(`node "${snarkjsCli}" zkey export solidityverifier "${zkeyFinal}" "${verifierSolPath}"`, { stdio: 'inherit' });

// Step 4: Distribute artifacts across monorepo packages
console.log('\n[Step 4/5] Distributing ZK artifacts...');

const apiVkeyDest = path.resolve(rootDir, 'apps/api/src/modules/verification/verification_key.json');
const webPublicZkDir = path.resolve(rootDir, 'apps/web/public/zk');
const contractsDest = path.resolve(rootDir, 'blockchain/contracts/Groth16Verifier.sol');

if (!fs.existsSync(webPublicZkDir)) {
  fs.mkdirSync(webPublicZkDir, { recursive: true });
}

// Copy verification key to API and Web
fs.copyFileSync(vkeyPath, apiVkeyDest);
fs.copyFileSync(vkeyPath, path.join(webPublicZkDir, 'verification_key.json'));
console.log(` Copied verification_key.json -> apps/api & apps/web`);

// Copy wasm and zkey to web public folder
const wasmSrc = path.join(buildDir, 'CgpaThresholdValidator_js/CgpaThresholdValidator.wasm');
fs.copyFileSync(wasmSrc, path.join(webPublicZkDir, 'CgpaThresholdValidator.wasm'));
fs.copyFileSync(zkeyFinal, path.join(webPublicZkDir, 'circuit_final.zkey'));
console.log(` Copied WASM & circuit_final.zkey -> apps/web/public/zk/`);

// Copy Groth16Verifier.sol to blockchain contracts
fs.copyFileSync(verifierSolPath, contractsDest);
console.log(` Copied Groth16Verifier.sol -> blockchain/contracts/`);

console.log('\n[Step 5/5] ZK Pipeline Setup Completed Successfully! 🎉');
