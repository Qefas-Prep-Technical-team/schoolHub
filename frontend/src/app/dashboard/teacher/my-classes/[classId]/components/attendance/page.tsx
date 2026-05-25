'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, AlertCircle, Users, Check, X, Clock } from 'lucide-react';

export default function AttendancePage() {
    // Placeholder students data
    const students = [
        { id: '1', name: 'Alice Smith', status: 'present', rollNo: '001' },
        { id: '2', name: 'Bob Johnson', status: 'absent', rollNo: '002' },
        { id: '3', name: 'Charlie Brown', status: 'late', rollNo: '003' },
        { id: '4', name: 'Diana Prince', status: 'present', rollNo: '004' },
    ];

    const stats = {
        present: 2,
        absent: 1,
        late: 1,
        total: 4
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
