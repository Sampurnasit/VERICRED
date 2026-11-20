'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCircle, Building2, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('student@rcciit.org');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (demoRole: 'STUDENT' | 'INSTITUTION' | 'ADMIN') => {
    setRole(demoRole);
    if (demoRole === 'STUDENT') {
      setEmail('student@rcciit.org');
      setPassword('Password123!');
    } else if (demoRole === 'INSTITUTION') {
      setEmail('admin@rcciit.org');
      setPassword('Password123!');
    } else {
      setEmail('admin@vericred.network');
      setPassword('Password123!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Direct routing for Phase 2 UI shell navigation
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'STUDENT') {
        router.push('/student/overview');
      } else if (role === 'INSTITUTION') {
        router.push('/institution/overview');
      } else {
        router.push('/admin/overview');
      }
    }, 400);
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Card Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-xl shadow-[#458BFF]/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0B1226]">
              <Lock className="h-6 w-6 text-[#45D7E0]" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white font-display">
            Sign in to VERICRED
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Select your role to access your credentials or institution console
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6 rounded-xl bg-[#0B1226] p-1 border border-[#1A2A48]">
            <button
              type="button"
              onClick={() => fillDemo('STUDENT')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                role === 'STUDENT'
                  ? 'bg-[#458BFF] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCircle className="h-3.5 w-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('INSTITUTION')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                role === 'INSTITUTION'
                  ? 'bg-[#458BFF] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Institution
            </button>
            <button
              type="button"
              onClick={() => fillDemo('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                role === 'ADMIN'
                  ? 'bg-[#458BFF] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none focus:ring-1 focus:ring-[#458BFF]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 hover:text-slate-400 cursor-pointer">
                  Argon2id Hash Protected
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none focus:ring-1 focus:ring-[#458BFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition disabled:opacity-50"
            >
              {isLoading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  Enter {role === 'STUDENT' ? 'Student Wallet' : role === 'INSTITUTION' ? 'Institution Console' : 'Consortium Console'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Persona Pills */}
          <div className="mt-6 pt-5 border-t border-[#1A2A48]">
            <p className="text-[11px] text-slate-400 font-medium mb-2">One-Click Test Accounts:</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo('STUDENT')}
                className="text-[11px] rounded bg-[#0B1226] px-2 py-1 text-slate-300 border border-[#1A2A48] hover:border-[#458BFF]"
              >
                Aarav Sen (Student)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('INSTITUTION')}
                className="text-[11px] rounded bg-[#0B1226] px-2 py-1 text-slate-300 border border-[#1A2A48] hover:border-[#458BFF]"
              >
                Dr. Rostova (RCC-IIT)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('ADMIN')}
                className="text-[11px] rounded bg-[#0B1226] px-2 py-1 text-slate-300 border border-[#1A2A48] hover:border-[#458BFF]"
              >
                Platform Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Need a new account?{' '}
          <Link href="/register" className="font-semibold text-[#45D7E0] hover:underline">
            Register institution or student
          </Link>
        </p>
      </div>
    </div>
  );
}
