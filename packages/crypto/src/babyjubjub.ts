import { buildBabyjub, buildEddsa, buildPoseidon } from 'circomlibjs';
import { getRandomBytes } from './salt.js';

let babyJubInstance: any = null;
let eddsaInstance: any = null;
let poseidonInstance: any = null;

async function getInstances() {
  if (!babyJubInstance || !eddsaInstance || !poseidonInstance) {
    babyJubInstance = await buildBabyjub();
    eddsaInstance = await buildEddsa();
    poseidonInstance = await buildPoseidon();
  }
  return {
    babyJub: babyJubInstance,
    eddsa: eddsaInstance,
    poseidon: poseidonInstance,
  };
}

export interface BabyJubjubPoint {
  x: string;
  y: string;
}

export interface EdDSASignature {
  r8x: string;
  r8y: string;
  s: string;
}

export interface IssuerKeyPair {
  privateKey: string; // Hex string (32 bytes)
  publicKey: BabyJubjubPoint;
}

/**
 * Generates an institutional BabyJubjub EdDSA key pair.
 */
export async function generateIssuerKeyPair(seed?: Buffer): Promise<IssuerKeyPair> {
  const { eddsa } = await getInstances();
  const privKey = seed ?? Buffer.from(getRandomBytes(32));
  const pubKey = eddsa.prv2pub(privKey);

  return {
    privateKey: privKey.toString('hex'),
    publicKey: {
      x: eddsa.F.toString(pubKey[0]),
      y: eddsa.F.toString(pubKey[1]),
    },
  };
}

/**
 * Signs an academic commitment message using the institution's EdDSA BabyJubjub private key.
 */
export async function signCommitment(
  privateKeyHex: string,
  commitment: bigint
): Promise<{ signature: EdDSASignature; publicKey: BabyJubjubPoint }> {
  const { eddsa } = await getInstances();
  const privKey = Buffer.from(privateKeyHex, 'hex');
  const pubKey = eddsa.prv2pub(privKey);

  // circomlibjs expects message as a field element (Uint8Array representation)
  const msgElement = eddsa.F.e(commitment);
  const sig = eddsa.signPoseidon(privKey, msgElement);

  return {
    signature: {
      r8x: eddsa.F.toString(sig.R8[0]),
      r8y: eddsa.F.toString(sig.R8[1]),
      s: sig.S.toString(),
    },
    publicKey: {
      x: eddsa.F.toString(pubKey[0]),
      y: eddsa.F.toString(pubKey[1]),
    },
  };
}

/**
 * Verifies an EdDSA BabyJubjub signature against a message and issuer public key.
 */
export async function verifySignature(
  publicKey: BabyJubjubPoint,
  commitment: bigint,
  signature: EdDSASignature
): Promise<boolean> {
  const { eddsa } = await getInstances();
  const pubKey = [eddsa.F.e(publicKey.x), eddsa.F.e(publicKey.y)];
  const sig = {
    R8: [eddsa.F.e(signature.r8x), eddsa.F.e(signature.r8y)],
    S: BigInt(signature.s),
  };

  const msgElement = eddsa.F.e(commitment);
  return eddsa.verifyPoseidon(msgElement, sig, pubKey);
}
