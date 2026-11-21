'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Award, QrCode, ShieldCheck, EyeOff, History, Wallet, Sparkles } from 'lucide-react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/student/overview', icon: Award },
    { name: 'Credential Wallet', href: '/student/wallet', icon: Wallet },
    { name: 'ZK Proof Vault', href: '/student/proofs', icon: ShieldCheck },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Profile Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-xl shadow-blue-500/20 shrink-0">
            <div className="h-full w-full rounded-[14px] bg-[#080D1A] flex items-center justify-center font-sans text-2xl font-black text-white">
              AS
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">Aarav Sen</h1>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Student
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Enrollment: <span className="font-mono text-cyan-300 font-semibold">VC2026001</span> • Department of Computer Science &amp; Engineering
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              RCC Institute of Information Technology • Class of 2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/student/wallet"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate ZK Proof</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold border-b-2 transition -mb-px ${
                isActive
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
