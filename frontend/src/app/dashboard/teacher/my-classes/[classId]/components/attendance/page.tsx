'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, AlertCircle, Users, Check, X, Clock } from 'lucide-react';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendancePage() {
    const params = useParams();
    const classId = params.classId as string;

    const { data, isLoading } = useQuery({
        queryKey: ['class-students', classId],
        queryFn: () => teacherService.getStudents({ classId, page: 1, limit: 500 }),
        enabled: !!classId,
    });

    const students = data?.students?.map((s: any, idx: number) => ({
        id: s.id,
        name: s.name,
        rollNo: s.studentCode || `00${idx + 1}`,
        status: 'present' // default for today's registry
    })) || [];

    const stats = {
        present: students.length, // Initialize all to present for new registry
        absent: 0,
        late: 0,
        total: students.length
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Registry</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Manage Daily Presence</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black uppercase tracking-widest rounded-2xl transition-colors">
                        Select Date
                    </button>
                    <button className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        Save Registry
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {isLoading && (
                    <div className="col-span-4 p-4 text-center text-slate-500 animate-pulse font-bold uppercase tracking-widest text-xs">
                        Loading class registry from database...
                    </div>
                )}
                <div className="p-5 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Users size={20} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Check size={20} strokeWidth={3} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Present</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.present}</p>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Clock size={20} strokeWidth={3} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Late</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.late}</p>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><X size={20} strokeWidth={3} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Absent</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.absent}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Roll No</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {students.map((student, idx) => (
                                <motion.tr 
                                    key={student.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-bold text-slate-500">#{student.rollNo}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{student.name}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex gap-2">
                                            <button className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${student.status === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>P</button>
                                            <button className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${student.status === 'late' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>L</button>
                                            <button className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${student.status === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>A</button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="text-primary hover:text-primary-dark text-sm font-bold underline">Edit Remarks</button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
