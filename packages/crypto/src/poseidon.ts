import { buildPoseidon } from 'circomlibjs';

let poseidonInstance: any = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

/**
 * Computes Poseidon cryptographic hash over an array of field elements.
 */
export async function computePoseidon(inputs: (bigint | number | string)[]): Promise<bigint> {
  const poseidon = await getPoseidon();
  const bigIntInputs = inputs.map((x) => BigInt(x));
  const hash = poseidon(bigIntInputs);
  return BigInt(poseidon.F.toString(hash));
}

/**
 * Computes the authenticated academic commitment:
 * C = Poseidon(scaledCgpa, salt)
 */
export async function computeAcademicCommitment(
  scaledCgpa: number,
  salt: bigint
): Promise<bigint> {
  return computePoseidon([scaledCgpa, salt]);
}
