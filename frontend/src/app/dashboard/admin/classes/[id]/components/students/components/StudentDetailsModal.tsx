'use client';

import React from 'react';
import { X, User, Mail, Calendar, Hash, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Student } from './types';
import PerformanceBadge from './PerformanceBadge';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDetailsModal({ isOpen, onClose, student }: StudentDetailsModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200 z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Profile Section */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-white/5">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.fullName}
              className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 ring-4 ring-slate-200 dark:ring-slate-700/50">
              <User size={40} className="text-slate-400 dark:text-slate-500" />
            </div>
          )}

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
            {student.fullName}
          </h3>
          <p className="text-sm font-bold text-primary mb-3">
            Student Account
          </p>

          <PerformanceBadge performance={student.performance} />
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <Hash size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Student Code</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.studentId}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start col-span-2 sm:col-span-1">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{student.email}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Date of Birth</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Joined Date</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{student.joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Academic Analytics Cards */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 mb-8">
          <div className="text-center p-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{student.attendance}%</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Attendance</div>
          </div>
          <div className="text-center p-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{student.lastScore}%</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Last Score</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex">
          <Link
            href={`/dashboard/admin/students/${student.id}`}
            onClick={onClose}
            className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            <span>View Full Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
