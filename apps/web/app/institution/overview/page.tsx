'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Users,
  ShieldCheck,
  Key,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
  FileSpreadsheet,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';

export default function InstitutionOverviewPage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const issuerKeyId = '0x9f7a4e2d8b12c5...e89a';
  const babyJubjubPubKey = '0x2bf7a8e104f997...d103ec';

  const copyKey = () => {
    navigator.clipboard?.writeText(babyJubjubPubKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const recentCredentials = [
    {
      id: 'VC-2026-0881',
      student: 'Aarav Sen',
      email: 'aarav.sen@student.rcciit.ac.in',
      enrollment: 'RCCIIT-CSE-2022-042',
      degree: 'B.Tech Computer Science & Engg.',
      cgpa: '8.72',
      commitment: '0x3c9f81...4b21',
      date: 'Today, 14:22',
      status: 'On-Chain Verified',
    },
    {
      id: 'VC-2026-0880',
      student: 'Diya Roy',
      email: 'diya.roy@student.rcciit.ac.in',
      enrollment: 'RCCIIT-IT-2022-019',
      degree: 'B.Tech Information Technology',
      cgpa: '9.10',
      commitment: '0x7a2d10...9e88',
      date: 'Yesterday, 18:05',
      status: 'On-Chain Verified',
    },
    {
      id: 'VC-2026-0879',
      student: 'Rohan Das',
      email: 'rohan.das@student.rcciit.ac.in',
      enrollment: 'RCCIIT-ECE-2022-088',
      degree: 'B.Tech Electronics & Comm.',
      cgpa: '8.45',
      commitment: '0x19bb44...62df',
      date: 'Nov 18, 2026',
      status: 'On-Chain Verified',
    },
    {
      id: 'VC-2026-0878',
      student: 'Priya Mukherjee',
      email: 'priya.m@student.rcciit.ac.in',
      enrollment: 'RCCIIT-CSE-2022-015',
      degree: 'B.Tech Computer Science & Engg.',
      cgpa: '8.90',
      commitment: '0x55ca01...33ad',
      date: 'Nov 16, 2026',
      status: 'On-Chain Verified',
    },
  ];

  const filtered = recentCredentials.filter(
    (c) =>
      c.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.enrollment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.degree.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="glass-card rounded-2xl p-6 border border-[#1A2A48] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#458BFF]/10 via-[#45D7E0]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#458BFF]/10 border border-[#458BFF]/30 text-[11px] font-semibold text-[#45D7E0] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AD2A0] animate-pulse" />
              Accredited University Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Academic Issuer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Cryptographically anchor academic degrees, transcripts, and diplomas on the Polygon Amoy public registry using Poseidon zero-knowledge commitments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/institution/issue"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              Issue New Credential
            </Link>
            <Link
              href="/institution/issue"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1A2A48] bg-[#0E172E] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-[#458BFF]/50 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-[#45D7E0]" />
              Batch CSV Upload
            </Link>
          </div>
        </div>

        {/* Cryptographic Key Quick Info Bar */}
        <div className="mt-6 pt-5 border-t border-[#1A2A48]/70 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4AD2A0]/10 border border-[#4AD2A0]/30 flex items-center justify-center">
              <Key className="h-4 w-4 text-[#4AD2A0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">BabyJubjub Signing Key</span>
                <span className="px-1.5 py-0.5 rounded bg-[#4AD2A0]/15 text-[10px] font-bold text-[#4AD2A0]">ACTIVE</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">PubKey: {babyJubjubPubKey}</span>
            </div>
          </div>

          <button
            onClick={copyKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1A2A48] bg-[#0B1226] text-[11px] font-mono text-slate-300 hover:text-white hover:border-[#458BFF]/40 transition"
          >
            {copiedKey ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#4AD2A0]" />
                <span className="text-[#4AD2A0]">Copied PubKey</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Key Fingerprint</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* High-Impact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Issued Credentials</span>
            <div className="p-2 rounded-xl bg-[#458BFF]/10 text-[#458BFF]">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">142</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#4AD2A0]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Cryptographically Anchored</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enrolled Students</span>
            <div className="p-2 rounded-xl bg-[#45D7E0]/10 text-[#45D7E0]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">320</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Active across 4 degree programs</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verification Veracity</span>
            <div className="p-2 rounded-xl bg-[#4AD2A0]/10 text-[#4AD2A0]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-[#4AD2A0]">99.98%</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Zero false positives reported</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Revocations Enforced</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">0</p>
          <div className="mt-2 text-[11px] text-[#4AD2A0]">
            <span>Registry Status Clean & Active</span>
          </div>
        </div>
      </div>

      {/* Recent Credentials Table with Search & Filtering */}
      <div className="glass-card rounded-2xl border border-[#1A2A48] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1A2A48] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white font-display">Recent Credential Issuances</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Signed with BabyJubjub Poseidon commitments and verifiable via Groth16 zero-knowledge proofs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, roll, or degree..."
                className="w-56 sm:w-64 rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
              />
            </div>
            <Link
              href="/institution/students"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#458BFF] hover:text-[#45D7E0] transition shrink-0"
            >
              Full Roster
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A2A48] bg-[#0E172E]/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6 font-semibold">Student / Recipient</th>
                <th className="py-3.5 px-6 font-semibold">Degree / Program</th>
                <th className="py-3.5 px-4 font-semibold">CGPA</th>
                <th className="py-3.5 px-6 font-semibold">ZK Commitment</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-6 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
              {filtered.map((cred) => (
                <tr key={cred.id} className="hover:bg-[#1A2A48]/30 transition group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#458BFF]/20 to-[#45D7E0]/20 border border-[#458BFF]/30 flex items-center justify-center font-bold text-white text-xs">
                        {cred.student.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-semibold text-white block group-hover:text-[#45D7E0] transition">
                          {cred.student}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{cred.enrollment}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-white font-medium">{cred.degree}</span>
                    <span className="block text-[11px] text-slate-400 font-mono">{cred.id}</span>
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#45D7E0]/10 border border-[#45D7E0]/30 text-[#45D7E0] font-bold">
                      {cred.cgpa}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                    <span className="px-2 py-1 rounded bg-[#0B1226] border border-[#1A2A48]">
                      {cred.commitment}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {cred.date}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4AD2A0]/10 border border-[#4AD2A0]/30 text-[#4AD2A0] text-[11px] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {cred.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
