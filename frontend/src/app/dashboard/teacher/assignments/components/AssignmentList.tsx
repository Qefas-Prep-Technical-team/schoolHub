'use client';

import { motion } from 'framer-motion';
import { Assignment } from './types';
import { Edit, GraduationCap as Grading, Trash2, Calendar, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AssignmentListProps {
    assignments: Assignment[];
    onEdit?: (id: string) => void;
    onGrade?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewDetails?: (id: string) => void;
}

export default function AssignmentList({
    assignments,
    onEdit,
    onGrade,
    onDelete,
    onViewDetails
}: AssignmentListProps) {
    if (!assignments || assignments.length === 0) {
        return null;
    }

    const getStatusStyles = (status: Assignment['status']) => {
        switch (status) {
            case 'published':
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
            case 'overdue':
                return 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
            case 'due-soon':
                return 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
            case 'draft':
                return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
            default:
                return 'bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20';
        }
    };

    const getStatusLabel = (status: Assignment['status']) => {
        return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
    };

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Assignment</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Class & Subject</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Deadline</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Submissions</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {assignments.map((assignment) => (
                        <motion.tr 
                            key={assignment.id}
                            whileHover={{ backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
                            className="group transition-colors dark:hover:bg-slate-800/30"
                        >
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <FileText size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                                            {assignment.title}
                                        </h4>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        {assignment.className}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {assignment.subject}
                                    </span>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                    <Calendar size={14} className="text-slate-400" />
                                    {assignment.dueDate}
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusStyles(assignment.status)}`}>
                                    {getStatusLabel(assignment.status)}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex flex-col gap-1.5 w-32">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                            {assignment.submitted} / {assignment.totalStudents}
                                        </span>
                                        {assignment.progress === 100 && <CheckCircle2 size={12} className="text-emerald-500" />}
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${assignment.status === 'overdue' ? 'bg-rose-500' : 'bg-primary'}`}
                                            style={{ width: `${assignment.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <IconButton onClick={() => onEdit?.(assignment.id)} icon={Edit} title="Edit" />
                                    <IconButton onClick={() => onGrade?.(assignment.id)} icon={Grading} title="Grade" />
                                    <IconButton onClick={() => onDelete?.(assignment.id)} icon={Trash2} title="Delete" variant="danger" />
                                    
                                    <Link href={`/dashboard/teacher/assignments/${assignment.id}`}>
                                        <button className="ml-2 p-2 bg-slate-100 hover:bg-primary hover:text-white dark:bg-slate-800 dark:hover:bg-primary text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
                                            <ChevronRight size={16} strokeWidth={2.5} />
                                        </button>
                                    </Link>
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function IconButton({ onClick, icon: Icon, title, variant = 'default' }: { onClick?: () => void, icon: any, title: string, variant?: 'default' | 'danger' }) {
    return (
        <button
            onClick={(e) => { e.preventDefault(); onClick?.(); }}
            className={`p-2 rounded-xl transition-all ${
                variant === 'danger' ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-slate-400 hover:text-primary hover:bg-primary/5'
            }`}
            title={title}
        >
            <Icon size={16} strokeWidth={2.5} />
        </button>
    );
}
