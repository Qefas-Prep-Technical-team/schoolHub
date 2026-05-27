'use client';

import { Eye, User, Award, ShieldCheck, Mail, BookOpen } from 'lucide-react';
import { Student } from './types';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface StudentTableProps {
  students: Student[];
  onView: (student: Student) => void;
  onCall: (student: Student) => void;
  viewMode?: 'list' | 'grid';
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  suspended: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  transferred: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const performanceColors: Record<string, string> = {
  High: 'text-emerald-500',
  Medium: 'text-amber-500',
  Low: 'text-rose-500',
};

function Avatar({ student }: { student: Student }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-800">
        {student.avatar ? (
          <Image src={student.avatar} alt={student.name} width={48} height={48} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={20} className="text-slate-400" />
          </div>
        )}
      </div>
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${student.status === 'active' ? 'bg-emerald-500' : student.status === 'suspended' ? 'bg-amber-500' : 'bg-slate-400'}`} />
    </div>
  );
}

function ListRow({ student, onView, idx }: { student: Student; onView: (s: Student) => void; idx: number }) {
  const attendanceNum = typeof student.attendance === 'number' ? student.attendance : parseInt(student.attendance || '0', 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="group grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/20 dark:hover:border-primary/20 transition-all items-center"
    >
      {/* Identity */}
      <div className="col-span-4 flex items-center gap-4">
        <Avatar student={student} />
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            {student.studentCode || student.studentId}
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            {student.gender}
          </p>
          {student.email && (
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail size={9} /> {student.email}
            </p>
          )}
        </div>
      </div>

      {/* Class */}
      <div className="col-span-2">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <BookOpen size={12} className="text-primary" />
          {student.grade || '—'}
        </p>
        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Class</p>
      </div>

      {/* Performance */}
      <div className="col-span-2 flex items-center gap-4">
        <div>
          <div className={`flex items-center gap-1 font-black text-sm ${performanceColors[student.performance || 'Medium']}`}>
            <Award size={13} />
            {student.performance || 'Medium'}
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Performance</p>
        </div>
      </div>

      {/* Attendance */}
      <div className="col-span-2">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${attendanceNum >= 80 ? 'bg-emerald-500' : attendanceNum >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(attendanceNum, 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{attendanceNum}%</span>
        </div>
        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">Attendance</p>
      </div>

      {/* Status + Action */}
      <div className="col-span-2 flex items-center justify-end gap-3">
        <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusColors[student.status] || statusColors.active}`}>
          {student.status}
        </span>
        <button
          onClick={() => onView(student)}
          className="p-2.5 rounded-xl bg-primary text-white shadow-md shadow-primary/20 hover:scale-105 transition-all"
        >
          <Eye size={15} strokeWidth={2.5} />
        </button>
      </div>
    </motion.div>
  );
}

function GridCard({ student, onView, idx }: { student: Student; onView: (s: Student) => void; idx: number }) {
  const attendanceNum = typeof student.attendance === 'number' ? student.attendance : parseInt(student.attendance || '0', 10);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <Avatar student={student} />
        <span className={`px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusColors[student.status] || statusColors.active}`}>
          {student.status}
        </span>
      </div>

      {/* Identity */}
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{student.name}</p>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
          {student.studentCode || student.studentId} · {student.gender}
        </p>
        {student.email && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
            <Mail size={9} className="shrink-0" /> {student.email}
          </p>
        )}
        {student.grade && (
          <p className="text-[10px] text-primary font-bold flex items-center gap-1 mt-1">
            <BookOpen size={9} /> {student.grade}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
          <p className={`text-sm font-black ${performanceColors[student.performance || 'Medium']}`}>{student.performance || 'Medium'}</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Performance</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
          <p className={`text-sm font-black ${attendanceNum >= 80 ? 'text-emerald-500' : attendanceNum >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{attendanceNum}%</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Attendance</p>
        </div>
      </div>

      {/* Last Exam */}
      {student.lastExam && student.lastExam !== 'N/A' && (
        <div className="flex items-center justify-between text-xs bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
          <span className="text-slate-500 font-semibold">Last Exam</span>
          <span className="font-black text-primary">{student.lastExam}</span>
        </div>
      )}

      {/* Action */}
      <button
        onClick={() => onView(student)}
        className="w-full h-9 bg-primary text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:opacity-90 transition-all"
      >
        <Eye size={13} /> View Profile
      </button>
    </motion.div>
  );
}

export function StudentTable({ students, onView, onCall, viewMode = 'list' }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center mb-4">
          <User size={28} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">No Students Found</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">No students match your current filters.</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {students.map((student, idx) => (
          <GridCard key={student.id} student={student} onView={onView} idx={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 mb-2">
        <div className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</div>
        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Class</div>
        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</div>
        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance</div>
        <div className="col-span-2 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Action</div>
      </div>
      {students.map((student, idx) => (
        <ListRow key={student.id} student={student} onView={onView} idx={idx} />
      ))}
    </div>
  );
}