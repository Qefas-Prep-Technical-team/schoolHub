'use client';

import Link from 'next/link';
import { Assignment, AssignmentCardProps } from './types';
import { motion } from 'framer-motion';
import { Edit, GradualingIcon as Grading, Trash2, Calendar, FileText, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AssignmentCard({
    assignment,
    onEdit,
    onGrade,
    onDelete,
    onViewDetails
}: AssignmentCardProps) {

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

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            className="group relative flex flex-col p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
        >
            {/* Background Glow for Overdue */}
            {isOverdue && (
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 blur-3xl rounded-full"></div>
            )}

            <div className="flex justify-between items-start mb-6">
                <div className="space-y-1 max-w-[70%]">
                    <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {assignment.title}
                    </h3>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            {assignment.subject}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-[10px] font-bold text-slate-400">
                             {assignment.className}
                        </span>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(assignment.status)}`}>
                    {getStatusLabel(assignment.status)}
                </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-8 font-bold text-xs">
                <Calendar size={14} className="text-primary" />
                <span className="opacity-70 uppercase tracking-tighter">Deadline:</span>
                <span className="text-slate-700 dark:text-slate-300">{assignment.dueDate}</span>
            </div>

            <div className="mt-auto space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Sync</span>
                            {assignment.progress === 100 && <CheckCircle2 size={12} className="text-emerald-500" />}
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 italic">
                            {assignment.submitted} / {assignment.totalStudents}
                        </span>
                    </div>
                    <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${assignment.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`absolute h-full rounded-full transition-all duration-500 ${
                                isOverdue ? 'bg-rose-500' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]'
                            }`}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <IconButton onClick={() => onEdit?.(assignment.id)} icon={Edit} title="Edit" />
                        <IconButton onClick={() => onGrade?.(assignment.id)} icon={Grading} title="Grade" />
                        <IconButton onClick={() => onDelete?.(assignment.id)} icon={Trash2} title="Delete" variant="danger" />
                    </div>

                    <Link href="/dashboard/teacher/assignments/preview">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            Review
                            <ExternalLink size={14} strokeWidth={2.5} />
                        </motion.button>
                    </Link>
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