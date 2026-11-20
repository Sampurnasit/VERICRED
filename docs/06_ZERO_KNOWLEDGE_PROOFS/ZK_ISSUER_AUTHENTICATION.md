# ZK_ISSUER_AUTHENTICATION.md — In-Circuit Issuer Signature Verification

> **Document ID**: DOC-ZK-004  
> **Status**: Confirmed Technical Specification

---

## 1. The Core Engineering Challenge

A fundamental flaw in naive zero-knowledge academic credentials is the **Unauthenticated Witness Exploit**:

> If a circuit only proves $\exists x, s \text{ s.t. } C = \text{Poseidon}(x, s) \land x \ge 800$, an adversary can simply generate arbitrary random numbers $x = 950$ and $s = 12345$, calculate $C$, and produce a valid proof. The proof proves that *some* number is $\ge 8.0$, but not that an *accredited university attested to that grade*.

To defeat this exploit, the circuit MUST verify an authentic institutional signature on the commitment inside the zero-knowledge proof.

---

## 2. Cryptographic Scheme Selection: EdDSA BabyJubjub vs. Ed25519

Evaluating cryptographic signature schemes for Circom zk-SNARK circuits:

```mermaid
graph TD
    subgraph Ed25519_Failure ["Ordinary Ed25519 (Curve25519 / SHA-512)"]
        E1[Non-Native Field Arithmetic mod 2^255 - 19]
        E2[SHA-512 Bitwise Operations]
        E3[R1CS Cost: ~150,000 to 250,000 Constraints]
        E4[Client Prover: 45 - 90 seconds (Browser Crash Risk)]
    end

    subgraph BabyJubjub_Success ["VERICRED Choice: EdDSA BabyJubjub / Poseidon"]
        B1[Native Field Arithmetic over BN254 Scalar Field]
        B2[Algebraic Poseidon Hashing]
        B3[R1CS Cost: ~3,350 Constraints]
        B4[Client Prover: 1.2 seconds (Smooth Browser UX)]
    end
```

### Analysis of Trade-offs
1. **Ed25519 over Curve25519**: Curve25519 operates over a field characteristic $2^{255} - 19$, which differs completely from the BN254 scalar field ($p \approx 2^{254}$). Emulating 256-bit non-native field multiplications in Circom requires large limb representations, exploding constraint counts to over $150,000$.
2. **EdDSA over BabyJubjub**: BabyJubjub's base field is identical to BN254's scalar field $\mathbb{F}_p$. Elliptic curve additions and multiplications require only **native arithmetic constraints**, shrinking circuit size by over $97\%$.

---

## 3. Cryptographic Signature Adapter Pipeline

To interface W3C credentials with Circom, VERICRED implements a dedicated adapter:

```typescript
import { buildBabyjub, buildPoseidon } from 'circomlibjs';

export async function signAcademicCommitment(
  privateKey: bigint,
  commitment: bigint
) {
  const babyJub = await buildBabyjub();
  const poseidon = await buildPoseidon();

  // 1. Message M is the academic commitment
  const M = commitment;

  // 2. Deterministic nonce r = Poseidon(privKey, M)
  const r = poseidon([privateKey, M]);

  // 3. R8 = r * B
  const R8 = babyJub.mulPointEscalar(babyJub.Base8, r);

  // 4. Derive Public Key A = privKey * B
  const A = babyJub.mulPointEscalar(babyJub.Base8, privateKey);

  // 5. Hash h = Poseidon(R8x, R8y, Ax, Ay, M)
  const h = poseidon([R8[0], R8[1], A[0], A[1], M]);

  // 6. S = r + h * privKey mod Order
  const S = (r + h * privateKey) % babyJub.subOrder;

  return {
    sigR8x: R8[0].toString(),
    sigR8y: R8[1].toString(),
    sigS: S.toString(),
    issuerPubKeyX: A[0].toString(),
    issuerPubKeyY: A[1].toString()
  };
}
```

---

## 4. Binding In-Circuit Proof to the On-Chain Registry

Generating a valid proof is only the first step. The public verification portal seals the security loop by anchoring the circuit's public outputs to the blockchain:

1. Circuit emits public signals: $[C, T, A_x, A_y]$.
2. The verifier passes $(A_x, A_y)$ to the `InstitutionRegistry.sol` smart contract on Polygon Amoy.
3. The contract confirms:
   - Does this key belong to a recognized institution?
   - Is that institution currently `APPROVED`?
   - Was this key active at the credential's issuance block?
4. If the key is unapproved or unregistered, the proof is rejected as **unauthorized**, preventing attackers from self-signing fraudulent credentials.
