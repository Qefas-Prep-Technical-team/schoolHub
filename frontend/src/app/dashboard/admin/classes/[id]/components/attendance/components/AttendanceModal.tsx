'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from './types';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: AttendanceRecord[]) => void;
  students: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  date: string;
  initialRecords?: AttendanceRecord[];
  isSaving?: boolean;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  students, 
  date,
  initialRecords = [],
  isSaving = false
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const records = students.map(student => {
        const existing = initialRecords.find(
          r => r.studentId === student.id || (r as any).student?.id === student.id
        );
        return {
          id: existing?.id || `${student.id}-${date}`,
          studentId: student.id,
          studentName: student.name,
          studentCode: student.code,
          classId: existing?.classId || 'class-1',
          className: existing?.className || 'Biology 101',
          date: date,
          status: (existing?.status as AttendanceStatus) || 'present',
          comment: existing?.comment || (existing as any)?.note || '',
          submittedBy: existing?.submittedBy || 'Dr. Eleanor Vance',
          submittedAt: existing?.submittedAt || new Date().toISOString()
        };
      });
      setAttendanceRecords(records);
    }
  }, [isOpen, students, date, initialRecords]);

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
    onSave(attendanceRecords);
    onClose();
  };

  const getStatusButtonClass = (status: AttendanceStatus, isSelected: boolean) => {
    const baseClasses = 'px-3 py-1 text-xs font-bold rounded-full transition-colors w-8 h-8 flex items-center justify-center';
    
    if (isSelected) {
      switch (status) {
        case 'present':
          return `${baseClasses} bg-green-500 text-white`;
        case 'absent':
          return `${baseClasses} bg-red-500 text-white`;
        case 'late':
          return `${baseClasses} bg-yellow-500 text-white`;
        case 'excused':
          return `${baseClasses} bg-blue-500 text-white`;
        default:
          return `${baseClasses} bg-primary text-white`;
      }
    }
    
    return `${baseClasses} bg-gray-150 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-250 dark:hover:bg-gray-700`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-255">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-100 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Daily Attendance Sheet</h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative">
              <label className="block mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Target Date
              </label>
              <input
                type="date"
                value={date}
                readOnly
                className="w-48 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-100 dark:border-green-800/30 transition-colors"
              >
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-100 dark:border-red-800/30 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
            {attendanceRecords.map((record) => (
              <div 
                key={record.studentId}
                className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {record.studentName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">
                      ID: {record.studentCode}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 ml-4">
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'present')}
                      className={getStatusButtonClass('present', record.status === 'present')}
                      title="Present"
                    >
                      P
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'absent')}
                      className={getStatusButtonClass('absent', record.status === 'absent')}
                      title="Absent"
                    >
                      A
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'late')}
                      className={getStatusButtonClass('late', record.status === 'late')}
                      title="Late"
                    >
                      L
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.studentId, 'excused')}
                      className={getStatusButtonClass('excused', record.status === 'excused')}
                      title="Excused"
                    >
                      E
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Add optional note/comment..."
                  value={record.comment || ''}
                  onChange={(e) => handleCommentChange(record.studentId, e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end p-6 border-t dark:border-slate-800 gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-bold leading-normal hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex min-w-[130px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/95 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-80 disabled:cursor-not-allowed gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save & Publish</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;