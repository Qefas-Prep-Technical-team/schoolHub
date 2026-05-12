'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { School, GraduationCap, Users, UserRound, ArrowRight } from 'lucide-react';

const roles = [
    {
        key: 'school',
        icon: School,
        title: 'Institutional',
        subtitle: 'School Admin',
        description: 'Command center for school operations, staff, and institutional metrics.',
        accent: 'from-indigo-600 to-blue-500',
        shadow: 'shadow-indigo-500/20'
    },
    {
        key: 'teacher',
        icon: GraduationCap,
        title: 'Academic',
        subtitle: 'Teachers',
        description: 'Orchestrate classes, assessments, and drive student success.',
        accent: 'from-blue-600 to-cyan-500',
        shadow: 'shadow-blue-500/20'
    },
    {
        key: 'student',
        icon: UserRound,
        title: 'Learning',
        subtitle: 'Student',
        description: 'Your personal portal for courses, performance tracking, and exams.',
        accent: 'from-violet-600 to-indigo-500',
        shadow: 'shadow-violet-500/20'
    },
    {
        key: 'parent',
        icon: Users,
        title: 'Support',
        subtitle: 'Guardian & Parent',
        description: 'Stay connected with your child’s academic journey and growth.',
        accent: 'from-fuchsia-600 to-pink-500',
        shadow: 'shadow-fuchsia-500/20'
    },
];

export default function GetStartedRoleSelect() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
            {roles.map((role, idx) => (
                <motion.div
                    key={role.key}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                    <Link
                        href={`/signup/${role.key}`}
                        className="group relative block h-full"
                    >
                        {/* Shadow Backdrop */}
                        <div className={`absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-500 ${role.shadow} blur-2xl -z-10`} />
                        
                        <div className="h-full flex flex-col p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-500 group-hover:border-indigo-500/50 group-hover:-translate-y-2">
                            {/* Icon Capsule */}
                            <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${role.accent} p-4 mb-8 shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                <role.icon className="w-full h-full text-white" />
                            </div>

                            <div className="flex-grow">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">
                                    {role.title}
                                </p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 font-lexend">
                                    {role.subtitle}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                                    {role.description}
                                </p>
                            </div>

                            {/* Action Area */}
                            <div className="mt-8 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-10px] group-hover:translate-x-0">
                                    Get Started
                                </span>
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                                    <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
