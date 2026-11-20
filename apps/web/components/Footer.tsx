import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#1A2A48] bg-[#080D1C] text-slate-400 text-xs py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#45D7E0]" />
              <span className="font-bold text-white tracking-wide text-sm">VERICRED</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decentralized academic credential trust network powered by BabyJubjub EdDSA signatures,
              Poseidon cryptographic commitments, and zero-knowledge Groth16 proofs.
            </p>
          </div>

          {/* Cryptography Protocols */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Cryptographic Engine
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="h-3.5 w-3.5 text-[#458BFF]" />
                BabyJubjub Twisted Edwards Curve
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Lock className="h-3.5 w-3.5 text-[#45D7E0]" />
                Poseidon Hash ({'C = Poseidon(x, s)'})
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Globe className="h-3.5 w-3.5 text-[#4AD2A0]" />
                Circom 2.1 & Groth16 SNARKs
              </li>
            </ul>
          </div>

          {/* Governance & Architecture */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Standards & Compliance
            </h4>
            <ul className="space-y-2">
              <li>W3C Verifiable Credentials 2.0</li>
              <li>Decentralized Identifiers (DID:ETHr / DID:KEY)</li>
              <li>Zero On-Chain PII Exposure</li>
              <li>Argon2id Password Storage</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Portals
            </h4>
            <div className="flex flex-col space-y-2">
              <Link href="/verify" className="hover:text-white transition">Public QR Verifier</Link>
              <Link href="/student/overview" className="hover:text-white transition">Student Identity Wallet</Link>
              <Link href="/institution/overview" className="hover:text-white transition">Accredited Issuer Gateway</Link>
              <Link href="/admin/overview" className="hover:text-white transition">Consortium Governance</Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1A2A48]/60 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© 2026 VERICRED Architecture. Built strictly in accordance with AGENTS.md Prime Directives.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-[#141F39] text-[#458BFF] px-2 py-0.5 rounded border border-[#1A2A48]">
              Mainnet/Sepolia Ready
            </span>
            <span className="text-[11px] bg-[#141F39] text-[#4AD2A0] px-2 py-0.5 rounded border border-[#1A2A48]">
              v0.1.0-alpha
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
