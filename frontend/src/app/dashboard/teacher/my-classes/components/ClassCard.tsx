'use client';

import { Users, Calendar, Clock, GraduationCap, BarChart3, ArrowUpRight, BarChart, ChevronRight } from 'lucide-react';
import { Class } from './type';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ClassCardProps {
    classData: Class;
    onClick: () => void;
}

export default function ClassCard({ classData, onClick }: ClassCardProps) {
    const getAttendanceColor = (attendance: number) => {
        if (attendance >= 95) return 'text-emerald-500';
        if (attendance >= 85) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 85) return 'text-emerald-500';
        if (grade >= 75) return 'text-amber-500';
        return 'text-rose-500';
    };

    const pendingCount = (classData.assignments || 0) + (classData.exams || 0);

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative flex flex-col w-full max-w-md mx-auto p-6 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
        >
            {/* Top Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Header: Title & Subject */}
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-lg bg-primary/10 text-primary`}>
                            <GraduationCap size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                             {classData.subject}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none pt-1">
                        {classData.name}
                    </h3>
                </div>
                {pendingCount > 0 && (
                    <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                        {pendingCount} Tasks
                    </div>
                )}
            </div>

            {/* Middle: Sleek Wide-Pill Image */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-6 shadow-md border border-slate-100 dark:border-slate-800/50">
                <img 
                    src={classData.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop'} 
                    alt={classData.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-white text-[10px] font-bold">
                        <Users size={12} />
                        {classData.studentCount}
                    </div>
                    <div className="flex items-center gap-1.5 text-white text-[10px] font-bold">
                        <Clock size={12} />
                        {classData.schedule?.[0] || 'Period 1'}
                    </div>
                </div>
            </div>

            {/* Integrated Metric Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Attendance</span>
                    <span className={`text-sm font-black ${getAttendanceColor(classData.attendance)}`}>
                         {classData.attendance}%
                    </span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700/50"></div>
                <div className="flex flex-col gap-0.5 items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Class GPA</span>
                    <span className={`text-sm font-black ${getGradeColor(classData.averageGrade)}`}>
                        {classData.averageGrade}%
                    </span>
                </div>
            </div>

            {/* Actions: Primary Full-Width */}
            <div className="mt-auto space-y-3">
                <Link href={`/dashboard/teacher/my-classes/${classData.id}`} onClick={onClick} className="block">
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 group/btn shadow-xl shadow-black/5 hover:bg-primary transition-all"
                    >
                        Enter Classroom
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                    </motion.button>
                </Link>
                <div className="flex items-center justify-between px-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       {classData.level || 'Academic Year'}
                    </p>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-primary/40 transition-colors"></div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
