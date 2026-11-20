import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu, Globe, CheckCircle2, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050811] text-slate-400 text-xs py-12 mt-auto relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#050811]">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-white tracking-tight text-base">VERICRED</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decentralized academic credential trust network. Combining W3C VC 2.0, dual-signature BabyJubjub cryptography, and Groth16 Zero-Knowledge proofs for mathematically verifiable qualifications without privacy loss.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Smart Contracts Active
              </span>
            </div>
          </div>

          {/* Cryptography Protocols */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-4">
              Cryptographic Engine
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-slate-300">
                <Cpu className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">BabyJubjub EdDSA</span>
                  <p className="text-[11px] text-slate-500">Twisted Edwards sub-group signatures</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Lock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Poseidon Hashes</span>
                  <p className="text-[11px] text-slate-500">CSPRNG 254-bit salted commitments</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Globe className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Groth16 SNARKs</span>
                  <p className="text-[11px] text-slate-500">Sub-50ms BN254 in-browser proofs</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Governance & Architecture */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-4">
              Standards & Security
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                W3C Verifiable Credentials 2.0
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                Decentralized Identifiers (DID:ETHr)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                Zero On-Chain PII Exposure
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                Single-Use Nonce Replay Defense
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                Argon2id Memory-Hard Password Security
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-4">
              Platform Portals
            </h4>
            <div className="flex flex-col space-y-2.5">
              <Link href="/verify" className="flex items-center justify-between text-slate-300 hover:text-cyan-400 transition group">
                <span>Public QR Verifier</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="/student/wallet" className="flex items-center justify-between text-slate-300 hover:text-cyan-400 transition group">
                <span>Student Identity Wallet</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="/institution/overview" className="flex items-center justify-between text-slate-300 hover:text-cyan-400 transition group">
                <span>Accredited Issuer Gateway</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link href="/admin/overview" className="flex items-center justify-between text-slate-300 hover:text-cyan-400 transition group">
                <span>Consortium Governance</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© 2026 VERICRED Architecture. Production-Grade Release v1.0.0-rc1.</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] bg-slate-900 text-blue-400 px-2.5 py-1 rounded-md border border-white/[0.08]">
              Polygon Amoy (80002)
            </span>
            <span className="font-mono text-[11px] bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-md border border-white/[0.08]">
              Groth16 BN254
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
