'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, FilePlus2, Key, CheckCircle } from 'lucide-react';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard Overview', href: '/institution/overview', icon: Building2 },
    { name: 'Enrolled Students', href: '/institution/students', icon: Users },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Institution Banner */}
      <div className="rounded-2xl border border-[#1A2A48] bg-gradient-to-r from-[#141F39] to-[#0E172E] p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-lg shadow-[#458BFF]/20">
            <div className="h-full w-full rounded-[14px] bg-[#0B1226] flex items-center justify-center font-display text-xl font-bold text-white">
              RC
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                RCC Institute of Information Technology
              </h1>
              <span className="rounded-full bg-[#4AD2A0]/10 border border-[#4AD2A0]/30 px-2 py-0.5 text-[11px] font-semibold text-[#4AD2A0] flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Accredited Issuer
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Code: <span className="font-mono text-slate-300">RCCIIT</span> • Dean / Registrar: Dr. Elena Rostova
            </p>
            <p className="text-xs text-slate-400 font-mono">
              On-Chain DID: did:ethr:0x71C8360537AB1ff1029F60864700dE8E34cD1D09
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/institution/issue"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition"
          >
            <FilePlus2 className="h-4 w-4" />
            Issue Credential
          </Link>
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
