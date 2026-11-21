'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Building2, ClipboardList, Pause, Plus } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/admin/overview', icon: Layers },
    { name: 'Institution Registry', href: '/admin/institutions', icon: Building2 },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Admin Profile Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0E172E] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">

        {/* Animated background glows */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#458BFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[#45D7E0]/8 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          {/* Left — Avatar + Identity */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-tr from-[#458BFF] via-[#45D7E0] to-[#4AD2A0] p-[1.5px] shadow-lg shadow-[#458BFF]/25">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#080D1A]">
                <span className="bg-gradient-to-br from-[#45D7E0] to-[#458BFF] bg-clip-text text-xl font-black text-transparent select-none">
                  CG
                </span>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Consortium Administrator
                </h1>
                <span className="rounded-full border border-[#458BFF]/30 bg-[#458BFF]/10 px-3 py-0.5 text-xs font-bold text-[#458BFF]">
                  ADMIN
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Multi-Sig Governance Authority
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-[#4AD2A0]">3/4 Signatures Active</span>
              </p>
            </div>
          </div>

          {/* Right — Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 transition hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-300 active:scale-95">
              <Pause className="h-3.5 w-3.5" />
              Emergency Pause
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#45D7E0] px-4 py-2 text-xs font-bold text-[#080D1A] shadow-lg shadow-[#458BFF]/25 transition hover:opacity-90 active:scale-95">
              <Plus className="h-3.5 w-3.5" />
              New Governance Proposal
            </button>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex gap-1 border-b border-white/[0.07]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 pb-3.5 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'border-[#45D7E0] text-[#45D7E0]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
