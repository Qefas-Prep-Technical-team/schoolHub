'use client';

import { Users, Clock, GraduationCap, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Class } from './type';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ClassCardProps {
    classData: Class;
    onClick: () => void;
}

export default function ClassCard({ classData, onClick }: ClassCardProps) {
    const getAttendanceColor = (attendance: number) => {
        if (attendance >= 95) return 'text-blue-500';
        if (attendance >= 85) return 'text-emerald-500';
        if (attendance >= 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 90) return 'text-blue-500';
        if (grade >= 75) return 'text-emerald-500';
        if (grade >= 40) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getPendingColor = (pending: number) => {
        if (pending === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
        if (pending <= 2) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if (pending <= 5) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    };

    const pendingCount = (classData.assignments || 0) + (classData.exams || 0);

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative flex flex-col w-full max-w-md mx-auto p-6 rounded-2xl border border-slate-200 dark:border-emerald-800/50 bg-white dark:bg-emerald-950/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
            {/* Top Shine Effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Header: Title & Subject */}
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500`}>
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
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPendingColor(pendingCount)}`}>
                        {pendingCount} Tasks
                    </div>
                )}
            </div>

            {/* Middle: Sleek Wide-Pill Image */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-6 shadow-md border border-slate-100 dark:border-emerald-800/40">
                <Image 
                    src={classData.image || '/users/user 1.jpeg'} 
                    alt={classData.name}
                    width={800}
                    height={320}
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
            <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-emerald-900/20 rounded-2xl mb-8 border border-slate-100 dark:border-emerald-800/40">
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
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 group/btn shadow-xl shadow-black/5 hover:bg-emerald-500 transition-all"
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
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-emerald-500/40 transition-colors"></div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
