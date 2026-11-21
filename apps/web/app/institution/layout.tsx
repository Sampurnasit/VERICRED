'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, FileSignature, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const legalName = user?.institution?.legalName || 'RCC Institute of Information Technology';
  const shortCode = user?.institution?.shortCode || 'RCCIIT';
  const initials = shortCode.slice(0, 2).toUpperCase();
  const isApproved = user?.institution?.status === 'APPROVED';
  const statusLabel = isApproved ? 'Accredited Issuer' : (user?.institution?.status || 'Accredited Issuer');

  const contractAddress = process.env.NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS;
  const contractDisplay = contractAddress
    ? `${contractAddress.slice(0, 7)}...${contractAddress.slice(-4)}`
    : '0xF250...5266';

  const navItems = [
    { name: 'Dashboard', href: '/institution/overview', icon: Building2 },
    { name: 'Issue Credential', href: '/institution/issue', icon: FileSignature },
    { name: 'Students', href: '/institution/students', icon: Users },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Institution Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-xl shadow-blue-500/20 shrink-0">
            <div className="h-full w-full rounded-[14px] bg-[#080D1A] flex items-center justify-center font-sans text-2xl font-black text-white">
              {initials}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {legalName}
              </h1>
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                  isApproved
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                {isApproved ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                )}
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Code: <span className="font-mono text-cyan-300 font-semibold">{shortCode}</span>
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              On-Chain DID: did:vericred:institution:{shortCode.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="rounded-xl border border-white/[0.1] bg-slate-950/80 px-4 py-2 text-xs font-mono text-slate-300">
            Smart Contract: {contractDisplay}
          </div>
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
