'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Users, ShieldCheck, Key, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export default function InstitutionOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Issued Credentials</span>
            <Award className="h-4 w-4 text-[#458BFF]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">142</p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#4AD2A0]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Cryptographically Anchored</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Enrolled Students</span>
            <Users className="h-4 w-4 text-[#45D7E0]" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">320</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Batch 2022 - 2026 Active</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Issuer Signing Key</span>
            <Key className="h-4 w-4 text-[#4AD2A0]" />
          </div>
          <p className="mt-3 text-2xl font-bold font-display text-[#4AD2A0]">BabyJubjub</p>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            <span>Key ID: 0x9f7...b12 (Active)</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-[#1A2A48]">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Revocations</span>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold font-display text-white">0</p>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>Registry Status Clean</span>
          </div>
        </div>
      </div>

      {/* Recent Issuances */}
      <div className="glass-card rounded-2xl p-6 border border-[#1A2A48]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent Credential Issuances</h2>
            <p className="text-xs text-slate-400">Signed with BabyJubjub Poseidon commitments</p>
          </div>
          <Link
            href="/institution/students"
            className="flex items-center gap-1 text-xs font-semibold text-[#458BFF] hover:text-[#45D7E0] transition"
          >
            View All Students
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A2A48] text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Enrollment ID</th>
                <th className="py-3 px-4 font-semibold">Degree / Program</th>
                <th className="py-3 px-4 font-semibold">CGPA</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
              <tr className="hover:bg-[#1A2A48]/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white">Aarav Sen</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">RCCIIT-CSE-2022-042</td>
                <td className="py-3.5 px-4">B.Tech Computer Science</td>
                <td className="py-3.5 px-4 font-mono text-[#45D7E0] font-semibold">8.72</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[#4AD2A0] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#1A2A48]/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white">Diya Roy</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">RCCIIT-IT-2022-019</td>
                <td className="py-3.5 px-4">B.Tech Information Technology</td>
                <td className="py-3.5 px-4 font-mono text-[#45D7E0] font-semibold">9.10</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[#4AD2A0] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#1A2A48]/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white">Rohan Das</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">RCCIIT-ECE-2022-088</td>
                <td className="py-3.5 px-4">B.Tech Electronics & Comm.</td>
                <td className="py-3.5 px-4 font-mono text-[#45D7E0] font-semibold">8.45</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[#4AD2A0] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
