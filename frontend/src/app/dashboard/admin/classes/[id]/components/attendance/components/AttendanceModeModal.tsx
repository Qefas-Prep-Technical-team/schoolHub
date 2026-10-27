'use client';

import React, { useState, useEffect } from 'react';
import { X, List, Layers, School, BookOpen, ChevronDown, Check } from 'lucide-react';
import { ClassSubjectItem } from './types';

interface AttendanceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classSubjects?: ClassSubjectItem[];
  initialSubjectId?: string;
  onSelectList: (subjectId: string) => void;
  onSelectSwipe: (subjectId: string) => void;
}

const AttendanceModeModal: React.FC<AttendanceModeModalProps> = ({
  isOpen,
  onClose,
  classSubjects = [],
  initialSubjectId = 'daily',
  onSelectList,
  onSelectSwipe,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [attendanceType, setAttendanceType] = useState<'daily' | 'subject'>(
    initialSubjectId === 'daily' ? 'daily' : 'subject'
  );

  useEffect(() => {
    if (isOpen) {
      if (initialSubjectId && initialSubjectId !== 'daily') {
        setAttendanceType('subject');
        setSelectedSubjectId(initialSubjectId);
      } else {
        setAttendanceType('daily');
        setSelectedSubjectId('daily');
      }
    }
  }, [isOpen, initialSubjectId]);

  if (!isOpen) return null;

  const handleTypeSelect = (type: 'daily' | 'subject') => {
    setAttendanceType(type);
    if (type === 'daily') {
      setSelectedSubjectId('daily');
    } else {
      // Pick first subject if currently daily or invalid
      if (selectedSubjectId === 'daily' && classSubjects.length > 0) {
        setSelectedSubjectId(classSubjects[0].id);
      }
    }
  };

  const activeTargetId = attendanceType === 'daily' ? 'daily' : selectedSubjectId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              Take Attendance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Choose what you are taking attendance for and select entry mode.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Step 1: Select Attendance Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1. What Attendance Are You Taking?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: School Arrival */}
              <button
                type="button"
                onClick={() => handleTypeSelect('daily')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-2.5 text-left transition-all relative ${
                  attendanceType === 'daily'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center ${
                  attendanceType === 'daily'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <School size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    School Arrival (Daily)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Check if students came to school today.
                  </p>
                </div>
                {attendanceType === 'daily' && (
                  <div className="absolute top-3 right-3 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>

              {/* Option B: Specific Subject */}
              <button
                type="button"
                onClick={() => handleTypeSelect('subject')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-start gap-2.5 text-left transition-all relative ${
                  attendanceType === 'subject'
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center ${
                  attendanceType === 'subject'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Class Subject Period
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Check presence for an attached subject.
                  </p>
                </div>
                {attendanceType === 'subject' && (
                  <div className="absolute top-3 right-3 size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            </div>

            {/* Subject Dropdown Selector (if subject option selected) */}
            {attendanceType === 'subject' && (
              <div className="mt-3.5 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1.5">
                  Select Subject Attached to Class:
                </label>
                {classSubjects.length === 0 ? (
                  <p className="text-xs text-rose-500 font-medium">
                    No subjects are currently attached to this class. Please attach subjects in the Subjects tab first.
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedSubjectId === 'daily' ? (classSubjects[0]?.id || '') : selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
                    >
                      {classSubjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} {sub.code ? `(${sub.code})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Choose Interface Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              2. Select Entry Mode
            </label>
            
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => onSelectList(activeTargetId)}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 dark:hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all group text-left shadow-xs cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <List size={22} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Standard List Sheet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View all students in one sheet with quick 1-click status buttons and comment notes.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectSwipe(activeTargetId)}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all group text-left shadow-xs cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Layers size={22} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Swipe Cards Interface
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    One-by-one interactive card swiping. Ideal for rapid mobile entry.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModeModal;
