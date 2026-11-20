'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserPlus, Mail, Lock, Building, GraduationCap, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION'>('STUDENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/login');
    }, 400);
  };

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-xl shadow-[#458BFF]/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0B1226]">
              <UserPlus className="h-6 w-6 text-[#45D7E0]" />
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white font-display">
            Create your VERICRED Account
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Join the cryptographically verified academic trust network
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl bg-[#0B1226] p-1 border border-[#1A2A48]">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition ${
                role === 'STUDENT'
                  ? 'bg-[#458BFF] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student Account
            </button>
            <button
              type="button"
              onClick={() => setRole('INSTITUTION')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition ${
                role === 'INSTITUTION'
                  ? 'bg-[#458BFF] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="h-4 w-4" />
              Academic Institution
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aarav"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none focus:ring-1 focus:ring-[#458BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sen"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none focus:ring-1 focus:ring-[#458BFF]"
                />
              </div>
            </div>

            {role === 'INSTITUTION' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Institution Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. RCC Institute of Information Technology"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none focus:ring-1 focus:ring-[#458BFF]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'student@university.edu' : 'registrar@university.edu'}
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none focus:ring-1 focus:ring-[#458BFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={8}
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
                'Creating Account...'
              ) : (
                <>
                  Register as {role === 'STUDENT' ? 'Student' : 'Accredited Institution'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#45D7E0] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
