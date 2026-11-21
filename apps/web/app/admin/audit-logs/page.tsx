'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import {
  ClipboardList,
  Shield,
  Building2,
  Award,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.admin.getAuditLogs();
      setLogs(res?.auditLogs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const ACTION_COLORS: Record<string, string> = {
    INSTITUTION_APPROVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    INSTITUTION_REJECTED: 'text-red-400 bg-red-500/10 border-red-500/30',
    INSTITUTION_SUSPENDED: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    CREDENTIAL_REVOKED: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    CREDENTIAL_ISSUED: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  };

  const ACTION_ICONS: Record<string, React.ReactNode> = {
    INSTITUTION_APPROVED: <CheckCircle2 className="h-4 w-4" />,
    INSTITUTION_REJECTED: <XCircle className="h-4 w-4" />,
    INSTITUTION_SUSPENDED: <AlertCircle className="h-4 w-4" />,
    CREDENTIAL_REVOKED: <Award className="h-4 w-4" />,
    CREDENTIAL_ISSUED: <Award className="h-4 w-4" />,
  };

  const filterOptions = [
    'ALL',
    'INSTITUTION_APPROVED',
    'INSTITUTION_REJECTED',
    'INSTITUTION_SUSPENDED',
    'CREDENTIAL_REVOKED',
  ];

  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.action === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-[#1A2A48]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-3">
              <ClipboardList className="h-7 w-7 text-[#45D7E0]" />
              Platform Audit Log
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Immutable ledger of all governance approvals, institutional lifecycle changes, and credential revocations.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1A2A48] bg-[#0B1226] text-xs font-semibold text-slate-200 hover:text-white hover:border-[#458BFF]/50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition ${
              filter === opt
                ? 'bg-[#458BFF]/20 border-[#458BFF]/50 text-[#45D7E0]'
                : 'border-[#1A2A48] bg-[#0B1226] text-slate-400 hover:text-white'
            }`}
          >
            {opt.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: logs.length, color: 'text-white' },
          {
            label: 'Approvals',
            value: logs.filter((l) => l.action === 'INSTITUTION_APPROVED').length,
            color: 'text-emerald-400',
          },
          {
            label: 'Revocations',
            value: logs.filter((l) => l.action === 'CREDENTIAL_REVOKED').length,
            color: 'text-orange-400',
          },
          {
            label: 'Suspensions',
            value: logs.filter((l) => l.action === 'INSTITUTION_SUSPENDED').length,
            color: 'text-yellow-400',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#1A2A48] bg-[#0B1226] p-4">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Log List */}
      <div className="glass-card rounded-2xl border border-[#1A2A48] overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-300 font-semibold">{error}</p>
            <button onClick={fetchLogs} className="mt-3 text-xs text-[#45D7E0] hover:underline">
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 text-[#458BFF] animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading audit events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              No audit events found{filter !== 'ALL' ? ` for filter "${filter}"` : ''}.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((log) => {
              const colorClass =
                ACTION_COLORS[log.action] || 'text-slate-400 bg-slate-500/10 border-slate-500/30';
              const icon = ACTION_ICONS[log.action] || <ClipboardList className="h-4 w-4" />;
              return (
                <div key={log.id} className="p-4 hover:bg-white/[0.02] transition flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${colorClass}`}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${colorClass}`}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {log.entityType} · {log.entityId?.slice(0, 12)}…
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Actor:{' '}
                      <span className="text-white font-semibold">
                        {log.actor?.email || log.actorId}
                      </span>
                      {log.actor?.role && <span className="text-slate-500"> [{log.actor.role}]</span>}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                    {log.ipAddress && (
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">{log.ipAddress}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
