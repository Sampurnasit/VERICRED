'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  Building2,
  GraduationCap,
  KeyRound,
  FileCheck,
  ChevronRight,
  Layers,
  Fingerprint,
  ExternalLink,
  ShieldAlert,
  Sliders,
} from 'lucide-react';

export default function HomePage() {
  const [demoThreshold, setDemoThreshold] = useState('8.00');
  const [demoVerified, setDemoVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleQuickDemoVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setDemoVerified(true);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/25 via-cyan-500/20 to-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl text-center relative z-10">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm backdrop-blur-md mb-8 hover:border-cyan-500/50 transition">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>W3C Verifiable Credentials 2.0 &amp; Groth16 ZK-SNARKs</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] text-slate-400">Polygon Amoy</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] sm:leading-[1.1]">
            Verifiable Academic Truth. <br />
            <span className="gradient-text">Zero-Knowledge Privacy.</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Eliminate academic credential fraud with dual-signature cryptography, decentralized identity, and Groth16 Zero-Knowledge proofs. Prove honors degrees and GPA thresholds without exposing raw transcripts or student PII.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/verify"
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200"
            >
              <QrCode className="h-4 w-4" />
              <span>Verify a Credential</span>
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </Link>

            <Link
              href="/student/wallet"
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.12] bg-slate-900/80 px-6 py-4 text-sm font-bold text-slate-200 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white transition shadow-sm backdrop-blur-md"
            >
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <span>Open Student Wallet</span>
            </Link>
          </div>

          {/* Test Personas Quick Bar */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-900/70 p-2.5 backdrop-blur-xl shadow-lg">
            <span className="px-2 text-xs font-semibold text-slate-400">Instant Demo Personas:</span>
            <Link
              href="/student/wallet"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
            >
              <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
              <span>Student (Aarav Sen)</span>
            </Link>
            <Link
              href="/institution/overview"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20 transition"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Issuer (Dr. Rostova)</span>
            </Link>
            <Link
              href="/admin/overview"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Platform Admin</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="w-full border-b border-white/[0.06] bg-[#060A14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">0 Bytes</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">On-Chain PII Stored</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">&lt; 50ms</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Proof Verification Time</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-mono">&lt; 25k</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">R1CS Constraints</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">100%</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mathematical Proof</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ZK Demo Card Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl border border-white/[0.1] bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left explanation */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300">
                <Lock className="h-3.5 w-3.5 text-blue-400" />
                Interactive ZK Simulation
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Prove Eligibility <br />
                <span className="text-cyan-400">Without Revealing Your GPA</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                In traditional verifications, you submit an entire academic transcript—exposing full names, dates of birth, failed classes, and precise numerical scores.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                With VERICRED Groth16 Zero-Knowledge SNARKs, you create a cryptographic proof answering a boolean predicate (e.g. <span className="font-mono text-cyan-300">CGPA &ge; {demoThreshold}</span>). The verifier obtains mathematical certainty without ever learning your exact GPA of <span className="font-mono text-emerald-400">8.72</span>.
              </p>

              <div className="pt-2">
                <Link
                  href="/student/wallet"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>Experience full witness generation in Student Wallet</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Simulator Box */}
            <div className="rounded-2xl border border-white/[0.1] bg-[#0A1020] p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Live Groth16 Verifier</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  BN254 Pairing
                </span>
              </div>

              {/* Secret Claim Display */}
              <div className="rounded-xl bg-slate-900/80 p-4 border border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Student Secret (Private Witness):</span>
                  <span className="font-mono text-emerald-400 font-bold">CGPA = 8.72 (Scaled: 872)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Blinding Salt (CSPRNG):</span>
                  <span className="font-mono text-slate-500 text-[10px]">0x7f8a1290...c4e</span>
                </div>
              </div>

              {/* Requirement Slider/Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="req-threshold" className="font-semibold text-slate-200">
                    Employer Threshold Requirement:
                  </label>
                  <span className="font-mono text-cyan-400 font-bold">&ge; {demoThreshold} CGPA</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['7.50', '8.00', '8.50', '9.00'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setDemoThreshold(val);
                        setDemoVerified(false);
                      }}
                      className={`py-2 text-xs font-mono font-semibold rounded-lg border transition ${
                        demoThreshold === val
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-white/[0.08] bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      &ge; {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verify Action */}
              <button
                type="button"
                onClick={handleQuickDemoVerify}
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition disabled:opacity-50"
              >
                {isVerifying ? (
                  <span>Executing Bilinear Pairing Check...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Test Proof Execution</span>
                  </>
                )}
              </button>

              {/* Result Notice */}
              {demoVerified && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                  parseFloat(demoThreshold) <= 8.72
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-red-500/40 bg-red-500/10 text-red-200'
                }`}>
                  {parseFloat(demoThreshold) <= 8.72 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">ELIGIBILITY MATHEMATICALLY PROVEN</p>
                        <p className="mt-1 text-slate-300 text-[11px]">
                          Bilinear pairing verified. Student satisfies <span className="font-mono font-bold text-emerald-300">&ge; {demoThreshold}</span> without disclosing their true 8.72 grade!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">CONSTRAINT VIOLATION: INELIGIBLE</p>
                        <p className="mt-1 text-slate-300 text-[11px]">
                          Circom R1CS constraint rejected: secret student grade does not satisfy <span className="font-mono text-red-300">&ge; {demoThreshold}</span>.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/[0.06]">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Engineered for High-Assurance Trust
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            Four Layers of Cryptographic Defense
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="glass-card rounded-2xl p-7 relative flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Poseidon Commitments</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Academic attributes (scaled CGPA, student enrollment number, graduation batch) are bound into
                cryptographic commitments <span className="font-mono text-cyan-300">C = Poseidon(x, s)</span> using 254-bit CSPRNG salts.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>circomlibjs / Poseidon</span>
              <span className="text-blue-400">254-bit field</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card rounded-2xl p-7 relative flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center mb-6">
                <Cpu className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">BabyJubjub EdDSA</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Accredited institutions sign credential commitments on the twisted Edwards curve space. This enables SNARK circuits to verify institutional signatures with zero SNARK-unfriendly operations.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Twisted Edwards</span>
              <span className="text-cyan-400">&lt; 25k constraints</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card rounded-2xl p-7 relative flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">On-Chain Revocation</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Universities retain full revocation governance on Polygon Amoy. When an academic title is revoked, all subsequent QR presentations and ZK proofs are invalidated instantaneously.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Smart Contract State</span>
              <span className="text-emerald-400">0x9fE4...</span>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Flow */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 mb-16">
        <div className="rounded-3xl border border-white/[0.08] bg-slate-900/50 p-8 sm:p-12">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              End-to-End Credential Flow
            </h2>
            <p className="text-3xl font-extrabold text-white mt-1">
              How Academic Truth Travels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 relative">
              <span className="font-mono text-3xl font-black text-blue-500">01</span>
              <h4 className="font-bold text-white text-lg">Consortium Accreditation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accredited universities are registered on-chain in <span className="font-mono text-slate-300">InstitutionRegistry.sol</span> with dual public keys.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="font-mono text-3xl font-black text-cyan-500">02</span>
              <h4 className="font-bold text-white text-lg">Credential Issuance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Dean signs W3C VC 2.0 with Ed25519 and a Poseidon salted commitment with BabyJubjub.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="font-mono text-3xl font-black text-emerald-500">03</span>
              <h4 className="font-bold text-white text-lg">Ephemeral Sharing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students present 15-minute QR codes with single-use cryptographic nonces to protect against replay attacks.
              </p>
            </div>

            <div className="space-y-3 relative">
              <span className="font-mono text-3xl font-black text-amber-500">04</span>
              <h4 className="font-bold text-white text-lg">Zero-Knowledge Check</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verifiers execute BN254 bilinear pairing checks verifying credentials without unmasking private identity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
