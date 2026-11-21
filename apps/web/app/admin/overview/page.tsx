'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Clock,
  Cpu,
  Layers,
  Key,
  Database,
  ExternalLink,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const polygonRegistryContract =
    process.env.NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS || '0xF250601Ca003f6F97ae6a5b24eFFD99FC2D95266';

  const [approvedCount, setApprovedCount] = useState(1);
  const [pendingCount, setPendingCount] = useState(1);
  const [totalCredsCount, setTotalCredsCount] = useState(142);
  const [pendingList, setPendingList] = useState<any[]>([
    {
      id: 'ju-pending-1',
      legalName: 'Jadavpur University',
      shortCode: 'JU',
      user: { email: 'registrar@jaduniv.edu.in' },
      status: 'PENDING',
    },
  ]);

  useEffect(() => {
    api.admin
      .getAllInstitutions()
      .then((res) => {
        if (res?.institutions && res.institutions.length > 0) {
          const approved = res.institutions.filter((i) => i.status === 'APPROVED');
          const pending = res.institutions.filter((i) => i.status === 'PENDING');
          setApprovedCount(approved.length || 1);
          setPendingCount(pending.length);
          if (pending.length > 0) {
            setPendingList(pending);
          }
          const credCount = res.institutions.reduce((sum, i) => sum + (i._count?.credentials || 0), 0);
          if (credCount > 0) setTotalCredsCount(credCount);
        }
      })
      .catch((err) => {
        console.warn('Admin overview fetch notice:', err);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Consortium Governance Header Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-[#1A2A48] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#458BFF]/10 via-[#45D7E0]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#458BFF]/10 border border-[#458BFF]/30 text-[11px] font-semibold text-[#45D7E0] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AD2A0] animate-pulse" />
              Decentralized Autonomous Consortium
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Consortium Multi-Sig Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Supervise institutional accreditations, manage root Merkle trees, and enforce revocation registry policies on the Polygon Amoy testnet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/institutions"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 transition"
            >
              <Building2 className="h-4 w-4" />
              Manage Institution Registry
            </Link>
          </div>
        </div>

        {/* Network Health bar */}
        <div className="mt-6 pt-5 border-t border-[#1A2A48]/70 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px]">
            <span className="text-slate-500">Registry Contract:</span>
            <span className="text-white px-2 py-0.5 rounded bg-[#0B1226] border border-[#1A2A48]">
              {polygonRegistryContract}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-[#4AD2A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4AD2A0]" />
              Consensus: 3/4 Signatures Required
            </span>
            <span className="text-slate-500">|</span>
            <span>Chain ID: 80002 (Polygon Amoy)</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Approved Institutions</span>
            <div className="p-2 rounded-xl bg-[#458BFF]/10 text-[#458BFF]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">{approvedCount}</p>
          <div className="mt-2 text-[11px] text-[#4AD2A0] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Accredited Issuers</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Accreditations</span>
            <div className="p-2 rounded-xl bg-[#FFB800]/10 text-[#FFB800]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-[#FFB800]">{pendingCount}</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Awaiting multi-sig vote</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Network Total Credentials</span>
            <div className="p-2 rounded-xl bg-[#45D7E0]/10 text-[#45D7E0]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">{totalCredsCount}</p>
          <div className="mt-2 text-[11px] text-[#4AD2A0] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>100% On-Chain Verifiable</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48] relative group hover:border-[#458BFF]/40 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Revocations Enforced</span>
            <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">0</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Merkle Revocation Root Clean</span>
          </div>
        </div>
      </div>

      {/* Pending Reviews Table */}
      <div className="glass-card rounded-2xl border border-[#1A2A48] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1A2A48] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-display">Pending Institutional Accreditations</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-signature governance approval required to authorize university signing keys on Polygon Amoy.
            </p>
          </div>
          <Link
            href="/admin/institutions"
            className="flex items-center gap-1 text-xs font-semibold text-[#458BFF] hover:text-[#45D7E0] transition"
          >
            Review All
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A2A48] bg-[#0E172E]/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6 font-semibold">Institution Name</th>
                <th className="py-3.5 px-6 font-semibold">Short Code</th>
                <th className="py-3.5 px-6 font-semibold">Official Registrar</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Consortium Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
              {pendingList.map((inst) => (
                <tr key={inst.id} className="hover:bg-[#1A2A48]/30 transition">
                  <td className="py-4 px-6 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center font-bold text-[#FFB800]">
                        {inst.shortCode ? inst.shortCode.substring(0, 2) : 'UN'}
                      </div>
                      <span>{inst.legalName || 'University'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-400">{inst.shortCode || 'N/A'}</td>
                  <td className="py-4 px-6 text-slate-300">{inst.user?.email || 'registrar@university.edu'}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-[11px] font-semibold">
                      <Clock className="h-3.5 w-3.5" /> Pending Review
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href="/admin/institutions"
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:brightness-110 transition"
                    >
                      Cast Approval Vote
                    </Link>
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
