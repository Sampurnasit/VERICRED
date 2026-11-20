'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Building2,
  UserCircle,
  QrCode,
  Menu,
  X,
  ChevronRight,
  Layers,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = pathname.startsWith('/student') || pathname.startsWith('/institution') || pathname.startsWith('/admin');

  const navLinks = [
    { href: '/verify', label: 'Verify Credential', icon: QrCode },
    { href: '/student/wallet', label: 'Student Wallet', icon: Award },
    { href: '/institution/overview', label: 'Issuer Gateway', icon: Building2 },
    { href: '/admin/overview', label: 'Governance', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#080D1A]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#080D1A]">
              <ShieldCheck className="h-5 w-5 text-cyan-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg font-black tracking-tight text-white">
                VERI<span className="text-cyan-400">CRED</span>
              </span>
              <span className="inline-flex items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                ZK-EdDSA
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
              Decentralized Trust Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/[0.08] bg-slate-900/60 p-1 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Network Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/[0.08] bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] font-medium text-slate-300">Polygon Amoy</span>
          </div>

          {isDashboard ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white transition shadow-sm"
            >
              <UserCircle className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Switch Persona</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/verify"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Verify Now</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-slate-800/80 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#0B1226]/98 px-4 py-4 space-y-2 backdrop-blur-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/[0.08]">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-slate-800 py-2.5 text-xs font-bold text-white"
            >
              <UserCircle className="h-4 w-4 text-cyan-400" />
              Sign In to Demo Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
