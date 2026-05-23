'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface TeacherAttendanceRecord {
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  status: AttendanceStatus;
  note: string;
}

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (records: TeacherAttendanceRecord[], date: string) => void;
  teachers: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  targetDate: string;
  onTargetDateChange: (date: string) => void;
  initialRecords?: any[];
  isSaving?: boolean;
}

export const BulkAttendanceModal: React.FC<BulkAttendanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  teachers, 
  targetDate,
  onTargetDateChange,
  initialRecords = [],
  isSaving = false
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<TeacherAttendanceRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const records = teachers.map(teacher => {
        const existing = initialRecords.find(r => r.teacherId === teacher.id);
        return {
          teacherId: teacher.id,
          teacherName: teacher.name,
          teacherCode: teacher.code || '-',
          status: (existing?.status as AttendanceStatus) || 'present',
          note: existing?.note || '',
        };
      });
      setAttendanceRecords(records);
    }
  }, [isOpen, teachers, targetDate, initialRecords]);

  const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.teacherId === teacherId 
          ? { ...record, status }
          : record
      )
    );
  };

  const handleCommentChange = (teacherId: string, note: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.teacherId === teacherId 
          ? { ...record, note }
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
    onSave(attendanceRecords, targetDate);
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
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Staff Attendance</h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative">
              <label className="block mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => onTargetDateChange(e.target.value)}
                className="w-48 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            {attendanceRecords.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No teachers found.</p>
            ) : attendanceRecords.map((record) => (
              <div 
                key={record.teacherId}
                className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {record.teacherName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase">
                      Code: {record.teacherCode}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 ml-4">
                    <button
                      onClick={() => handleStatusChange(record.teacherId, 'present')}
                      className={getStatusButtonClass('present', record.status === 'present')}
                      title="Present"
                    >
                      P
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.teacherId, 'absent')}
                      className={getStatusButtonClass('absent', record.status === 'absent')}
                      title="Absent"
                    >
                      A
                    </button>
                    <button
                      onClick={() => handleStatusChange(record.teacherId, 'late')}
                      className={getStatusButtonClass('late', record.status === 'late')}
                      title="Late"
                    >
                      L
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Add optional note/comment..."
                  value={record.note || ''}
                  onChange={(e) => handleCommentChange(record.teacherId, e.target.value)}
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
            className="flex min-w-[130px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-80 disabled:cursor-not-allowed gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 rounded-full border-2 border-white/20 border-t-white" />
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
