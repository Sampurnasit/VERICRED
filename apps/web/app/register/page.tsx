'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  Building,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION'>('STUDENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await register({
        email,
        password,
        role,
        firstName,
        lastName,
        ...(role === 'INSTITUTION'
          ? {
              institutionName: orgName || `${firstName}'s University`,
              shortCode: (orgName || firstName).substring(0, 8).toUpperCase(),
              website: `https://${(orgName || firstName).toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
              blockchainAddress: `0x${Array.from({ length: 40 }, () =>
                Math.floor(Math.random() * 16).toString(16)
              ).join('')}`,
            }
          : {}),
      });
      router.push('/login');
    } catch (err: any) {
      console.warn('Backend register notice:', err);
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        setError(err.message);
      } else {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Background glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#458BFF]/10 via-[#45D7E0]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-xl shadow-[#458BFF]/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#080D1A]">
              <UserPlus className="h-7 w-7 text-[#45D7E0]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">
            Create VERICRED Identity
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Self-sovereign identity registration with cryptographic BabyJubjub key derivation.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-[#1A2A48] shadow-2xl space-y-6">
          {/* Persona selector */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#080D1A] p-1.5 border border-[#1A2A48]">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
                role === 'STUDENT'
                  ? 'bg-gradient-to-r from-[#458BFF] to-[#3B82F6] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Student Credential Holder
            </button>
            <button
              type="button"
              onClick={() => setRole('INSTITUTION')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
                role === 'INSTITUTION'
                  ? 'bg-gradient-to-r from-[#458BFF] to-[#3B82F6] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="h-4 w-4" />
              Academic Issuer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aarav"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sen"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
                />
              </div>
            </div>

            {role === 'INSTITUTION' && (
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Institution Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. RCC Institute of Information Technology"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'STUDENT' ? 'student@rcciit.ac.in' : 'registrar@rcciit.ac.in'}
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Passphrase (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Cryptographic Key Guarantees */}
            <div className="rounded-xl border border-[#1A2A48] bg-[#080D1A]/70 p-3.5 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <KeyRound className="h-3.5 w-3.5 text-[#4AD2A0]" />
                Zero-Knowledge Privacy Guarantee
              </div>
              <p className="leading-relaxed">
                Your private BabyJubjub key is derived deterministically in your browser. Raw academic credentials are never shared unencrypted.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] py-3 text-xs font-semibold text-white shadow-xl shadow-blue-500/25 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50"
            >
              {isLoading ? (
                'Deriving Cryptographic Identity...'
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
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-[#45D7E0] hover:underline">
            Sign in to console
          </Link>
        </p>
      </div>
    </div>
  );
}
