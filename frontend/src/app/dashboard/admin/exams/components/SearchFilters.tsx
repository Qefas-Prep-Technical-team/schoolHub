'use client';

import { Search, Loader2, LayoutGrid, List } from 'lucide-react';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { useQuery } from '@tanstack/react-query';
import { sessionService } from '@/lib/api/services/sessionService';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

interface SearchFiltersProps {
    filters: {
        sessionId: string;
        term: string;
        classId: string;
        departmentId: string;
        status: string;
        category: string;
    };
    onFilterChange: (newFilters: Partial<SearchFiltersProps['filters']>) => void;
    hideCategoryFilter?: boolean;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function SearchFilters({ filters, onFilterChange, hideCategoryFilter, viewMode, onViewModeChange }: SearchFiltersProps) {
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId;

    const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
        queryKey: ['sessions', schoolId],
        queryFn: async () => {
            try {
                const res = await apiClient.get(`/sessions?schoolId=${schoolId}`);
                const result = res.data?.data || res.data;
                return Array.isArray(result) ? result : [];
            } catch (err) {
                console.error("Error fetching sessions:", err);
                return [];
            }
        },
        enabled: !!schoolId,
    });

    const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
        queryKey: ['school-classes', schoolId],
        queryFn: async () => {
            try {
                const res = await apiClient.get(`/classes?schoolId=${schoolId}`);
                const result = res.data?.data || res.data;
                return Array.isArray(result) ? result : [];
            } catch (err) {
                console.error("Error fetching classes:", err);
                return [];
            }
        },
        enabled: !!schoolId,
    });

    const { data: departments = [], isLoading: isLoadingDepts } = useQuery({
        queryKey: ['school-departments', schoolId, filters.classId],
        queryFn: async () => {
            try {
                const classId = filters.classId !== 'all' ? filters.classId : undefined;
                const url = `/academic/departments?schoolId=${schoolId}${classId ? `&classId=${classId}` : ''}`;
                const res = await apiClient.get(url);
                const result = res.data?.data || res.data;
                return Array.isArray(result) ? result : [];
            } catch (err) {
                console.error("Error fetching departments:", err);
                return [];
            }
        },
        enabled: !!schoolId,
    });

    const sessionOptions = [
        { value: 'all', label: 'All Sessions' },
        ...(Array.isArray(sessions) ? sessions : []).map((s: any) => ({ value: s.id, label: s.name })),
    ];

    const termOptions = [
        { value: 'all', label: 'All Terms' },
        { value: 'FIRST', label: 'First Term' },
        { value: 'SECOND', label: 'Second Term' },
        { value: 'THIRD', label: 'Third Term' },
    ];

    const classOptions = [
        { value: 'all', label: 'All Classes' },
        ...(Array.isArray(classes) ? classes : []).map((c: any) => ({ value: c.id, label: `${c.name} ${c.section || ''}`.trim() })),
    ];

    const departmentOptions = [
        { value: 'all', label: 'All Depts' },
        ...(Array.isArray(departments) ? departments : []).map((d: any) => ({ value: d.id, label: d.name })),
    ];

    const isLoadingAny = isLoadingSessions || isLoadingClasses || isLoadingDepts;

    return (
        <div className="p-6 bg-blue-50/50 dark:bg-blue-950/10 rounded-[2rem] border-2 border-blue-500/20 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 items-end">
                <div className="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-7">
                    <label className="flex flex-col w-full">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3 ml-2 flex items-center gap-2">
                            <Search size={14} strokeWidth={3} /> Search Assessments
                        </span>
                        <div className="relative group">
                            <Input
                                placeholder="Search by Assessment Title, Subject, Teacher..."
                                className="h-14 rounded-2xl border-2 border-blue-200 dark:border-blue-800/50 focus:border-blue-500 focus:ring-blue-500/20 bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 shadow-sm pl-6"
                            />
                        </div>
                    </label>
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="session" className="block text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-2 ml-1">
                        Academic Session
                    </label>
                    <Select
                        id="session"
                        value={filters.sessionId}
                        onChange={(val) => onFilterChange({ sessionId: val })}
                        options={sessionOptions}
                        className="h-12 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/50 font-bold text-sm bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="term" className="block text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-2 ml-1">
                        Academic Term
                    </label>
                    <Select
                        id="term"
                        value={filters.term}
                        onChange={(val) => onFilterChange({ term: val })}
                        options={termOptions}
                        className="h-12 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/50 font-bold text-sm bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="class" className="block text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-2 ml-1">
                        Target Class
                    </label>
                    <Select
                        id="class"
                        value={filters.classId}
                        onChange={(val) => onFilterChange({ classId: val })}
                        options={classOptions}
                        className="h-12 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/50 font-bold text-sm bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="department" className="block text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-2 ml-1">
                        Department
                    </label>
                    <Select
                        id="department"
                        value={filters.departmentId}
                        onChange={(val) => onFilterChange({ departmentId: val })}
                        options={departmentOptions}
                        className="h-12 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/50 font-bold text-sm bg-white dark:bg-slate-900"
                    />
                </div>

                {!hideCategoryFilter && (
                    <div className="xl:col-span-1">
                        <label htmlFor="assessment-type" className="block text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-2 ml-1">
                            Type
                        </label>
                        <Select
                            id="assessment-type"
                            value={filters.category}
                            onChange={(val) => onFilterChange({ category: val })}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'EXAM', label: 'Exam' },
                                { value: 'QUIZ', label: 'Quiz' },
                                { value: 'CA', label: 'CA' },
                            ]}
                            className="h-12 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/50 font-bold text-sm bg-white dark:bg-slate-900"
                        />
                    </div>
                )}

                <div className="xl:col-span-1">
                    <label htmlFor="status" className="block text-[10px] font-black uppercase tracking-widest text-blue-500/70 mb-2 ml-1">
                        Status
                    </label>
                    <Select
                        id="status"
                        value={filters.status}
                        onChange={(val) => onFilterChange({ status: val })}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'DRAFT', label: 'Draft' },
                            { value: 'PUBLISHED', label: 'Published' },
                        ]}
                        className="h-12 rounded-xl border-2 border-blue-200/60 dark:border-blue-800/50 font-bold text-sm bg-white dark:bg-slate-900"
                    />
                </div>

                <div className="flex items-center gap-2 xl:col-span-1">
                    <Button
                        variant="secondary"
                        className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 shadow-md hover:-translate-y-0.5 transition-all"
                        onClick={() => onFilterChange({
                            sessionId: 'all',
                            term: 'all',
                            classId: 'all',
                            departmentId: 'all',
                            status: 'all',
                            category: 'all'
                        })}
                    >
                        Reset
                    </Button>
                </div>
                
                {viewMode && onViewModeChange && (
                    <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border-2 border-blue-200/60 dark:border-blue-800/50 rounded-xl h-12 shadow-inner">
                        <button 
                            onClick={() => onViewModeChange('grid')}
                            className={`flex-1 flex items-center justify-center h-full rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={() => onViewModeChange('list')}
                            className={`flex-1 flex items-center justify-center h-full rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                            title="List View"
                        >
                            <List size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            {isLoadingAny && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Loader2 size={12} className="animate-spin text-primary" />
                    Syncing filters with school data...
                </div>
            )}
        </div>
    );
}
