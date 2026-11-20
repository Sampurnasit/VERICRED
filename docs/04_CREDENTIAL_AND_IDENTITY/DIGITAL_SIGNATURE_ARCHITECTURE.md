# DIGITAL_SIGNATURE_ARCHITECTURE.md — Cryptographic Signing & Key Lifecycle

> **Document ID**: DOC-CRYPTO-001  
> **Status**: Confirmed Technical Specification

---

## 1. Cryptographic Signature Architecture

VERICRED utilizes an advanced cryptographic signature architecture optimized for both zero-knowledge SNARK verification and standard digital signature non-repudiation.

```mermaid
flowchart TD
    subgraph Key_Gen ["1. Institutional Key Generation"]
        CSPRNG[CSPRNG 256-bit Seed] --> PrivKey[BabyJubjub Private Key sk in F_r]
        PrivKey --> PubKey[Public Key A = sk * B (Point on BabyJubjub)]
    end

    subgraph Signing ["2. Credential Signing Pipeline"]
        Cred[Canonical Credential Claims] --> ClaimHash[Poseidon(ClaimDigest)]
        Commitment[Commitment C = Poseidon(scaledCgpa, salt)]
        ClaimHash & Commitment --> Digest[M = Poseidon(ClaimHash, Commitment)]
        Digest & PrivKey --> Signer[EdDSA Signer: Compute R8, S]
    end

    subgraph Verification ["3. Verification Options"]
        Signer --> OffChain[Off-Chain Verification: Ethers / circomlibjs]
        Signer --> InCircuit[In-Circuit ZK Verification: EdDSAPoseidonVerifier.circom]
    end
```

---

## 2. Key Generation & Mathematical Foundations

### 2.1 The BabyJubjub Elliptic Curve
BabyJubjub is a twisted Edwards elliptic curve birationally equivalent to a Montgomery curve, defined over the scalar field of BN254:
$$a x^2 + y^2 = 1 + d x^2 y^2$$
- **Coefficient $a$**: $168700$
- **Coefficient $d$**: $168696$
- **Base Point $B$**: Standard generator point with coordinates $(B_x, B_y)$.
- **Subgroup Order $r$**: $21888242871839275222246405745257275088614511777268538073601725288887576439969$

### 2.2 Key Pair Derivation
1. **Private Key ($sk$)**: A 256-bit random scalar chosen uniformly from $\mathbb{F}_r$.
2. **Public Key ($A$)**: Computed via scalar multiplication:
   $$A = sk \cdot B = (A_x, A_y)$$

---

## 3. Signing Algorithm (EdDSA with Poseidon)

Given message digest $M \in \mathbb{F}_r$ (where $M = \text{Poseidon}(\text{claimHash}, C)$):
1. **Nonce Generation**: Compute deterministic nonce $r_n = \text{Poseidon}(sk, M)$.
2. **Point Calculation**: Compute commitment point $R_8 = r_n \cdot B = (R_{8x}, R_{8y})$.
3. **Challenge Hash**: Compute scalar challenge:
   $$h = \text{Poseidon}(R_{8x}, R_{8y}, A_x, A_y, M) \pmod r$$
4. **Signature Scalar**:
   $$S = r_n + h \cdot sk \pmod r$$
5. **Output Signature**: Triple $(R_{8x}, R_{8y}, S)$.

---

## 4. Verification Algorithm

To verify signature $(R_{8x}, R_{8y}, S)$ against message $M$ and public key $A$:
1. Check that $R_8$ and $A$ lie on the BabyJubjub curve.
2. Recompute challenge $h = \text{Poseidon}(R_{8x}, R_{8y}, A_x, A_y, M)$.
3. Verify curve point identity:
   $$S \cdot B = R_8 + h \cdot A$$
If the equation holds, the signature is authentic; otherwise, verification fails immediately.

---

## 5. Compromised Key Handling & Revocation Protocol

If an institution suspects an issuer private key has been exposed:
1. **Emergency Key Invalidation**: The institutional administrator broadcasts `InstitutionRegistry.suspendIssuerKey(keyIdentifier)`.
2. **Smart Contract Assertion**: The contract marks the key status as `COMPROMISED` and records the exact block timestamp $T_{\text{comp}}$.
3. **Triage Verification Policy**:
   - Credentials issued at $t < T_{\text{comp}}$ remain valid subject to individual revocation checks.
   - Credentials issued at $t \ge T_{\text{comp}}$ are permanently flagged as `INVALID_ISSUER_KEY`.
