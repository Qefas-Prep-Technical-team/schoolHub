'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, School, Check, ChevronDown } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ClassSubjectItem } from './types';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: AttendanceRecord[], options?: { subjectId?: string; subjectName?: string }) => void;
  students: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  date: string;
  initialRecords?: AttendanceRecord[];
  classSubjects?: ClassSubjectItem[];
  defaultSubjectId?: string;
  isSaving?: boolean;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  students, 
  date,
  initialRecords = [],
  classSubjects = [],
  defaultSubjectId = 'daily',
  isSaving = false
}) => {
  const [selectedScope, setSelectedScope] = useState<string>(defaultSubjectId);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedScope(defaultSubjectId);
    }
  }, [isOpen, defaultSubjectId]);

  useEffect(() => {
    if (isOpen) {
      const records = students.map(student => {
        const existing = initialRecords.find(
          r => r.studentId === student.id || (r as any).student?.id === student.id
        );

        let initialStatus: AttendanceStatus = 'present';
        if (selectedScope !== 'daily') {
          // If a specific subject is selected, read student's status for this subject
          const subRecord = existing?.subjects?.[selectedScope];
          if (subRecord && subRecord.status && subRecord.status !== 'unrecorded') {
            initialStatus = subRecord.status as AttendanceStatus;
          } else if (existing?.status) {
            initialStatus = existing.status as AttendanceStatus;
          }
        } else if (existing?.status) {
          initialStatus = existing.status as AttendanceStatus;
        }

        return {
          id: existing?.id || `${student.id}-${date}`,
          studentId: student.id,
          studentName: student.name,
          studentCode: student.code,
          classId: existing?.classId || 'class-1',
          className: existing?.className || 'Class',
          date: date,
          status: initialStatus,
          comment: existing?.comment || (existing as any)?.note || '',
          submittedBy: existing?.submittedBy || 'Administrator',
          submittedAt: existing?.submittedAt || new Date().toISOString(),
          subjects: existing?.subjects || {},
        };
      });

      setAttendanceRecords(records);
    } else {
      setAttendanceRecords([]);
    }
  }, [isOpen, students, date, initialRecords, selectedScope]);

  const activeSubject = useMemo(() => {
    if (selectedScope === 'daily') return null;
    return classSubjects.find(s => s.id === selectedScope) || null;
  }, [selectedScope, classSubjects]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, comment }
          : record
      )
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => ({ ...record, status }))
    );
  };

  const handleSubmit = () => {
    if (selectedScope === 'daily') {
      onSave(attendanceRecords);
    } else {
      onSave(attendanceRecords, {
        subjectId: selectedScope,
        subjectName: activeSubject?.name || "Subject",
      });
    }
  };

  const getStatusButtonClass = (status: AttendanceStatus, isSelected: boolean) => {
    const baseClasses = 'px-3 py-1 text-xs font-bold rounded-xl transition-all h-8 flex items-center justify-center';
    
    if (isSelected) {
      switch (status) {
        case 'present':
          return `${baseClasses} bg-emerald-500 text-white shadow-xs`;
        case 'absent':
          return `${baseClasses} bg-rose-500 text-white shadow-xs`;
        case 'late':
          return `${baseClasses} bg-amber-500 text-white shadow-xs`;
        case 'excused':
          return `${baseClasses} bg-sky-500 text-white shadow-xs`;
        default:
          return `${baseClasses} bg-primary text-white shadow-xs`;
      }
    }
    
    return `${baseClasses} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-150 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              {activeSubject ? (
                <>
                  <BookOpen size={20} className="text-indigo-500" />
                  <span>Subject Attendance: {activeSubject.name}</span>
                </>
              ) : (
                <>
                  <School size={20} className="text-emerald-500" />
                  <span>Daily School Attendance Sheet</span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Target Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{date}</span> &bull; {students.length} Enrolled Students
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Attendance Scope Switcher */}
        <div className="px-6 py-3 border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taking Attendance For:
            </span>
            <div className="relative">
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option value="daily">🏫 General School Attendance (Arrival)</option>
                {classSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    📖 Subject: {sub.name} ({sub.code || 'No Code'})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Mark all:</span>
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
            >
              Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-200 transition-colors"
            >
              Absent
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('late')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition-colors"
            >
              Late
            </button>
          </div>
        </div>

        {/* Modal List Body */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No students enrolled in this class.
            </div>
          ) : (
            attendanceRecords.map((record) => (
              <div 
                key={record.studentId}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {record.studentName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    ID: {record.studentCode}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Buttons */}
                  <div className="grid grid-cols-4 gap-1">
                    {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(record.studentId, status)}
                        className={getStatusButtonClass(status, record.status === status)}
                      >
                        <span className="capitalize">{status}</span>
                      </button>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <input
                    type="text"
                    value={record.comment || ''}
                    onChange={(e) => handleCommentChange(record.studentId, e.target.value)}
                    placeholder="Note..."
                    className="w-32 sm:w-40 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {activeSubject 
              ? `Saving attendance specifically for "${activeSubject.name}".`
              : 'Saving general daily arrival attendance for this class.'
            }
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || attendanceRecords.length === 0}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer
              bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25
              dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 dark:font-black dark:shadow-[0_0_20px_rgba(16,185,129,0.35)] dark:border dark:border-emerald-300/40"
            >
              <Check size={16} className="text-white dark:text-slate-950 stroke-[3]" />
              <span>{isSaving ? "Saving..." : "Save Attendance"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;