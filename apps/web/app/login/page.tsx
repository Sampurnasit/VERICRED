'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCircle,
  Building2,
  ShieldAlert,
  Sparkles,
  KeyRound,
  GraduationCap,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('aarav.sen@student.rcciit.ac.in');
  const [password, setPassword] = useState('StudentPass123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDemo = (demoRole: 'STUDENT' | 'INSTITUTION' | 'ADMIN') => {
    setRole(demoRole);
    if (demoRole === 'STUDENT') {
      setEmail('aarav.sen@student.rcciit.ac.in');
      setPassword('StudentPass123!');
    } else if (demoRole === 'INSTITUTION') {
      setEmail('dean.academic@rcciit.ac.in');
      setPassword('InstitutePass123!');
    } else {
      setEmail('admin@vericred.net');
      setPassword('AdminPass123!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      if (role === 'STUDENT') {
        router.push('/student/wallet');
      } else if (role === 'INSTITUTION') {
        router.push('/institution/overview');
      } else {
        router.push('/admin/overview');
      }
    }, 450);
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-[1.5px] shadow-xl shadow-blue-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#080D1A]">
              <Lock className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Sign In to VERICRED
          </h2>
          <p className="text-xs text-slate-400">
            Authenticate to access your sovereign wallet or academic gateway
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-3xl border border-white/[0.1] bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Quick Select Persona Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Demo Persona
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-950/70 p-1 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => fillDemo('STUDENT')}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${role === 'STUDENT'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('INSTITUTION')}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${role === 'INSTITUTION'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Issuer</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('ADMIN')}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg transition-all ${role === 'ADMIN'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rcciit.ac.in"
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[10px] font-mono text-cyan-400">
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
                  className="w-full rounded-xl border border-white/[0.1] bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition disabled:opacity-60"
            >
              {isLoading ? (
                <span>Verifying Cryptographic Credentials...</span>
              ) : (
                <>
                  <span>Sign In as {role === 'STUDENT' ? 'Student' : role === 'INSTITUTION' ? 'Issuer Officer' : 'Consortium Admin'}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Persona Info Pill */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-950/40 p-3 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Selected Account:</span>
              <span className="font-semibold text-slate-200">
                {role === 'STUDENT' && 'Aarav Sen (B.Tech CSE)'}
                {role === 'INSTITUTION' && 'Dr. Elena Rostova (Dean)'}
                {role === 'ADMIN' && 'System Governance Root'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Target Route:</span>
              <span className="font-mono text-cyan-400">
                {role === 'STUDENT' && '/student/wallet'}
                {role === 'INSTITUTION' && '/institution/overview'}
                {role === 'ADMIN' && '/admin/overview'}
              </span>
            </div>
          </div>
        </div>

        {/* Public Verifier link */}
        <div className="text-center">
          <Link
            href="/verify"
            className="text-xs text-slate-400 hover:text-cyan-400 transition inline-flex items-center gap-1.5"
          >
            <span>Third-party employer or evaluator?</span>
            <span className="font-semibold text-cyan-400 underline">Open Public Verification Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
