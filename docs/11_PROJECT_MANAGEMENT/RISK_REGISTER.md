# RISK_REGISTER.md — Technical Risk Matrix & Mitigation Strategy

> **Document ID**: DOC-PM-004  
> **Status**: Confirmed Technical Specification

---

## 1. Technical Risk Matrix

```mermaid
quadrantChart
    title Project Risk Severity Matrix
    x-axis Low Probability --> High Probability
    y-axis Low Impact --> High Impact
    quadrant-1 Critical Attention
    quadrant-2 High Risk / Monitor Closely
    quadrant-3 Low Risk
    quadrant-4 Moderate Risk
    "Mobile Browser Prover OOM": [0.45, 0.85]
    "Amoy Testnet RPC Outage": [0.70, 0.70]
    "Circom Constraint Bloat": [0.25, 0.90]
    "Relayer Gas Depletion": [0.65, 0.60]
    "W3C Suite Interop Friction": [0.55, 0.45]
```

---

## 2. Risk Log & Mitigation Register

| Risk ID | Risk Description | Probability | Impact | Mitigation Strategy | Contingency Plan |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **RSK-01** | **Mobile Browser Out-of-Memory (OOM)**: Low-end mobile devices crash when computing Groth16 proofs in browser. | Medium | High | Optimize Circom constraints to $\le 3,650$; use 14-bit comparators; execute in Web Worker with $65\,\text{MB}$ memory cap. | Provide fallback: delegate proving to a trusted client-side desktop companion or opt for standard QR verification. |
| **RSK-02** | **Polygon Amoy RPC Outage**: Public testnet RPC nodes rate-limit or fail during live demo. | High | High | Implement `FallbackProvider` cycling through Alchemy, QuickNode, and Polygon public nodes. | Run a local Hardhat node (`localhost:8545`) with instant mock switching. |
| **RSK-03** | **Relayer Gas Wallet Exhaustion**: High volume of issuance transactions depletes relayer POL balance. | High | Medium | Automated Prometheus alert when balance $< 5.0\,\text{POL}$; batch issuance transactions. | Automated top-up faucet script. |
| **RSK-04** | **Circom Underconstrained Circuit**: Missing constraint allows invalid witness generation. | Low | Critical | Fuzz testing with `circom_tester`; verify all signal assignments have corresponding equality constraints. | Formal verification using SMT constraint solvers. |
| **RSK-05** | **W3C VC Proof-Suite Interop**: Custom BabyJubjub signature suite not natively recognized by generic wallets. | High | Low | Implement dual-signature representation (Ed25519 for standard W3C, BabyJubjub for Circom ZK). | Document custom cryptographic adapter clearly in specifications. |

---

## 3. Unresolved Technical & Research Questions

1. **In-Circuit Holder Ownership Binding**: In the MVP, holder presentation binding is enforced through off-circuit verifier nonces. How can we most efficiently prove holder private key ownership directly inside the Circom circuit without doubling constraint counts?
   - *Status*: Under active research for Post-MVP.
2. **Recursive SNARK Transcript Aggregation**: Proving full 4-year degree completion across 40 individual course grades using Halo2 or Nova folding schemes.
   - *Status*: Slated for Phase 3 research roadmap.
