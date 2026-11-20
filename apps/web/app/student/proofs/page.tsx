'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Plus,
  Lock,
  Zap,
  Copy,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ProofStatus = 'valid' | 'expired' | 'revoked';

interface ZKProof {
  id: string;
  statement: string;
  threshold: string;
  circuit: string;
  generated: string;
  expires: string;
  sharedWith: string[];
  status: ProofStatus;
  verifications: number;
  commitmentHash: string;
  nullifier: string;
  groth16Pi_a: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const PROOFS: ZKProof[] = [
  {
    id: 'PROOF-2026-001',
    statement: 'CGPA ≥ 7.5 (Minimum Threshold)',
    threshold: '750',
    circuit: 'CGPABound_v2.circom',
    generated: 'Nov 18, 2026 · 09:14 IST',
    expires: 'Nov 21, 2026 · 09:14 IST',
    sharedWith: ['TCS Hiring Portal', 'Naukri.com'],
    status: 'valid',
    verifications: 3,
    commitmentHash: '0x2e8f4c91...a4f1',
    nullifier: '0x9f3a12b8...07c2',
    groth16Pi_a: '["0x1a2b3c", "0x4d5e6f"]',
  },
  {
    id: 'PROOF-2026-002',
    statement: 'CGPA ≥ 8.0 (High Achiever)',
    threshold: '800',
    circuit: 'CGPABound_v2.circom',
    generated: 'Nov 20, 2026 · 15:42 IST',
    expires: 'Nov 23, 2026 · 15:42 IST',
    sharedWith: ['Infosys InfyTQ', 'LinkedIn Hiring'],
    status: 'valid',
    verifications: 1,
    commitmentHash: '0x7b1d9f43...2e8c',
    nullifier: '0x3c5a87f2...b4d1',
    groth16Pi_a: '["0x9e1f2a", "0x5c6b7d"]',
  },
  {
    id: 'PROOF-2026-000',
    statement: 'CGPA ≥ 6.0 (Eligibility Check)',
    threshold: '600',
    circuit: 'CGPABound_v1.circom',
    generated: 'Oct 05, 2026 · 11:30 IST',
    expires: 'Oct 08, 2026 · 11:30 IST',
    sharedWith: ['Campus Placement Cell'],
    status: 'expired',
    verifications: 7,
    commitmentHash: '0xc4e72a18...9f03',
    nullifier: '0xf1b34d62...5a8e',
    groth16Pi_a: '["0x2c4e6a", "0x8b1d3f"]',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProofStatus }) {
  if (status === 'valid') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        VALID
      </span>
    );
  }
  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-300">
        <Clock className="h-3 w-3" />
        EXPIRED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-1 text-[11px] font-bold text-red-300">
      <XCircle className="h-3 w-3" />
      REVOKED
    </span>
  );
}

function ProofCard({ proof }: { proof: ZKProof }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        proof.status === 'valid'
          ? 'border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-[#0E172E]/80 to-slate-950/90 shadow-xl shadow-cyan-500/5'
          : proof.status === 'expired'
          ? 'border-amber-500/15 bg-slate-900/60'
          : 'border-red-500/15 bg-slate-900/60'
      }`}
    >
      {/* Card Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left: ID + Statement */}
          <div className="flex items-start gap-4">
            <div
              className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                proof.status === 'valid'
                  ? 'bg-cyan-500/10 border border-cyan-500/20'
                  : proof.status === 'expired'
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <ShieldCheck
                className={`h-5 w-5 ${
                  proof.status === 'valid'
                    ? 'text-cyan-400'
                    : proof.status === 'expired'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-slate-400">{proof.id}</span>
                <StatusBadge status={proof.status} />
              </div>
              <h3 className="text-sm font-bold text-white">{proof.statement}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Circuit: {proof.circuit} · Threshold: {proof.threshold}
              </p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-6 sm:text-right shrink-0">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Verifications</p>
              <p className="text-xl font-black text-white font-mono">{proof.verifications}×</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Generated</p>
              <p className="text-xs font-mono text-slate-300">{proof.generated.split(' · ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Shared With */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider mr-1">Shared with:</span>
          {proof.sharedWith.map((org) => (
            <span
              key={org}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1A2A48]/60 border border-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-slate-300"
            >
              {org}
            </span>
          ))}
        </div>

        {/* Expiry Bar */}
        {proof.status === 'valid' && (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Expires: <span className="text-amber-300 font-mono">{proof.expires}</span></span>
          </div>
        )}

        {/* Action Row */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
          {proof.status === 'valid' && (
            <>
              <Link
                href="/student/wallet"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition"
              >
                <QrCode className="h-3.5 w-3.5" />
                Share via QR
              </Link>
              <button
                onClick={() => handleCopy(proof.nullifier)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-slate-800/70 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-white transition"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Copy Nullifier'}
              </button>
            </>
          )}
          {proof.status === 'expired' && (
            <Link
              href="/student/wallet"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-white hover:brightness-110 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate Proof
            </Link>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/60 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition ml-auto"
          >
            <Eye className="h-3.5 w-3.5" />
            {expanded ? 'Hide' : 'View'} Cryptographic Details
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Cryptographic Details */}
      {expanded && (
        <div className="border-t border-white/[0.06] bg-[#080D1A]/80 p-5 sm:p-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            Groth16 Proof Internals (snarkjs)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#0E172E]/80 border border-white/[0.06] p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Poseidon Commitment</p>
              <p className="font-mono text-xs text-cyan-300 break-all">{proof.commitmentHash}</p>
            </div>
            <div className="rounded-xl bg-[#0E172E]/80 border border-white/[0.06] p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ZK Nullifier Hash</p>
              <p className="font-mono text-xs text-purple-300 break-all">{proof.nullifier}</p>
            </div>
            <div className="rounded-xl bg-[#0E172E]/80 border border-white/[0.06] p-3 sm:col-span-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">π_A (Groth16 Proof Point A)</p>
              <p className="font-mono text-xs text-emerald-300 break-all">{proof.groth16Pi_a}</p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="h-3 w-3" />
              BN128 Pairing Check: PASS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
              <Zap className="h-3 w-3" />
              Proof Size: 256 bytes
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
              <Cpu className="h-3 w-3" />
              Generation Time: ~1.2s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentProofsPage() {
  const [filter, setFilter] = useState<'all' | ProofStatus>('all');

  const filtered = PROOFS.filter((p) => filter === 'all' || p.status === filter);
  const validCount = PROOFS.filter((p) => p.status === 'valid').length;
  const expiredCount = PROOFS.filter((p) => p.status === 'expired').length;
  const totalVerifications = PROOFS.reduce((sum, p) => sum + p.verifications, 0);

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Proofs',
            value: PROOFS.length,
            color: 'blue',
            icon: ShieldCheck,
            sub: 'All-time generated',
          },
          {
            label: 'Active',
            value: validCount,
            color: 'emerald',
            icon: CheckCircle2,
            sub: 'Currently valid',
          },
          {
            label: 'Expired',
            value: expiredCount,
            color: 'amber',
            icon: Clock,
            sub: 'Need regeneration',
          },
          {
            label: 'Verifications',
            value: totalVerifications,
            color: 'cyan',
            icon: Eye,
            sub: 'Third-party checks',
          },
        ].map(({ label, value, color, icon: Icon, sub }) => (
          <div
            key={label}
            className={`rounded-2xl border p-5 backdrop-blur-xl shadow-xl ${
              color === 'blue'
                ? 'border-blue-500/20 bg-blue-500/5'
                : color === 'emerald'
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : color === 'amber'
                ? 'border-amber-500/20 bg-amber-500/5'
                : 'border-cyan-500/20 bg-cyan-500/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
              <Icon
                className={`h-4 w-4 ${
                  color === 'blue'
                    ? 'text-blue-400'
                    : color === 'emerald'
                    ? 'text-emerald-400'
                    : color === 'amber'
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              />
            </div>
            <p className="text-3xl font-black text-white font-mono">{value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">ZK Proof History</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Groth16 / BN128 proofs generated from your Poseidon-committed CGPA
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-slate-900/60 p-1">
            {(['all', 'valid', 'expired'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {/* New Proof CTA */}
          <Link
            href="/student/wallet"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New Proof
          </Link>
        </div>
      </div>

      {/* Proof Cards */}
      <div className="space-y-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No proofs match this filter.</p>
          </div>
        ) : (
          filtered.map((proof) => <ProofCard key={proof.id} proof={proof} />)
        )}
      </div>

      {/* How it Works Banner */}
      <div className="rounded-2xl border border-[#1A2A48] bg-gradient-to-r from-[#0E172E]/80 to-[#080D1A]/80 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-400" />
            How ZK CGPA Proofs Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                title: 'Poseidon Commitment',
                desc: 'Your CGPA × 100 (e.g. 872) is hashed with a secret salt using the Poseidon hash function, creating an on-chain commitment without revealing the actual score.',
                color: 'blue',
              },
              {
                step: '02',
                title: 'Groth16 Circuit',
                desc: 'The CGPABound.circom circuit takes your private CGPA and proves it satisfies a public threshold (e.g. ≥ 750) using Groth16 proof on the BN128 elliptic curve.',
                color: 'cyan',
              },
              {
                step: '03',
                title: 'On-Chain Verification',
                desc: 'Verifiers check the Groth16 proof against your public nullifier and commitment on Polygon Amoy — without ever learning your actual CGPA.',
                color: 'emerald',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex gap-3">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-black shrink-0 mt-0.5 ${
                    color === 'blue'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : color === 'cyan'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {step}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
