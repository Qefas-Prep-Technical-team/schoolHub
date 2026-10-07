'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Assignment, AssignmentCardProps } from './types';
import { motion } from 'framer-motion';
import { Edit, GraduationCap as Grading, Trash2, Calendar, FileText, ExternalLink, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

export default function AssignmentCard({
    assignment,
    onEdit,
    onGrade,
    onDelete,
    onViewDetails,
    viewMode,
    index
}: AssignmentCardProps) {
    const [isNavigating, setIsNavigating] = useState(false);

    const getStatusStyles = (status: Assignment['status']) => {
        switch (status) {
            case 'published':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'overdue':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case 'due-soon':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'draft':
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getStatusLabel = (status: Assignment['status']) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    };

    const isOverdue = assignment.status === 'overdue';

    if (viewMode === 'list') {
        return (
            <motion.div
                className="group relative grid grid-cols-[0.5fr_2.5fr_1.5fr_1.5fr_1.5fr_1fr_auto] gap-4 items-center px-8 py-5 border-b border-slate-100 dark:border-slate-800/60 transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl last:border-0 z-10 cursor-pointer min-w-[900px] hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
            >
                {/* Index / Checkbox styled */}
                <div className="font-semibold text-slate-400 dark:text-slate-500 text-sm">
                    {index ? String(index).padStart(2, '0') : ''}
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">{assignment.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{assignment.subject}</span>
                        </div>
                    </div>
                </div>

                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {assignment.className}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {assignment.dueDate}
                </div>

                <div className="flex flex-col gap-1.5 pr-6">
                     <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${assignment.progress}%` }} />
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                         <span>{assignment.progress}% completed</span>
                     </div>
                </div>

                <div>
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${getStatusStyles(assignment.status).replace('border-', 'border border-')}`}>
                         {getStatusLabel(assignment.status)}
                     </span>
                </div>

                <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton onClick={() => onDelete?.(assignment.id)} icon={Trash2} title="Delete" variant="danger" />
                    <button
                        onClick={() => {
                            setIsNavigating(true);
                            onViewDetails?.(assignment.id);
                        }}
                        className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                        {isNavigating ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
            {/* Background Glow for Overdue */}
            {isOverdue && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl rounded-full"></div>
            )}

            {/* Index Number */}
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-black z-10 shadow-sm border border-slate-200 dark:border-slate-700">
                {index ? String(index).padStart(2, '0') : ''}
            </div>

            <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-slate-100 dark:border-slate-700/50 group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20 transition-all overflow-hidden">
                    <FileText size={24} />
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight line-clamp-2 leading-tight mb-2">
                    {assignment.title}
                </h3>
                
                <div className="flex items-center gap-2 justify-center flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {assignment.subject}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {assignment.className}
                    </span>
                    {assignment.creator && (
                        <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] font-bold text-slate-500">By {assignment.creator.name}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-auto space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Calendar size={12} className={isOverdue ? 'text-rose-500' : 'text-primary'} />
                            <span>{assignment.dueDate}</span>
                        </div>
                        <span className={assignment.progress === 100 ? 'text-emerald-500' : ''}>
                            {assignment.progress}%
                        </span>
                    </div>
                    <div className="relative h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${assignment.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`absolute h-full rounded-full transition-all duration-500 ${
                                isOverdue ? 'bg-rose-500' : 'bg-primary'
                            }`}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(assignment.status)}`}>
                        {getStatusLabel(assignment.status)}
                    </div>

                    <div className="flex items-center gap-2">
                        <IconButton onClick={() => onDelete?.(assignment.id)} icon={Trash2} title="Delete" variant="danger" />
                        <button
                            onClick={() => {
                                setIsNavigating(true);
                                onViewDetails?.(assignment.id);
                            }}
                            disabled={isNavigating}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isNavigating ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function IconButton({ onClick, icon: Icon, title, variant = 'default' }: { onClick?: () => void, icon: any, title: string, variant?: 'default' | 'danger' }) {
    return (
        <motion.button
            whileHover={{ scale: 1.1, backgroundColor: variant === 'danger' ? 'rgba(244,63,94,0.1)' : 'rgba(var(--primary-rgb),0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); onClick?.(); }}
            className={`p-3 rounded-xl transition-all ${
                variant === 'danger' ? 'text-rose-500' : 'text-slate-400 hover:text-primary'
            }`}
            title={title}
        >
            <Icon size={18} strokeWidth={2.5} />
        </motion.button>
    );
}
// Note: Grading icon was missing, used dummy/fallback if needed, but GraduationCap or ListChecks work. 
// Refined Import section above.
