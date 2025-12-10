'use client';

import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
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
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  students, 
  date 
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    students.map(student => ({
      id: `${student.id}-${date}`,
      studentId: student.id,
      studentName: student.name,
      studentCode: student.code,
      classId: 'class-1',
      className: 'Biology 101',
      date: date,
      status: 'present' as AttendanceStatus,
      comment: '',
      submittedBy: 'Dr. Eleanor Vance',
      submittedAt: new Date().toISOString()
    }))
  );

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
    const baseClasses = 'px-3 py-1 text-xs font-bold rounded-full transition-colors';
    
    if (isSelected) {
      return `${baseClasses} bg-primary text-white`;
    }
    
    return `${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl m-4 border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Attendance Session</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </label>
              <input
                type="date"
                value={date}
                readOnly
                className="form-input w-48 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
              >
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
              >
                Mark All Absent
              </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {attendanceRecords.map((record) => (
              <div 
                key={record.studentId}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {record.studentName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ID: {record.studentCode}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleStatusChange(record.studentId, 'present')}
                    className={getStatusButtonClass('present', record.status === 'present')}
                  >
                    P
                  </button>
                  <button
                    onClick={() => handleStatusChange(record.studentId, 'absent')}
                    className={getStatusButtonClass('absent', record.status === 'absent')}
                  >
                    A
                  </button>
                  <button
                    onClick={() => handleStatusChange(record.studentId, 'late')}
                    className={getStatusButtonClass('late', record.status === 'late')}
                  >
                    L
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-end p-6 border-t dark:border-gray-800 gap-4">
          <button
            onClick={onClose}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
          >
            Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;