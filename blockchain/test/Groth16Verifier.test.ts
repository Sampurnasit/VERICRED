import '@nomicfoundation/hardhat-toolbox';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import groth16Calldata from './fixtures/groth16Calldata.json';

describe('Groth16Verifier Smart Contract (On-Chain EVM Verification)', () => {
  let verifierContract: any;

  before(async () => {
    const VerifierFactory = await (ethers as any).getContractFactory('Groth16Verifier');
    verifierContract = await VerifierFactory.deploy();
    await verifierContract.waitForDeployment();
  });

  it('successfully verifies authentic Groth16 ZK-SNARK proof on-chain in EVM', async () => {
    const a = groth16Calldata.a as [string, string];
    const b = groth16Calldata.b as [[string, string], [string, string]];
    const c = groth16Calldata.c as [string, string];
    const input = groth16Calldata.input as [string, string, string, string];

    const isValid = await verifierContract.verifyProof(a, b, c, input);
    expect(isValid).to.be.true;
  });

  it('rejects on-chain EVM verification if threshold public signal is tampered', async () => {
    const a = groth16Calldata.a as [string, string];
    const b = groth16Calldata.b as [[string, string], [string, string]];
    const c = groth16Calldata.c as [string, string];

    // Attacker modifies threshold from 800 to 900
    const tamperedInput = [
      groth16Calldata.input[0],
      '900',
      groth16Calldata.input[2],
      groth16Calldata.input[3],
    ] as [string, string, string, string];

    const isValid = await verifierContract.verifyProof(a, b, c, tamperedInput);
    expect(isValid).to.be.false;
  });

  it('rejects on-chain EVM verification if commitment public signal is tampered', async () => {
    const a = groth16Calldata.a as [string, string];
    const b = groth16Calldata.b as [[string, string], [string, string]];
    const c = groth16Calldata.c as [string, string];

    // Attacker modifies commitment
    const tamperedInput = [
      '123456789012345678901234567890',
      groth16Calldata.input[1],
      groth16Calldata.input[2],
      groth16Calldata.input[3],
    ] as [string, string, string, string];

    const isValid = await verifierContract.verifyProof(a, b, c, tamperedInput);
    expect(isValid).to.be.false;
  });
});
