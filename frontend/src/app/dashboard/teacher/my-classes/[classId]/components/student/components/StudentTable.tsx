'use client';

import { Phone, Eye, User, Award, ShieldCheck, Mail, MoreVertical } from 'lucide-react';
import { Student } from './types';
import { motion } from 'framer-motion';

interface StudentTableProps {
  students: Student[];
  onView: (student: Student) => void;
  onCall: (student: Student) => void;
}

export function StudentTable({ students, onView, onCall }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
           <User size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">No Enrollment Data</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
           There are currently no students registered in this academic module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-slate-50 dark:bg-slate-900/40 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 mb-4 items-center">
          <div className="col-span-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Identity</div>
          <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Analytics</div>
          <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</div>
          <div className="col-span-2 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Class Actions</div>
      </div>

      <div className="space-y-3">
        {students.map((student, idx) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-lg hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all items-center"
          >
            {/* Identity */}
            <div className="col-span-5 flex items-center gap-5">
               <div className="relative">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <ShieldCheck size={10} className="text-white" />
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{student.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     {student.studentId}
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     {student.gender}
                  </p>
               </div>
            </div>

            {/* Performance Snapshot */}
            <div className="col-span-3 flex items-center gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-emerald-500">
                        <Award size={14} />
                        <span className="text-sm font-black tracking-tight">{student.performance || '92%'}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">GPA AVG</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-primary">
                        <ShieldCheck size={14} />
                        <span className="text-sm font-black tracking-tight">{student.attendance || '98%'}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">ATTN RATE</span>
                </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest whitespace-nowrap inline-block">
                    {student.status}
                </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-3">
               <button
                  onClick={() => onCall(student)}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all active:scale-90"
                  title="Contact Student"
               >
                  <Phone size={18} strokeWidth={2.5} />
               </button>
               <button
                  onClick={() => onView(student)}
                  className="p-3.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                  title="Full Profile"
               >
                  <Eye size={18} strokeWidth={2.5} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}