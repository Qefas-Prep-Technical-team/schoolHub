'use client';

import React from 'react';
import { X, Mail, Phone, User, Hash, ShieldCheck, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  teacherCode?: string;
}

interface TeacherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  isLead: boolean;
}

export default function TeacherDetailsModal({ isOpen, onClose, teacher, isLead }: TeacherDetailsModalProps) {
  if (!isOpen || !teacher) return null;

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
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-300">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-500/20 mb-4">
            {teacher.name.charAt(0)}
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight uppercase">
            {teacher.name}
          </h3>
          
          <div className="flex gap-2 items-center mt-2">
            <span className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-widest">
              Educator
            </span>
            {isLead && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50 text-[10px] font-bold uppercase tracking-wider">
                <BadgeCheck size={12} />
                Lead
              </span>
            )}
          </div>
        </div>

        {/* Teacher Details Grid */}
        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="flex gap-3 items-start col-span-2 sm:col-span-1">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <Hash size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Teacher Code</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">
                {teacher.teacherCode || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start col-span-2">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {teacher.email}
              </p>
            </div>
          </div>

          {teacher.phoneNumber && (
            <div className="flex gap-3 items-start col-span-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {teacher.phoneNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex pt-4">
          <Link
            href={`/dashboard/admin/teachers/${teacher.id}`}
            onClick={onClose}
            className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            <span>View Full Teacher Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
