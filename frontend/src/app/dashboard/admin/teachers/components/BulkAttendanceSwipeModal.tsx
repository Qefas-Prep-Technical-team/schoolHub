'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, X as XIcon, Clock, AlertCircle } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { AttendanceStatus, TeacherAttendanceRecord } from './BulkAttendanceModal';

interface BulkAttendanceSwipeModalProps {
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

export const BulkAttendanceSwipeModal: React.FC<BulkAttendanceSwipeModalProps> = ({
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
  const [teachersToSwipe, setTeachersToSwipe] = useState<typeof teachers>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

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
      
      const toSwipe = teachers.filter(t => !initialRecords.some(r => r.teacherId === t.id));
      setTeachersToSwipe(toSwipe);
      setCurrentIndex(0);
      setShowSummary(toSwipe.length === 0);
    }
  }, [isOpen, teachers, targetDate, initialRecords]);

  const currentTeacher = teachersToSwipe[currentIndex];

  const handleSwipe = (status: AttendanceStatus) => {
    if (!currentTeacher) return;
    
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.teacherId === currentTeacher.id 
          ? { ...record, status }
          : record
      )
    );

    if (currentIndex < teachersToSwipe.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleSubmit = () => {
    onSave(attendanceRecords, targetDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800 relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                Swipe Attendance
              </h3>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => onTargetDateChange(e.target.value)}
                className="w-36 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-xs text-slate-500 font-bold mt-1">
              {!showSummary && teachersToSwipe.length > 0 ? `${currentIndex + 1} of ${teachersToSwipe.length}` : 'Summary'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
          
          {!showSummary && currentTeacher && (
            <div className="relative w-full h-[320px] max-w-[300px]">
              <AnimatePresence mode="popLayout">
                <SwipeCard 
                  key={currentTeacher.id}
                  teacher={currentTeacher}
                  onSwipe={handleSwipe}
                />
              </AnimatePresence>
            </div>
          )}

          {!showSummary && currentTeacher && (
            <div className="mt-8 flex gap-3 w-full justify-center max-w-[300px]">
               <button 
                onClick={() => handleSwipe('absent')}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Absent"
              >
                <XIcon size={24} strokeWidth={3} />
              </button>
              <button 
                onClick={() => handleSwipe('late')}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-amber-100 dark:border-amber-900/30 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Late"
              >
                <Clock size={24} strokeWidth={3} />
              </button>
              <button 
                onClick={() => handleSwipe('excused')}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-blue-100 dark:border-blue-900/30 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Excused"
              >
                <AlertCircle size={24} strokeWidth={3} />
              </button>
              <button 
                onClick={() => handleSwipe('present')}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-green-100 dark:border-green-900/30 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title="Present"
              >
                <Check size={24} strokeWidth={3} />
              </button>
            </div>
          )}

          {showSummary && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} strokeWidth={3} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">All done!</h4>
                <p className="text-sm text-slate-500 mt-1">Review the attendance before saving.</p>
              </div>

              <div className="flex-1 overflow-y-auto w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 max-h-[220px]">
                {attendanceRecords.map(record => (
                  <div key={record.teacherId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{record.teacherName}</p>
                      <p className="text-xs text-slate-500 font-mono">{record.teacherCode}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${record.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${record.status === 'absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                      ${record.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${record.status === 'excused' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    `}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {showSummary && (
          <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 bg-primary text-white text-sm font-bold leading-normal hover:bg-primary/95 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-80"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-white/20 border-t-white" />
                  Saving...
                </>
              ) : 'Save & Publish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for the swipeable card
const SwipeCard = ({ 
  teacher, 
  onSwipe 
}: { 
  teacher: { name: string, code: string }, 
  onSwipe: (status: AttendanceStatus) => void 
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map position to rotation
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Opacities for the indicator overlays
  const presentOpacity = useTransform(x, [50, 150], [0, 1]);
  const absentOpacity = useTransform(x, [-50, -150], [0, 1]);
  const lateOpacity = useTransform(y, [-50, -150], [0, 1]); // Swipe up
  const excusedOpacity = useTransform(y, [50, 150], [0, 1]); // Swipe down

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    
    // Check horizontal swipe first
    if (info.offset.x > swipeThreshold) {
      onSwipe('present');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('absent');
    } 
    // Then check vertical swipe
    else if (info.offset.y < -swipeThreshold) {
      onSwipe('late');
    } else if (info.offset.y > swipeThreshold) {
      onSwipe('excused');
    }
  };

  // Extract initials
  const initials = teacher.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Dynamic Overlays */}
      <motion.div style={{ opacity: presentOpacity }} className="absolute inset-0 bg-green-500/20 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-4xl font-black text-green-500 border-4 border-green-500 rounded-xl px-4 py-2 rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">PRESENT</span>
      </motion.div>
      <motion.div style={{ opacity: absentOpacity }} className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-4xl font-black text-red-500 border-4 border-red-500 rounded-xl px-4 py-2 -rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">ABSENT</span>
      </motion.div>
      <motion.div style={{ opacity: lateOpacity }} className="absolute inset-0 bg-amber-500/20 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-4xl font-black text-amber-500 border-4 border-amber-500 rounded-xl px-4 py-2 -rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">LATE</span>
      </motion.div>
      <motion.div style={{ opacity: excusedOpacity }} className="absolute inset-0 bg-blue-500/20 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-4xl font-black text-blue-500 border-4 border-blue-500 rounded-xl px-4 py-2 rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">EXCUSED</span>
      </motion.div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-0 pointer-events-none">
        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-black mb-6">
          {initials}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {teacher.name}
        </h2>
        <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
          CODE: {teacher.code || '-'}
        </p>
      </div>
      
      {/* Instructions hint */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-800 pointer-events-none">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Swipe → Present | ← Absent | ↑ Late | ↓ Excused
        </p>
      </div>
    </motion.div>
  );
};
