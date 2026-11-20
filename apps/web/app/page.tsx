'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  Building,
  GraduationCap,
  KeyRound,
  FileCheck,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-20 lg:py-28 text-center px-4 sm:px-6">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#458BFF]/20 to-[#45D7E0]/15 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#458BFF]/30 bg-[#141F39]/60 px-4 py-1.5 text-xs font-semibold text-[#45D7E0] shadow-sm backdrop-blur-md mb-8">
            <Sparkles className="h-3.5 w-3.5 text-[#458BFF]" />
            W3C Verifiable Credentials 2.0 & Groth16 ZK-SNARKs
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Verifiable Academic Truth. <br />
            <span className="gradient-text">Zero-Knowledge Privacy.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            VERICRED eliminates academic credential fraud through dual-signature cryptography,
            decentralized identity, and zero-knowledge proofs. Prove degree authenticity and GPA
            thresholds without disclosing transcripts or personal identifiers.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/verify"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition"
            >
              <QrCode className="h-4 w-4" />
              Verify a Credential
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-[#1A2A48] bg-[#141F39] px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:bg-[#1A2A48] transition"
            >
              <GraduationCap className="h-4 w-4 text-[#45D7E0]" />
              Open Student Wallet
            </Link>
          </div>

          {/* Seed accounts quick pill for reviewers */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-[#1A2A48] bg-[#0E172E]/70 px-4 py-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Quick Test Personas:</span>
            <span className="font-mono text-[#45D7E0]">student@rcciit.org</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[#458BFF]">admin@rcciit.org</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-[#4AD2A0]">admin@vericred.network</span>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-[#1A2A48]/50">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#458BFF]">
            Engineered for High-Assurance Trust
          </h2>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
            Dual-Signature Zero-Knowledge Architecture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-xl bg-[#458BFF]/10 border border-[#458BFF]/20 flex items-center justify-center mb-5">
                <Lock className="h-5 w-5 text-[#458BFF]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Poseidon Commitments</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Academic attributes (scaled CGPA, student identity, graduation batch) are hashed into
                cryptographic commitments {'C = Poseidon(x, s)'} using 254-bit CSPRNG salts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1A2A48] flex items-center text-xs text-slate-400 font-mono">
              <span>circomlibjs / Poseidon 254-bit</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-xl bg-[#45D7E0]/10 border border-[#45D7E0]/20 flex items-center justify-center mb-5">
                <Cpu className="h-5 w-5 text-[#45D7E0]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">BabyJubjub EdDSA</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Institutions sign credential commitments inside the twisted Edwards curve space,
                enabling SNARK proofs to verify institutional authority with under 25,000 R1CS constraints.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1A2A48] flex items-center text-xs text-slate-400 font-mono">
              <span>EdDSA BabyJubjub Curve</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6 relative flex flex-col justify-between">
            <div>
              <div className="h-11 w-11 rounded-xl bg-[#4AD2A0]/10 border border-[#4AD2A0]/20 flex items-center justify-center mb-5">
                <ShieldCheck className="h-5 w-5 text-[#4AD2A0]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Groth16 Zero-Knowledge</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Students generate zero-knowledge proofs proving qualifications (e.g., $CGPA \ge 8.00$)
                without revealing actual grades, ranking, or identity to prospective employers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1A2A48] flex items-center text-xs text-slate-400 font-mono">
              <span>Snarkjs / Groth16 Verifier</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-[#1A2A48] bg-[#141F39]/50 p-8 sm:p-12">
          <div className="max-w-xl mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#45D7E0]">
              End-to-End Lifecycle
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
              How Academic Credentials Move Securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#458BFF]">01</span>
              <h4 className="font-bold text-white text-base">Accreditation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consortium Governance approves verified universities on the smart contract registry.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#45D7E0]">02</span>
              <h4 className="font-bold text-white text-base">Issuance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                University signs W3C VC and BabyJubjub Poseidon commitment and delivers to student.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#4AD2A0]">03</span>
              <h4 className="font-bold text-white text-base">ZK Proof</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student generates mathematical proof in-browser without sending raw academic data to servers.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-2xl font-bold text-[#FFB800]">04</span>
              <h4 className="font-bold text-white text-base">Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verifier scans QR code or validates presentation against blockchain revocation registry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
