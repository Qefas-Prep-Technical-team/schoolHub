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
    Filter,
    CalendarDays
} from 'lucide-react';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface AttendanceRecord {
    id: string;
    date: string;
    status: string;
    notes?: string;
    note?: string;
    class?: {
        name?: string;
    };
}

interface AttendanceListProps {
    records: AttendanceRecord[];
}

export default function AttendanceList({ records }: AttendanceListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ABSENT'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
                    const noteText = (record.notes || record.note || '').toLowerCase();
                    const className = (record.class?.name || '').toLowerCase();
                    if (!dateFormatted.includes(q) && !noteText.includes(q) && !className.includes(q)) {
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
                                content="Chronological record of every attendance roll call logged for you by subject teachers and class supervisors, including verified excuses and arrival timestamps."
                            />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} in total
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
                                    "px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap",
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
                                "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all",
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
                                "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all",
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
                        placeholder="Filter by date, day of week, or notes..."
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

                        return (
                            <div 
                                key={record.id || index}
                                className="bg-slate-50/60 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-4 flex flex-col justify-between hover:border-pink-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0 shadow-xs">
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

                                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
                                        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Teacher Remark / Note</p>
                                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 italic">
                                            {record.notes || record.note || 'Regular attendance logged'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                                    <span>Class Roll Call</span>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium">
                            {currentRecords.map((record, index) => {
                                const statusConfig = getStatusConfig(record.status);
                                const StatusIcon = statusConfig.icon;
                                const dateObj = new Date(record.date);

                                return (
                                    <tr key={record.id || index} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                                        <td className="px-4 py-3.5 text-center font-bold text-zinc-400">
                                            {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400 shrink-0">
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
                                            {record.notes || record.note || '—'}
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
        </div>
    );
}

