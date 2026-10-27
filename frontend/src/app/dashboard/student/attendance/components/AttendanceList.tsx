"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    LayoutGrid, 
    List, 
    CalendarDays,
    Eye
} from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import StudentAttendanceDetailModal from '@/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal';
import { AttendanceRecord as ModalAttendanceRecord, ClassSubjectItem, AttendanceStatus } from '@/app/dashboard/admin/classes/[id]/components/attendance/components/types';

export interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    notes?: string;
    note?: string;
    comment?: string;
    subjects?: Record<string, unknown>;
    classId?: string;
    class?: {
        id?: string;
        name?: string;
        subjects?: unknown[];
    };
    student?: {
        id?: string;
        name?: string;
        studentCode?: string;
        departmentId?: string | null;
        department?: {
            id: string;
            name: string;
            code?: string;
        } | null;
    };
    studentId?: string;
    recordedByName?: string;
    recordedByRole?: string;
    submittedBy?: string;
    submittedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AttendanceListProps {
    records: AttendanceRecord[];
}

export function parseAttendanceNoteAndSubjects(
    rawNote?: string | null,
    existingSubjects?: Record<string, unknown> | null
): { comment: string; subjects: Record<string, unknown> } {
    let comment = '';
    let subjects: Record<string, unknown> = { ...(existingSubjects || {}) };

    if (!rawNote || typeof rawNote !== 'string') {
        return { comment: '', subjects };
    }

    let text = rawNote.trim();

    while (text.startsWith('{') && text.endsWith('}')) {
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === 'object') {
                if (parsed.subjects && typeof parsed.subjects === 'object') {
                    subjects = { ...subjects, ...parsed.subjects };
                }
                if (typeof parsed.comment === 'string') {
                    text = parsed.comment.trim();
                    continue;
                } else if (typeof parsed.note === 'string') {
                    text = parsed.note.trim();
                    continue;
                }
            }
            text = '';
            break;
        } catch {
            break;
        }
    }

    comment = text;
    return { comment, subjects };
}

export default function AttendanceList({ records }: AttendanceListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Detail Inspection Modal State
    const [selectedRecord, setSelectedRecord] = useState<ModalAttendanceRecord | null>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<ClassSubjectItem[]>([]);
    const [classNameLabel, setClassNameLabel] = useState<string>("Class");

    const itemsPerPage = 9;

    // Default to grid on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setViewMode('grid');
        }
    }, []);

    // Filter and sort records
    const filteredRecords = useMemo(() => {
        return [...records]
            .filter((record) => {
                const status = (record.status || '').toUpperCase();
                if (statusFilter !== 'ALL' && status !== statusFilter) return false;

                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    const dateFormatted = format(new Date(record.date), 'MMMM dd yyyy EEEE').toLowerCase();
                    const { comment: cleanComment, subjects: parsedSubjects } = parseAttendanceNoteAndSubjects(
                        record.notes || record.note || record.comment,
                        record.subjects
                    );
                    const subjectNames = Object.values(parsedSubjects)
                        .map((s: unknown) => (s as { subjectName?: string })?.subjectName || '')
                        .join(' ')
                        .toLowerCase();
                    const className = (record.class?.name || '').toLowerCase();
                    if (!dateFormatted.includes(q) && !cleanComment.toLowerCase().includes(q) && !className.includes(q) && !subjectNames.includes(q)) {
                        return false;
                    }
                }
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [records, statusFilter, searchQuery]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
    const currentRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusConfig = (statusRaw?: string) => {
        const s = (statusRaw || '').toUpperCase();
        if (s === 'PRESENT') {
            return {
                label: 'Present',
                icon: CheckCircle2,
                badgeClasses: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40',
                iconColor: 'text-emerald-500'
            };
        }
        if (s === 'LATE') {
            return {
                label: 'Late',
                icon: Clock,
                badgeClasses: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
                iconColor: 'text-amber-500'
            };
        }
        return {
            label: 'Absent',
            icon: XCircle,
            badgeClasses: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40',
            iconColor: 'text-rose-500'
        };
    };

    const handleInspectRecord = (record: AttendanceRecord) => {
        const { comment: cleanComment, subjects: parsedSubjects } = parseAttendanceNoteAndSubjects(
            record.notes || record.note || record.comment,
            record.subjects
        );

        const rawStatus = (record.status ? record.status.toLowerCase() : 'present');
        const normalizedStatus: AttendanceStatus = ['present', 'absent', 'late', 'excused'].includes(rawStatus)
            ? (rawStatus as AttendanceStatus)
            : 'present';

        const subjectsMap = new Map<string, ClassSubjectItem>();

        if (record.class?.subjects && Array.isArray(record.class.subjects)) {
            record.class.subjects.forEach((csItem: unknown) => {
                const cs = csItem as {
                    id?: string;
                    name?: string;
                    code?: string;
                    subject?: {
                        id: string;
                        name: string;
                        code?: string;
                        departments?: Array<{ departmentId?: string; department?: { id?: string; name?: string } }>;
                    };
                    departments?: Array<{ departmentId?: string; department?: { id?: string; name?: string } }>;
                };
                const s = cs.subject || cs;
                if (s && s.id && s.name) {
                    const depts = s.departments || [];
                    const departmentIds: string[] = depts
                        .map((d) => d.departmentId || d.department?.id)
                        .filter((id): id is string => Boolean(id));
                    const departmentNames: string[] = depts
                        .map((d) => d.department?.name)
                        .filter((name): name is string => Boolean(name));
                    subjectsMap.set(s.id, {
                        id: s.id,
                        name: s.name,
                        code: s.code || "",
                        departmentIds,
                        departmentNames,
                    });
                }
            });
        }

        Object.values(parsedSubjects).forEach((subItem: unknown) => {
            const sub = subItem as { subjectId?: string; subjectName?: string; subjectCode?: string };
            if (sub?.subjectId && !subjectsMap.has(sub.subjectId)) {
                subjectsMap.set(sub.subjectId, {
                    id: sub.subjectId,
                    name: sub.subjectName || "Subject",
                    code: sub.subjectCode || "",
                    departmentIds: [],
                    departmentNames: [],
                });
            }
        });

        const classSubjectsList = Array.from(subjectsMap.values());
        const dateFormatted = record.date ? (typeof record.date === 'string' ? record.date.split('T')[0] : '') : '';

        setSelectedSubjects(classSubjectsList);
        setClassNameLabel(record.class?.name || "Class Roll Call");
        setSelectedRecord({
            id: record.id || `rec-${record.date}`,
            studentId: record.studentId || record.student?.id || '',
            studentName: record.student?.name || 'Student',
            studentCode: record.student?.studentCode || '-',
            classId: record.classId || record.class?.id || '',
            className: record.class?.name || 'Class',
            departmentId: record.student?.departmentId || record.student?.department?.id || null,
            department: record.student?.department || null,
            status: normalizedStatus,
            comment: cleanComment,
            note: cleanComment,
            date: dateFormatted || record.date,
            subjects: parsedSubjects as ModalAttendanceRecord['subjects'],
            submittedBy: record.submittedBy || record.recordedByName || 'Staff',
            submittedAt: record.submittedAt || record.createdAt || new Date().toISOString(),
            recordedByName: record.recordedByName,
            recordedByRole: record.recordedByRole,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">Attendance Log</h3>
                            <HeaderTooltip 
                                content="Chronological record of every attendance roll call logged for you by subject teachers and class supervisors, including verified excuses and arrival timestamps. Click any record to inspect subject breakdown."
                            />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} in total • Click any card or row to preview details
                        </p>
                    </div>
                </div>

                {/* Filter and View Mode Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 overflow-x-auto scrollbar-hide">
                        {(['ALL', 'PRESENT', 'LATE', 'ABSENT'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap cursor-pointer",
                                    statusFilter === filter
                                        ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                )}
                            >
                                {filter.toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 shrink-0 self-end sm:self-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                            className={cn(
                                "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                                viewMode === 'grid'
                                    ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">Grid</span>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            aria-label="Table view"
                            className={cn(
                                "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer",
                                viewMode === 'table'
                                    ? "bg-white dark:bg-zinc-800 text-pink-600 dark:text-pink-400 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            )}
                        >
                            <List className="w-4 h-4" />
                            <span className="hidden sm:inline">Table</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 sm:p-4 bg-slate-50/60 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                        type="text"
                        placeholder="Filter by date, day of week, or notes/subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs sm:text-sm focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500"
                    />
                </div>
            </div>
            
            {/* Body: Grid vs Table */}
            {currentRecords.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                        <Calendar size={22} />
                    </div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No attendance entries found</p>
                    <p className="text-xs text-zinc-400 mt-1">
                        {searchQuery ? "Try clearing your search query." : "No records recorded under this category."}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {currentRecords.map((record, index) => {
                        const statusConfig = getStatusConfig(record.status);
                        const StatusIcon = statusConfig.icon;
                        const dateObj = new Date(record.date);
                        const { comment: cleanComment, subjects: parsedSubjects } = parseAttendanceNoteAndSubjects(
                            record.notes || record.note || record.comment,
                            record.subjects
                        );
                        const subjectList = Object.values(parsedSubjects) as Array<{
                            subjectId: string;
                            subjectName?: string;
                            status?: string;
                        }>;

                        return (
                            <div 
                                key={record.id || index}
                                onClick={() => handleInspectRecord(record)}
                                className="group bg-slate-50/60 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-4 flex flex-col justify-between hover:border-pink-300 dark:hover:border-pink-500/50 hover:shadow-md transition-all cursor-pointer shadow-xs"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                    {format(dateObj, 'MMM dd, yyyy')}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                                    {format(dateObj, 'EEEE')}
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${statusConfig.badgeClasses}`}>
                                            <StatusIcon size={11} />
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-2">
                                        <div>
                                            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Teacher Remark / Note</p>
                                            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 italic">
                                                {cleanComment || (subjectList.length > 0 ? `${subjectList.length} subject session${subjectList.length > 1 ? 's' : ''} logged` : 'Regular attendance logged')}
                                            </p>
                                        </div>

                                        {/* Subject attendance pills */}
                                        {subjectList.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {subjectList.map((sub) => {
                                                    const subStatus = (sub.status || 'present').toLowerCase();
                                                    return (
                                                        <span
                                                            key={sub.subjectId}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                        >
                                                            <span className="truncate max-w-[110px]">{sub.subjectName || "Subject"}</span>
                                                            <span className={`font-black uppercase text-[9px] ${
                                                                subStatus === 'present' ? 'text-emerald-600 dark:text-emerald-400' :
                                                                subStatus === 'late' ? 'text-amber-600 dark:text-amber-400' :
                                                                subStatus === 'absent' ? 'text-rose-600 dark:text-rose-400' :
                                                                'text-sky-600 dark:text-sky-400'
                                                            }`}>
                                                                ({subStatus})
                                                            </span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                                    <span className="flex items-center gap-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors font-medium">
                                        <Eye size={12} />
                                        <span>Click to inspect</span>
                                    </span>
                                    <span>#{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-12">#</th>
                                <th className="px-4 py-3.5">Date & Day</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-4 py-3.5">Notes / Remarks</th>
                                <th className="px-4 py-3.5 text-right w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                            {currentRecords.map((record, index) => {
                                const statusConfig = getStatusConfig(record.status);
                                const StatusIcon = statusConfig.icon;
                                const dateObj = new Date(record.date);
                                const { comment: cleanComment, subjects: parsedSubjects } = parseAttendanceNoteAndSubjects(
                                    record.notes || record.note || record.comment,
                                    record.subjects
                                );
                                const subjectList = Object.values(parsedSubjects) as Array<{
                                    subjectId: string;
                                    subjectName?: string;
                                    status?: string;
                                }>;

                                return (
                                    <tr 
                                        key={record.id || index} 
                                        onClick={() => handleInspectRecord(record)}
                                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-4 py-3.5 text-center font-bold text-zinc-400">
                                            {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                                                    <Calendar size={15} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                                                        {format(dateObj, 'MMMM dd, yyyy')}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                        {format(dateObj, 'EEEE')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.badgeClasses}`}>
                                                <StatusIcon size={12} />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                                            <div className="space-y-1">
                                                <p className="italic">
                                                    {cleanComment || (subjectList.length > 0 ? `${subjectList.length} subject session${subjectList.length > 1 ? 's' : ''} logged` : '—')}
                                                </p>
                                                {subjectList.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {subjectList.map((sub) => (
                                                            <span key={sub.subjectId} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                                {sub.subjectName} ({sub.status})
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                            <button 
                                                type="button" 
                                                className="text-pink-600 dark:text-pink-400 text-xs font-bold px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 inline-flex items-center gap-1 cursor-pointer group-hover:bg-pink-600 group-hover:text-white transition-colors"
                                            >
                                                <Eye size={12} />
                                                <span>Inspect</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Pagination with Pink Theme */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRecords.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        theme="pink"
                    />
                </div>
            )}

            {/* Student Preview Modal */}
            <StudentAttendanceDetailModal
                isOpen={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                record={selectedRecord}
                classSubjects={selectedSubjects}
                classNameLabel={classNameLabel}
                readOnly={true}
            />
        </div>
    );
}
