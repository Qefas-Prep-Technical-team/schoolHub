'use client';

import React from 'react';
import { X, BookOpen, Mail, User, ShieldCheck, Hash, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Subject } from './types';
import ProgressBar from './ProgressBar';

interface SubjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export default function SubjectDetailsModal({ isOpen, onClose, subject }: SubjectDetailsModalProps) {
  if (!isOpen || !subject) return null;

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
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Profile Section */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-white/5">
          {subject.icon ? (
            <img
              src={subject.icon}
              alt={subject.name}
              className="w-24 h-24 rounded-2xl object-cover mb-4 ring-4 ring-primary/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mb-4 ring-4 ring-primary/5">
              <BookOpen size={40} className="text-primary" />
            </div>
          )}

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight uppercase">
            {subject.name}
          </h3>
          <p className="text-sm font-bold text-primary mb-3">
            Course Node
          </p>
        </div>

        {/* Subject Details Grid */}
        <div className="grid grid-cols-2 gap-6 my-6">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <Hash size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Course Code</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">{subject.code}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start col-span-2 sm:col-span-1">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assigned Teacher</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{subject.teacherName}</p>
            </div>
          </div>

          {subject.description && (
            <div className="flex gap-3 items-start col-span-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex-shrink-0">
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-350 mt-1 leading-relaxed">
                  {subject.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Performance & Activities Block */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 mb-8">
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              <span>Class Performance</span>
              <span className="text-slate-700 dark:text-slate-350">{subject.classPerformance}%</span>
            </div>
            <ProgressBar value={subject.classPerformance} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{subject.assignments}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignments</div>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-800">
              <div className="text-2xl font-black text-slate-900 dark:text-white">{subject.exams}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Papers</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex">
          <Link
            href={`/dashboard/admin/subjects/${subject.id}`}
            onClick={onClose}
            className="w-full h-12 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            <span>View Full Subject Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
