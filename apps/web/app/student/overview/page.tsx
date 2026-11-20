'use client';

import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, Cpu, Lock, ArrowUpRight, CheckCircle2, QrCode } from 'lucide-react';

export default function StudentOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Credentials</span>
            <Award className="h-4 w-4 text-[#458BFF]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">1</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#4AD2A0]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Dual-Signed (W3C + BabyJubjub)</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Academic Performance</span>
            <Cpu className="h-4 w-4 text-[#45D7E0]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">8.72 CGPA</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Scaled Integer: 872 / 1000</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Blockchain Status</span>
            <ShieldCheck className="h-4 w-4 text-[#4AD2A0]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-[#4AD2A0]">ACTIVE</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Sepolia Revocation Registry Clean</span>
          </div>
        </div>
      </div>

      {/* Featured Credential Card Preview */}
      <div className="glass-card rounded-2xl p-6 border border-[#1A2A48]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Official Academic Credential</h2>
            <p className="text-xs text-slate-400">Cryptographically verifiable on-chain and off-chain</p>
          </div>
          <Link
            href="/student/wallet"
            className="flex items-center gap-1 text-xs font-semibold text-[#458BFF] hover:text-[#45D7E0] transition"
          >
            Manage in Wallet
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#458BFF]/30 bg-gradient-to-br from-[#141F39] via-[#0E172E] to-[#0B1226] p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#45D7E0]">
                Bachelor of Technology (B.Tech)
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Computer Science and Engineering</h3>
              <p className="text-xs text-slate-300 mt-1">
                RCC Institute of Information Technology (Affiliated to MAKAUT)
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block rounded-full bg-[#4AD2A0]/10 border border-[#4AD2A0]/30 px-2.5 py-1 text-xs font-semibold text-[#4AD2A0]">
                CGPA: 8.72 / 10.0
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Issued: June 2026</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1A2A48] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[#458BFF]" />
              <span className="font-mono text-[11px] text-slate-300">
                Commitment: 0x2e8f...91a4 (Poseidon)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/student/wallet"
                className="flex items-center gap-1.5 rounded-lg bg-[#458BFF]/10 border border-[#458BFF]/30 px-3 py-1.5 text-xs font-semibold text-[#458BFF] hover:bg-[#458BFF]/20 transition"
              >
                <QrCode className="h-3.5 w-3.5" />
                Generate Selective ZK Proof
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
