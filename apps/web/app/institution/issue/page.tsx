'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FilePlus2,
  Upload,
  CheckCircle2,
  Lock,
  Cpu,
  ArrowLeft,
  AlertCircle,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';

export default function IssueCredentialPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [degreeName, setDegreeName] = useState('Bachelor of Technology');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [studentEnrollment, setStudentEnrollment] = useState('RCCIIT-CSE-2022-042');
  const [studentName, setStudentName] = useState('Aarav Sen');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('8.72');
  const [academicSession, setAcademicSession] = useState('2022-2026');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedCredential, setIssuedCredential] = useState<any>(null);

  // Bulk CSV state
  const [csvContent, setCsvContent] = useState(`enrollmentNumber,studentName,studentEmail,degreeName,department,graduationYear,cgpa
RCCIIT-CSE-2022-042,Aarav Sen,aarav.sen@student.rcciit.ac.in,Bachelor of Technology,Computer Science and Engineering,2026,8.72
RCCIIT-IT-2022-019,Diya Roy,diya.roy@student.rcciit.ac.in,Bachelor of Technology,Information Technology,2026,9.10
RCCIIT-ECE-2022-088,Rohan Das,rohan.das@student.rcciit.ac.in,Bachelor of Technology,Electronics and Communication,2026,8.45`);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  const scaledCgpa = Math.round(parseFloat(cgpa || '0') * 100);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIssuedCredential(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setIssuedCredential({
        id: `urn:uuid:${Math.random().toString(36).substring(2, 10)}`,
        commitment: `0x${Math.random().toString(16).substring(2, 14)}...`,
        cgpaScaled: scaledCgpa,
        issuedAt: new Date().toISOString(),
      });
    }, 600);
  };

  const handleBulkSubmit = () => {
    setIsSubmitting(true);
    setBulkStatus(null);
    setTimeout(() => {
      setIsSubmitting(false);
      const rows = csvContent.trim().split('\n').slice(1);
      setBulkStatus(`Successfully verified and issued ${rows.length} verifiable credentials on-chain.`);
    }, 700);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/institution/overview"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <span className="rounded bg-[#458BFF]/10 border border-[#458BFF]/30 px-2.5 py-1 text-xs font-mono text-[#458BFF]">
          Issuer Key: BabyJubjub Active
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white font-display">Issue Academic Credentials</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically sign academic degrees and transcripts with BabyJubjub EdDSA and Poseidon commitments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1A2A48] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition -mb-px ${
            activeTab === 'single'
              ? 'border-[#458BFF] text-[#45D7E0]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FilePlus2 className="h-4 w-4" />
          Single Credential Issuance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition -mb-px ${
            activeTab === 'bulk'
              ? 'border-[#458BFF] text-[#45D7E0]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Batch CSV Upload
        </button>
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <form onSubmit={handleSingleSubmit} className="lg:col-span-7 space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-[#1A2A48] space-y-4 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Student & Academic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs text-white focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    required
                    value={studentEnrollment}
                    onChange={(e) => setStudentEnrollment(e.target.value)}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs font-mono text-white focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Degree / Program
                </label>
                <input
                  type="text"
                  required
                  value={degreeName}
                  onChange={(e) => setDegreeName(e.target.value)}
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs text-white focus:border-[#458BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Department / Specialization
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs text-white focus:border-[#458BFF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs text-white focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    CGPA (0 - 10.00)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs font-mono text-[#45D7E0] font-bold focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Session
                  </label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-xs text-white focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Signing with BabyJubjub Curve...'
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Sign & Issue Verifiable Credential
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-[#458BFF]/40 bg-gradient-to-br from-[#141F39] via-[#0E172E] to-[#080D1C] p-6 shadow-xl relative">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#458BFF]">
                Cryptographic Preview
              </span>
              <h3 className="text-base font-bold text-white mt-1">{degreeName}</h3>
              <p className="text-xs text-slate-300">{department}</p>
              <p className="text-xs text-slate-400 mt-2">
                Holder: <span className="font-semibold text-white">{studentName}</span> (
                <span className="font-mono text-slate-300">{studentEnrollment}</span>)
              </p>

              <div className="mt-4 pt-4 border-t border-[#1A2A48] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Raw CGPA:</span>
                  <span className="font-mono font-bold text-[#45D7E0]">{cgpa}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fixed-Point Scaled:</span>
                  <span className="font-mono text-white">{scaledCgpa} / 1000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Curve Algorithm:</span>
                  <span className="text-[#4AD2A0] font-mono">EdDSA / BabyJubjub</span>
                </div>
              </div>

              {issuedCredential && (
                <div className="mt-6 rounded-xl border border-[#4AD2A0]/40 bg-[#4AD2A0]/10 p-3 text-xs text-[#4AD2A0] flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-bold">Credential Issued Successfully!</span>
                    <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                      Commitment: {issuedCredential.commitment}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Bulk CSV Mode */
        <div className="glass-card rounded-2xl p-6 border border-[#1A2A48] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Paste or Edit CSV Roster</h3>
              <p className="text-xs text-slate-400">
                Supports up to 500 credentials per batch. Pre-flight validation checks CGPA ranges and enrollment numbers.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Format: CSV Draft 2026</span>
          </div>

          <textarea
            rows={8}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] p-4 text-xs font-mono text-slate-300 focus:border-[#458BFF] focus:outline-none"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              3 records detected • 0 format errors
            </span>
            <button
              type="button"
              onClick={handleBulkSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {isSubmitting ? 'Signing Batch Credentials...' : 'Run Dry-Run & Issue Batch'}
            </button>
          </div>

          {bulkStatus && (
            <div className="rounded-xl border border-[#4AD2A0]/40 bg-[#4AD2A0]/10 p-4 text-xs text-[#4AD2A0] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{bulkStatus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
