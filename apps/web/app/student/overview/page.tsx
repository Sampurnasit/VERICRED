'use client';

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
} from 'lucide-react';
import Link from 'next/link';

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

interface Deadline {
  label: string;
  detail: string;
  urgency: 'warning' | 'info';
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const activityFeed: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'credential',
    title: 'Credential Issued',
    description: 'RCC-IIT issued B.Tech CSE credential on-chain.',
    timestamp: 'Nov 15, 2026',
    txHash: '0x2e8f...91a4',
    dotColor: 'bg-[#4AD2A0]',
  },
  {
    id: 'act-2',
    type: 'zkproof',
    title: 'ZK Proof Generated',
    description: 'Groth16 CGPA ≥ 7.5 proof generated, shared with TCS Hiring Portal.',
    timestamp: 'Nov 18, 2026',
    txHash: '0xa3c1...77f2',
    dotColor: 'bg-[#458BFF]',
  },
  {
    id: 'act-3',
    type: 'verification',
    title: 'Verification Request',
    description: 'Credential verified by Infosys HR — result: VALID.',
    timestamp: 'Nov 19, 2026',
    txHash: '0xd94e...b31c',
    dotColor: 'bg-[#45D7E0]',
  },
  {
    id: 'act-4',
    type: 'qr',
    title: 'QR Shared',
    description: 'Credential QR shared via secure link, expires in 15 min.',
    timestamp: 'Nov 20, 2026',
    dotColor: 'bg-[#FFB800]',
  },
];

const zkProofs: ZKProof[] = [
  {
    id: 'PROOF#001',
    statement: 'CGPA ≥ 7.5',
    generated: 'Nov 18, 2026',
    sharedWith: 'TCS',
    status: 'VALID',
  },
  {
    id: 'PROOF#002',
    statement: 'CGPA ≥ 8.0',
    generated: 'Nov 20, 2026',
    sharedWith: 'Infosys',
    status: 'VALID',
  },
];

const healthChecks: HealthCheck[] = [
  { label: 'On-chain Anchor Valid', passed: true },
  { label: 'Signature Integrity', passed: true },
  { label: 'Revocation Status Clean', passed: true },
  { label: 'ZK Circuit Compatible', passed: true },
];

const deadlines: Deadline[] = [
  {
    label: 'ZK Proof Expiry',
    detail: 'PROOF#002 expires in 3 days',
    urgency: 'warning',
  },
  {
    label: 'Credential Renewal',
    detail: 'Next review: June 2027',
    urgency: 'info',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Section: Activity Feed
// ─────────────────────────────────────────────────────────────────────────────

function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-[#45D7E0]" />
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
          Activity Feed
        </h2>
      </div>

      <ol className="relative space-y-0">
        {activityFeed.map((item, idx) => (
          <li key={item.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${item.dotColor} ring-2 ring-[#080D1A]`} />
              {idx < activityFeed.length - 1 && (
                <span className="w-px flex-1 bg-white/10 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`${activityIconColor(item.type)}`}>
                  {activityIcon(item.type)}
                </span>
                <span className="text-sm font-medium text-white truncate">
                  {item.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-1">
                {item.description}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                {item.txHash && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#458BFF] bg-[#458BFF]/10 px-1.5 py-0.5 rounded">
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Upcoming Deadlines
// ─────────────────────────────────────────────────────────────────────────────

function UpcomingDeadlines() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-4 h-4 text-[#FFB800]" />
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
          Upcoming Deadlines
        </h2>
      </div>

      <div className="space-y-3">
        {deadlines.map((d) => (
          <div
            key={d.label}
            className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
              d.urgency === 'warning'
                ? 'border-[#FFB800]/30 bg-[#FFB800]/5'
                : 'border-white/10 bg-white/5'
            }`}
          >
            {d.urgency === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-[#FFB800] mt-0.5 shrink-0" />
            ) : (
              <CalendarClock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            )}
            <div>
              <p
                className={`text-xs font-semibold ${
                  d.urgency === 'warning' ? 'text-[#FFB800]' : 'text-slate-300'
                }`}
              >
                {d.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{d.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: ZK Proof History Table
// ─────────────────────────────────────────────────────────────────────────────

function ZKProofHistory() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <FileKey2 className="w-4 h-4 text-[#458BFF]" />
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
          ZK Proof History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1A2A48]/60 text-xs text-slate-400 uppercase tracking-wider sticky top-0">
              <th className="px-5 py-3 text-left font-medium">Proof ID</th>
              <th className="px-5 py-3 text-left font-medium">Statement</th>
              <th className="px-5 py-3 text-left font-medium">Generated</th>
              <th className="px-5 py-3 text-left font-medium">Shared With</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {zkProofs.map((proof) => (
              <tr
                key={proof.id}
                className="hover:bg-white/[0.03] transition-colors group"
              >
                <td className="px-5 py-4">
                  <span className="font-mono text-xs text-[#458BFF] bg-[#458BFF]/10 px-2 py-1 rounded">
                    {proof.id}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-200 text-xs">
                  {proof.statement}
                </td>
                <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                  {proof.generated}
                </td>
                <td className="px-5 py-4 text-slate-300 text-xs">
                  {proof.sharedWith}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                      proof.status === 'VALID'
                        ? 'bg-[#4AD2A0]/15 text-[#4AD2A0]'
                        : proof.status === 'EXPIRED'
                        ? 'bg-[#FFB800]/15 text-[#FFB800]'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {proof.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button className="inline-flex items-center gap-1.5 text-xs text-[#458BFF] hover:text-white border border-[#458BFF]/30 hover:border-[#458BFF] hover:bg-[#458BFF]/10 px-3 py-1.5 rounded-lg transition-all duration-200">
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Quick Actions
// ─────────────────────────────────────────────────────────────────────────────

function QuickActions() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
      <h2 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Generate ZK Proof */}
        <Link
          href="/student/wallet"
          className="group flex flex-col items-start gap-3 rounded-xl p-4 bg-gradient-to-br from-[#458BFF]/20 to-[#458BFF]/5 border border-[#458BFF]/30 hover:border-[#458BFF]/60 hover:from-[#458BFF]/30 transition-all duration-200"
        >
          <span className="p-2 rounded-lg bg-[#458BFF]/20 text-[#458BFF] group-hover:bg-[#458BFF]/30 transition-colors">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">
              Generate ZK Proof
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Privacy-preserving</p>
          </div>
        </Link>

        {/* Share Credential QR */}
        <Link
          href="/student/wallet"
          className="group flex flex-col items-start gap-3 rounded-xl p-4 bg-gradient-to-br from-[#45D7E0]/20 to-[#45D7E0]/5 border border-[#45D7E0]/30 hover:border-[#45D7E0]/60 hover:from-[#45D7E0]/30 transition-all duration-200"
        >
          <span className="p-2 rounded-lg bg-[#45D7E0]/20 text-[#45D7E0] group-hover:bg-[#45D7E0]/30 transition-colors">
            <QrCode className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">
              Share Credential QR
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Secure 15-min link</p>
          </div>
        </Link>

        {/* View on Blockchain */}
        <button className="group flex flex-col items-start gap-3 rounded-xl p-4 border border-[#4AD2A0]/30 hover:border-[#4AD2A0]/60 hover:bg-[#4AD2A0]/5 transition-all duration-200">
          <span className="p-2 rounded-lg border border-[#4AD2A0]/30 bg-[#4AD2A0]/10 text-[#4AD2A0] group-hover:bg-[#4AD2A0]/20 transition-colors">
            <Cpu className="w-4 h-4" />
          </span>
          <div className="text-left">
            <p className="text-xs font-semibold text-white leading-tight">
              View on Blockchain
            </p>
            <span className="inline-block text-[9px] font-bold text-[#4AD2A0] bg-[#4AD2A0]/15 px-1.5 py-0.5 rounded mt-0.5">
              POLYGON
            </span>
          </div>
        </button>

        {/* Download Certificate PDF */}
        <button className="group flex flex-col items-start gap-3 rounded-xl p-4 border border-[#FFB800]/30 hover:border-[#FFB800]/60 hover:bg-[#FFB800]/5 transition-all duration-200">
          <span className="p-2 rounded-lg border border-[#FFB800]/30 bg-[#FFB800]/10 text-[#FFB800] group-hover:bg-[#FFB800]/20 transition-colors">
            <Download className="w-4 h-4" />
          </span>
          <div className="text-left">
            <p className="text-xs font-semibold text-white leading-tight">
              Download Certificate
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF export</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: Credential Health Score
// ─────────────────────────────────────────────────────────────────────────────

function CredentialHealthScore() {
  const score = 98;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0E172E]/80 backdrop-blur-md p-5">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck className="w-4 h-4 text-[#4AD2A0]" />
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
          Credential Health Score
        </h2>
      </div>

      {/* Score display */}
      <div className="flex items-end gap-3 mb-4">
        <div>
          <span className="text-5xl font-bold text-white tabular-nums">{score}</span>
          <span className="text-2xl font-semibold text-slate-400">/100</span>
        </div>
        <span className="mb-1.5 text-sm font-semibold text-[#4AD2A0] bg-[#4AD2A0]/15 px-2.5 py-1 rounded-full">
          Excellent
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-[#1A2A48] mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4AD2A0] to-[#45D7E0]"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Health checks */}
      <ul className="space-y-2.5">
        {healthChecks.map((check) => (
          <li key={check.label} className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#4AD2A0] shrink-0" />
            <span className="text-xs text-slate-300">{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentOverviewPage() {
  return (
    <div className="min-h-screen bg-[#080D1A] px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column (2/3 width) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ZKProofHistory />
          <QuickActions />
          <CredentialHealthScore />
        </div>

        {/* ── Right column (1/3 width) ── */}
        <div className="flex flex-col gap-6">
          <ActivityFeed />
          <UpcomingDeadlines />
        </div>

      </div>
    </div>
  );
}
