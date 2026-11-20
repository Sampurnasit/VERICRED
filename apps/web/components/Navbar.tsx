'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, CheckCircle2, Award, Building2, UserCircle, QrCode } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isDashboard = pathname.startsWith('/student') || pathname.startsWith('/institution') || pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1A2A48] bg-[#0B1226]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-lg shadow-[#458BFF]/20 group-hover:shadow-[#458BFF]/40 transition-all">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B1226]">
              <ShieldCheck className="h-5 w-5 text-[#45D7E0]" />
            </div>
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              VERI<span className="text-[#45D7E0]">CRED</span>
            </span>
            <span className="ml-2 rounded border border-[#458BFF]/30 bg-[#458BFF]/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[#458BFF]">
              ZK-ED25519
            </span>
          </div>
        </Link>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/verify"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname === '/verify' ? 'text-[#45D7E0]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4 text-[#458BFF]" />
            Verify Credential
          </Link>
          <Link
            href="/student/overview"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname.startsWith('/student') ? 'text-[#45D7E0]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4 text-slate-400" />
            Student Wallet
          </Link>
          <Link
            href="/institution/overview"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname.startsWith('/institution') ? 'text-[#45D7E0]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4 text-slate-400" />
            Issuer Portal
          </Link>
          <Link
            href="/admin/overview"
            className={`flex items-center gap-1.5 transition-colors ${
              pathname.startsWith('/admin') ? 'text-[#45D7E0]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
            Governance
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isDashboard ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-[#4AD2A0] animate-pulse" />
                Network Connected
              </span>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg border border-[#1A2A48] bg-[#141F39] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 transition"
              >
                <UserCircle className="h-3.5 w-3.5 text-[#458BFF]" />
                Switch Account
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
