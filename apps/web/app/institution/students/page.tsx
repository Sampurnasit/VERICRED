'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Award,
  CheckCircle2,
  UserCheck,
  Filter,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Clock,
  MoreVertical,
  X,
} from 'lucide-react';

export default function InstitutionStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // New student form state
  const [newStudent, setNewStudent] = useState({
    name: '',
    enrollment: '',
    department: 'Computer Science & Engineering',
    batch: '2023-2027',
    cgpa: '8.50',
  });

  const [students, setStudents] = useState([
    {
      name: 'Aarav Sen',
      enrollment: 'RCCIIT-CSE-2022-042',
      department: 'Computer Science & Engineering',
      batch: '2022-2026',
      cgpa: '8.72',
      status: 'Credential Issued',
    },
    {
      name: 'Diya Roy',
      enrollment: 'RCCIIT-IT-2022-019',
      department: 'Information Technology',
      batch: '2022-2026',
      cgpa: '9.10',
      status: 'Credential Issued',
    },
    {
      name: 'Rohan Das',
      enrollment: 'RCCIIT-ECE-2022-088',
      department: 'Electronics & Communication',
      batch: '2022-2026',
      cgpa: '8.45',
      status: 'Credential Issued',
    },
    {
      name: 'Priya Mukherjee',
      enrollment: 'RCCIIT-CSE-2023-015',
      department: 'Computer Science & Engineering',
      batch: '2023-2027',
      cgpa: '8.90',
      status: 'Pending Issuance',
    },
    {
      name: 'Aniket Sharma',
      enrollment: 'RCCIIT-IT-2023-054',
      department: 'Information Technology',
      batch: '2023-2027',
      cgpa: '8.20',
      status: 'Pending Issuance',
    },
  ]);

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.enrollment) return;

    setStudents((prev) => [
      {
        ...newStudent,
        status: 'Pending Issuance',
      },
      ...prev,
    ]);
    setShowEnrollModal(false);
    setNewStudent({
      name: '',
      enrollment: '',
      department: 'Computer Science & Engineering',
      batch: '2023-2027',
      cgpa: '8.50',
    });
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.enrollment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.department.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">Student Identity Roster</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage enrolled students, link institutional identities, and trigger cryptographic credential issuance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowEnrollModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#458BFF] to-[#3B82F6] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 hover:brightness-110 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          Enroll New Student
        </button>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 border border-[#1A2A48] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Enrolled</span>
            <p className="text-xl font-bold font-display text-white mt-1">{students.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#458BFF]/10 text-[#458BFF]">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-[#1A2A48] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Credentials</span>
            <p className="text-xl font-bold font-display text-[#4AD2A0] mt-1">
              {students.filter((s) => s.status === 'Credential Issued').length}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#4AD2A0]/10 text-[#4AD2A0]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-[#1A2A48] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Awaiting Issuance</span>
            <p className="text-xl font-bold font-display text-[#FFB800] mt-1">
              {students.filter((s) => s.status !== 'Credential Issued').length}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FFB800]/10 text-[#FFB800]">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="glass-card rounded-2xl border border-[#1A2A48] overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#1A2A48] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'Computer Science', 'Information Technology', 'Electronics'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedDept === dept
                    ? 'bg-[#458BFF] text-white shadow-md'
                    : 'bg-[#0B1226] text-slate-400 hover:text-white border border-[#1A2A48]'
                }`}
              >
                {dept === 'ALL' ? 'All Departments' : dept}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by roll number or name..."
              className="w-full sm:w-64 rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A2A48] bg-[#0E172E]/60 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6 font-semibold">Student Identity</th>
                <th className="py-3.5 px-6 font-semibold">Enrollment ID</th>
                <th className="py-3.5 px-6 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold">Batch</th>
                <th className="py-3.5 px-4 font-semibold">CGPA</th>
                <th className="py-3.5 px-6 font-semibold">Credential Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
              {filteredStudents.map((student) => (
                <tr key={student.enrollment} className="hover:bg-[#1A2A48]/30 transition group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#458BFF]/20 to-[#45D7E0]/20 border border-[#458BFF]/30 flex items-center justify-center font-bold text-white text-xs">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-white group-hover:text-[#45D7E0] transition">
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">{student.enrollment}</td>
                  <td className="py-4 px-6 text-slate-300">{student.department}</td>
                  <td className="py-4 px-4 text-slate-400">{student.batch}</td>
                  <td className="py-4 px-4 font-mono">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#45D7E0]/10 text-[#45D7E0] font-bold">
                      {student.cgpa}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        student.status === 'Credential Issued'
                          ? 'bg-[#4AD2A0]/10 border-[#4AD2A0]/30 text-[#4AD2A0]'
                          : 'bg-[#FFB800]/10 border-[#FFB800]/30 text-[#FFB800]'
                      }`}
                    >
                      {student.status === 'Credential Issued' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {student.status === 'Credential Issued' ? (
                      <Link
                        href="/institution/issue"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#458BFF] hover:text-[#45D7E0] transition"
                      >
                        Re-Issue / Update
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <Link
                        href="/institution/issue"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#458BFF] px-2.5 py-1 text-[11px] font-semibold text-white hover:brightness-110 transition shadow-sm"
                      >
                        Issue Credential
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#1A2A48] bg-[#0E172E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A2A48]">
              <h3 className="text-base font-bold text-white font-display">Enroll New Student</h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEnroll} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourav Mukherjee"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-white focus:border-[#458BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RCCIIT-CSE-2023-099"
                  value={newStudent.enrollment}
                  onChange={(e) => setNewStudent({ ...newStudent, enrollment: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 font-mono text-white focus:border-[#458BFF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Batch Session
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.batch}
                    onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 text-white focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={newStudent.cgpa}
                    onChange={(e) => setNewStudent({ ...newStudent, cgpa: e.target.value })}
                    className="w-full rounded-xl border border-[#1A2A48] bg-[#0B1226] px-3.5 py-2 font-mono text-white focus:border-[#458BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#458BFF] text-white font-semibold hover:brightness-110 transition shadow-md"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
