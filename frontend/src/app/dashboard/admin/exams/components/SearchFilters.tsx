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
        searchQuery?: string;
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80 group">
                <Search size={16} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Search assessments..."
                    className="h-10 pl-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium w-full focus:ring-2 focus:ring-blue-500/20"
                    value={filters.searchQuery || ''}
                    onChange={(val) => onFilterChange({ searchQuery: val })}
                />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                {isLoadingAny ? (
                    <div className="h-10 w-24 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                    <>
                        <Select
                            id="session"
                            value={filters.sessionId}
                            onChange={(val) => onFilterChange({ sessionId: val })}
                            options={sessionOptions}
                            className="h-10 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 px-4 min-w-[120px]"
                        />
                        <Select
                            id="term"
                            value={filters.term}
                            onChange={(val) => onFilterChange({ term: val })}
                            options={termOptions}
                            className="h-10 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 px-4 min-w-[110px]"
                        />
                        <Select
                            id="class"
                            value={filters.classId}
                            onChange={(val) => onFilterChange({ classId: val })}
                            options={classOptions}
                            className="h-10 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 px-4 min-w-[110px]"
                        />
                        
                        {!hideCategoryFilter && (
                            <Select
                                id="assessment-type"
                                value={filters.category}
                                onChange={(val) => onFilterChange({ category: val })}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'EXAM', label: 'Exam' },
                                    { value: 'QUIZ', label: 'Quiz' },
                                    { value: 'CA', label: 'CA' },
                                ]}
                                className="h-10 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 px-4 min-w-[110px]"
                            />
                        )}

                        <Button
                            variant="secondary"
                            className="h-10 px-4 rounded-full text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border-0"
                            onClick={() => onFilterChange({
                                sessionId: 'all', term: 'all', classId: 'all', departmentId: 'all', status: 'all', category: 'all'
                            })}
                        >
                            Clear
                        </Button>

                        {viewMode && onViewModeChange && (
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full h-10 ml-2">
                                <button 
                                    onClick={() => onViewModeChange('grid')}
                                    className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <LayoutGrid size={16} strokeWidth={2.5} />
                                </button>
                                <button 
                                    onClick={() => onViewModeChange('list')}
                                    className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    <List size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
