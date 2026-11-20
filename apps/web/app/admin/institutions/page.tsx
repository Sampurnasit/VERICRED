'use client';

import React, { useState } from 'react';
import { Building2, CheckCircle2, XCircle, Search, ShieldCheck } from 'lucide-react';

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState([
    {
      id: 'inst-1',
      name: 'RCC Institute of Information Technology',
      shortCode: 'RCCIIT',
      contactEmail: 'admin@rcciit.org',
      status: 'APPROVED',
      blockchainAddress: '0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
    },
    {
      id: 'inst-2',
      name: 'Jadavpur University',
      shortCode: 'JU',
      contactEmail: 'registrar@jaduniv.edu.in',
      status: 'PENDING',
      blockchainAddress: '0x902F82913A1d020eFf32145A62D7bC091bFa1782',
    },
  ]);

  const handleApprove = (id: string) => {
    setInstitutions((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: 'APPROVED' } : inst))
    );
  };

  const handleSuspend = (id: string) => {
    setInstitutions((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, status: 'SUSPENDED' } : inst))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Institution Registry</h2>
          <p className="text-xs text-slate-400">
            Authorize or suspend universities on the Ethereum smart contract registry
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search institutions..."
            className="rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-[#1A2A48] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1A2A48] bg-[#0B1226]/50 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-semibold">Institution</th>
              <th className="py-3.5 px-4 font-semibold">Code</th>
              <th className="py-3.5 px-4 font-semibold">Official Contact</th>
              <th className="py-3.5 px-4 font-semibold">Blockchain Identity</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Consortium Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
            {institutions.map((inst) => (
              <tr key={inst.id} className="hover:bg-[#1A2A48]/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white">{inst.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{inst.shortCode}</td>
                <td className="py-3.5 px-4">{inst.contactEmail}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500 truncate max-w-[140px]">
                  {inst.blockchainAddress}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      inst.status === 'APPROVED'
                        ? 'text-[#4AD2A0]'
                        : inst.status === 'PENDING'
                        ? 'text-[#FFB800]'
                        : 'text-[#FF707D]'
                    }`}
                  >
                    {inst.status === 'APPROVED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {inst.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {inst.status === 'PENDING' ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(inst.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#458BFF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve On-Chain
                    </button>
                  ) : inst.status === 'APPROVED' ? (
                    <button
                      type="button"
                      onClick={() => handleSuspend(inst.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#FF707D]/30 bg-[#FF707D]/10 px-3 py-1.5 text-xs font-semibold text-[#FF707D] hover:bg-[#FF707D]/20 transition"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Suspend
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApprove(inst.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#458BFF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
                    >
                      Re-Instate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
