'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Building2, CheckCircle2, History, AlertTriangle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Consortium Overview', href: '/admin/overview', icon: ShieldCheck },
    { name: 'Institution Approvals', href: '/admin/institutions', icon: Building2 },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Governance Banner */}
      <div className="rounded-2xl border border-[#1A2A48] bg-gradient-to-r from-[#141F39] to-[#0E172E] p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-lg shadow-[#458BFF]/20">
            <div className="h-full w-full rounded-[14px] bg-[#0B1226] flex items-center justify-center font-display text-xl font-bold text-white">
              <ShieldCheck className="h-7 w-7 text-[#45D7E0]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Consortium Governance</h1>
              <span className="rounded-full bg-[#458BFF]/10 border border-[#458BFF]/30 px-2 py-0.5 text-[11px] font-semibold text-[#458BFF]">
                Platform Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-Signature Authority • Ethereum Smart Contract Registry Admin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-1.5 text-xs font-mono text-slate-300">
            Smart Contract: 0x5FbDB...aa
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1A2A48] mb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                isActive
                  ? 'border-[#458BFF] text-[#45D7E0]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
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
