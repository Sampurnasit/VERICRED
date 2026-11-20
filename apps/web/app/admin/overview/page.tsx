'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, CheckCircle2, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Approved Institutions</span>
            <Building2 className="h-4 w-4 text-[#458BFF]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">1</p>
          <div className="mt-2 text-[11px] text-[#4AD2A0] flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>RCC-IIT Accredited</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-[#FFB800]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-[#FFB800]">1</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Awaiting consortium vote</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Issued Credentials</span>
            <ShieldCheck className="h-4 w-4 text-[#45D7E0]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">142</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Network total</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Revocations Enforced</span>
            <AlertCircle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">0</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Clean network ledger</span>
          </div>
        </div>
      </div>

      {/* Pending Reviews Table */}
      <div className="glass-card rounded-2xl p-6 border border-[#1A2A48]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Pending Accreditation Applications</h2>
            <p className="text-xs text-slate-400">Review institutional credentials and public keys</p>
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
              <tr className="border-b border-[#1A2A48] text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Institution Name</th>
                <th className="py-3 px-4 font-semibold">Short Code</th>
                <th className="py-3 px-4 font-semibold">Registrar</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
              <tr className="hover:bg-[#1A2A48]/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Jadavpur University
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">JU</td>
                <td className="py-3.5 px-4">registrar@jaduniv.edu.in</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[#FFB800] font-medium">
                    <Clock className="h-3.5 w-3.5" /> Pending Review
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href="/admin/institutions"
                    className="inline-flex items-center rounded-lg bg-[#458BFF] px-3 py-1 text-xs font-semibold text-white hover:brightness-110 transition"
                  >
                    Review Application
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
