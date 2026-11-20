'use client';

import React from 'react';
import { Search, Plus, Award, CheckCircle2, UserCheck } from 'lucide-react';

export default function InstitutionStudentsPage() {
  const students = [
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
      status: 'Pending Verification',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Student Roster</h2>
          <p className="text-xs text-slate-400">
            Manage student identities and academic credential lifecycles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by roll or name..."
              className="rounded-xl border border-[#1A2A48] bg-[#0B1226] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#458BFF] focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-[#458BFF] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-110 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Enroll Student
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-[#1A2A48] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1A2A48] bg-[#0B1226]/50 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 font-semibold">Student Name</th>
              <th className="py-3.5 px-4 font-semibold">Enrollment Number</th>
              <th className="py-3.5 px-4 font-semibold">Department</th>
              <th className="py-3.5 px-4 font-semibold">Batch</th>
              <th className="py-3.5 px-4 font-semibold">CGPA</th>
              <th className="py-3.5 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A2A48]/50 text-slate-300">
            {students.map((student) => (
              <tr key={student.enrollment} className="hover:bg-[#1A2A48]/30 transition">
                <td className="py-3.5 px-4 font-semibold text-white">{student.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{student.enrollment}</td>
                <td className="py-3.5 px-4">{student.department}</td>
                <td className="py-3.5 px-4">{student.batch}</td>
                <td className="py-3.5 px-4 font-mono text-[#45D7E0] font-semibold">{student.cgpa}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      student.status === 'Credential Issued' ? 'text-[#4AD2A0]' : 'text-[#FFB800]'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
