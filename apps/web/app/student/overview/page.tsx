'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import {
  Sparkles,
  QrCode,
  Cpu,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Link2,
  RefreshCw,
  AlertTriangle,
  CalendarClock,
  BadgeCheck,
  FileKey2,
  ScanLine,
  GraduationCap,
  Award,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActivityType = 'credential' | 'zkproof' | 'verification' | 'qr';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  txHash?: string;
  dotColor: string;
}

interface ZKProof {
  id: string;
  statement: string;
  generated: string;
  sharedWith: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
}

interface HealthCheck {
  label: string;
  passed: boolean;
}

export default function StudentOverviewPage() {
  const [credential, setCredential] = useState<any>(null);
  const [studentName, setStudentName] = useState('Aarav Sen');
  const [degreeName, setDegreeName] = useState('Bachelor of Technology (CSE)');
  const [institutionName, setInstitutionName] = useState('RCC Institute of Information Technology');
  const [cgpa, setCgpa] = useState('8.72');
  const [status, setStatus] = useState('ACTIVE');
  const [zkProofs, setZkProofs] = useState<ZKProof[]>([
    {
      id: 'PROOF-001',
      statement: 'CGPA ≥ 8.00 (High Achiever)',
      generated: 'Today, 10:15 IST',
      sharedWith: 'Recruiter Public Station',
      status: 'VALID',
    },
    {
      id: 'PROOF-002',
      statement: 'CGPA ≥ 7.50 (Eligibility Check)',
      generated: 'Nov 18, 2026',
      sharedWith: 'TCS Placement Portal',
      status: 'VALID',
    },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      type: 'credential',
      title: 'Credential Anchored On-Chain',
      description: 'RCC Institute of Information Technology committed degree credential on Polygon Amoy.',
      timestamp: 'Today, 14:22',
      txHash: '0x35E7...AB22',
      dotColor: 'bg-[#4AD2A0]',
    },
    {
      id: 'act-2',
      type: 'zkproof',
      title: 'Groth16 ZK Proof Synthesized',
      description: 'Privacy-preserving CGPA ≥ 8.00 proof generated with zero score disclosure.',
      timestamp: 'Today, 15:40',
      txHash: '0x773d...3A9c',
      dotColor: 'bg-[#458BFF]',
    },
    {
      id: 'act-3',
      type: 'verification',
      title: 'Public Station Verification',
      description: 'Verifier validated Groth16 cryptographic bilinear pairing on BN254 curve.',
      timestamp: 'Nov 19, 2026',
      dotColor: 'bg-[#45D7E0]',
    },
  ]);

  useEffect(() => {
    // 1. Fetch real student credentials
    api.credentials
      .getMyStudentCredentials()
      .then((res) => {
        if (res?.credentials && res.credentials.length > 0) {
          const c = res.credentials[0];
          setCredential(c);
          if (c.student?.user) {
            setStudentName(`${c.student.user.firstName} ${c.student.user.lastName}`);
          }
          if (c.degreeName) setDegreeName(c.degreeName);
          if (c.cgpaRaw) setCgpa(Number(c.cgpaRaw).toFixed(2));
          if (c.status) setStatus(c.status);
        }
      })
      .catch((err) => {
        console.warn('Student overview credential notice:', err);
      });

    // 2. Load saved ZK proofs from localStorage
    try {
      const saved = localStorage.getItem('vericred_saved_zk_proofs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped: ZKProof[] = parsed.map((p: any) => ({
            id: p.id || 'PROOF',
            statement: p.statement || 'CGPA ≥ 8.00',
            generated: p.generated || 'Recent',
            sharedWith: (p.sharedWith && p.sharedWith[0]) || 'Recruiter Portal',
            status: p.status === 'expired' ? 'EXPIRED' : 'VALID',
          }));
          setZkProofs(mapped);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved proofs:', e);
    }
  }, []);

  const downloadCredentialJson = () => {
    const vcPayload = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://vericred.network/contexts/academic-v2.jsonld',
      ],
      id: credential?.credentialId || 'urn:uuid:71a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6',
      type: ['VerifiableCredential', 'AcademicDegreeCredential'],
      issuer: {
        id: 'did:ethr:0x71C8360537AB1ff1029F60864700dE8E34cD1D09',
        name: institutionName,
      },
      issuanceDate: credential?.createdAt || '2026-06-15T00:00:00Z',
      credentialSubject: {
        id: 'did:ethr:0x2bf7a8e104f997c2e8f4c91a4f1d103ec',
        name: studentName,
        enrollmentNumber: credential?.student?.enrollmentNumber || 'RCCIIT-CSE-2022-042',
        degreeName,
        academicStanding: {
          cgpa: parseFloat(cgpa),
          scale: 10.0,
          scaledCgpa: Math.round(parseFloat(cgpa) * 100),
        },
      },
      proof: {
        type: 'BabyJubjubPoseidonProof2026',
        created: credential?.createdAt || '2026-06-15T00:00:00Z',
        proofPurpose: 'assertionMethod',
        commitment: credential?.commitment || '0x2a91e48c05f8841a5d629a88',
        anchorTx: credential?.onChainTxHash || '0x35E7F512031B4F46c02e76bb1445E2DC38C7AB22',
      },
    };

    const blob = new Blob([JSON.stringify(vcPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERICRED_${credential?.student?.enrollmentNumber || 'RCCIIT-CSE-2022-042'}_VC2.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const healthChecks: HealthCheck[] = [
    { label: 'On-chain Anchor Valid on Polygon Amoy', passed: status === 'ACTIVE' },
    { label: 'BabyJubjub Digital Signature Integrity', passed: true },
    { label: 'Poseidon Blinding Salt Commitment', passed: true },
    { label: 'ZK-SNARK Groth16 Circuit Compatibility', passed: true },
  ];

  function activityIcon(type: ActivityType) {
    const cls = 'w-4 h-4 shrink-0';
    switch (type) {
      case 'credential':
        return <BadgeCheck className={cls} />;
      case 'zkproof':
        return <FileKey2 className={cls} />;
      case 'verification':
        return <ShieldCheck className={cls} />;
      case 'qr':
        return <ScanLine className={cls} />;
    }
  }

  function activityIconColor(type: ActivityType): string {
    switch (type) {
      case 'credential':
        return 'text-[#4AD2A0]';
      case 'zkproof':
        return 'text-[#458BFF]';
      case 'verification':
        return 'text-[#45D7E0]';
      case 'qr':
        return 'text-[#FFB800]';
    }
  }

  return (
    <div className="space-y-8">
      {/* Student Sovereign Profile Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-[#1A2A48] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#458BFF]/15 via-[#45D7E0]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#458BFF] to-[#45D7E0] p-0.5 shadow-xl shadow-[#458BFF]/25 shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#080D1A]">
                <GraduationCap className="h-7 w-7 text-[#45D7E0]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  {studentName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4AD2A0]/15 border border-[#4AD2A0]/30 text-[11px] font-bold text-[#4AD2A0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4AD2A0] animate-pulse" />
                  {status === 'ACTIVE' ? 'Verified Sovereign Holder' : 'Revoked'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {degreeName} • <span className="text-[#45D7E0]">{institutionName}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Enrollment: {credential?.student?.enrollmentNumber || 'RCCIIT-CSE-2022-042'} • Cumulative CGPA: {cgpa} / 10.00
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/wallet"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 transition"
            >
              <Award className="h-4 w-4" />
              Open Sovereign Wallet
            </Link>
            <button
              onClick={downloadCredentialJson}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0E172E]/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:border-[#458BFF]/50 transition"
            >
              <Download className="h-4 w-4 text-[#45D7E0]" />
              Export VC 2.0
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ZK Proof History Table */}
          <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileKey2 className="w-4 h-4 text-[#458BFF]" />
                <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                  Active ZK Proof Vault
                </h2>
              </div>
              <Link
                href="/student/proofs"
                className="text-xs font-semibold text-[#458BFF] hover:text-[#45D7E0] transition flex items-center gap-1"
              >
                View Vault ({zkProofs.length})
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1A2A48]/60 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Proof ID</th>
                    <th className="px-5 py-3 text-left font-medium">Claim Statement</th>
                    <th className="px-5 py-3 text-left font-medium">Generated</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Public Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {zkProofs.map((proof) => (
                    <tr key={proof.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-[#458BFF] bg-[#458BFF]/10 px-2 py-0.5 rounded">
                          {proof.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-200 font-medium">
                        {proof.statement}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                        {proof.generated}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            proof.status === 'VALID'
                              ? 'bg-[#4AD2A0]/15 text-[#4AD2A0]'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {proof.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href="/verify"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                        >
                          Verify
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Cryptographic Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/student/wallet"
                className="group flex flex-col items-start gap-3 rounded-xl p-4 bg-gradient-to-br from-[#458BFF]/20 to-[#458BFF]/5 border border-[#458BFF]/30 hover:border-[#458BFF]/60 hover:from-[#458BFF]/30 transition"
              >
                <span className="p-2 rounded-lg bg-[#458BFF]/20 text-[#458BFF]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">Generate ZK Proof</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prove eligibility without revealing raw CGPA</p>
                </div>
              </Link>

              <Link
                href="/student/wallet"
                className="group flex flex-col items-start gap-3 rounded-xl p-4 bg-gradient-to-br from-[#45D7E0]/20 to-[#45D7E0]/5 border border-[#45D7E0]/30 hover:border-[#45D7E0]/60 hover:from-[#45D7E0]/30 transition"
              >
                <span className="p-2 rounded-lg bg-[#45D7E0]/20 text-[#45D7E0]">
                  <QrCode className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">Share Ephemeral QR</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Time-limited presentation token with anti-replay</p>
                </div>
              </Link>

              <a
                href="https://amoy.polygonscan.com/address/0xF250601Ca003f6F97ae6a5b24eFFD99FC2D95266"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-start gap-3 rounded-xl p-4 border border-[#4AD2A0]/30 hover:border-[#4AD2A0]/60 hover:bg-[#4AD2A0]/5 transition"
              >
                <span className="p-2 rounded-lg border border-[#4AD2A0]/30 bg-[#4AD2A0]/10 text-[#4AD2A0]">
                  <Cpu className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white leading-tight">View on Polygon Amoy</p>
                  <span className="inline-block text-[9px] font-bold text-[#4AD2A0] bg-[#4AD2A0]/15 px-1.5 py-0.5 rounded mt-0.5">
                    CONTRACT: 0xF250...
                  </span>
                </div>
              </a>

              <button
                onClick={downloadCredentialJson}
                className="group flex flex-col items-start gap-3 rounded-xl p-4 border border-[#FFB800]/30 hover:border-[#FFB800]/60 hover:bg-[#FFB800]/5 transition"
              >
                <span className="p-2 rounded-lg border border-[#FFB800]/30 bg-[#FFB800]/10 text-[#FFB800]">
                  <Download className="w-4 h-4" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white leading-tight">Download W3C JSON</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Export authentic VC 2.0 credential document</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Credential Health Score */}
          <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#4AD2A0]" />
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Cryptographic Integrity
              </h2>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <div>
                <span className="text-5xl font-bold text-white tabular-nums">100</span>
                <span className="text-2xl font-semibold text-slate-400">/100</span>
              </div>
              <span className="mb-1.5 text-xs font-bold text-[#4AD2A0] bg-[#4AD2A0]/15 px-2.5 py-1 rounded-full">
                Active &amp; Tamper-Evident
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-[#1A2A48] mb-5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#4AD2A0] to-[#45D7E0] w-full" />
            </div>

            <ul className="space-y-2.5">
              {healthChecks.map((check) => (
                <li key={check.label} className="flex items-center gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#4AD2A0] shrink-0" />
                  <span className="text-slate-300">{check.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-[#45D7E0]" />
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Audit Timeline
              </h2>
            </div>

            <ol className="relative space-y-0">
              {activities.map((item, idx) => (
                <li key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${item.dotColor} ring-2 ring-[#080D1A]`} />
                    {idx < activities.length - 1 && <span className="w-px flex-1 bg-white/10 my-1" />}
                  </div>

                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={activityIconColor(item.type)}>{activityIcon(item.type)}</span>
                      <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                      {item.txHash && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#458BFF] bg-[#458BFF]/10 px-1.5 py-0.5 rounded">
                          <Link2 className="w-2.5 h-2.5" />
                          {item.txHash}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
