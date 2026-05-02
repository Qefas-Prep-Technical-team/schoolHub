'use client';

import { Search, Loader2 } from 'lucide-react';
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
}

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
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
        <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5 items-end">
                <div className="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-7">
                    <label className="flex flex-col w-full">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                            Search Assessments
                        </span>
                        <div className="relative group">
                            <Input
                                startIcon={<Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />}
                                placeholder="Search by Assessment Title, Subject, Teacher..."
                                className="h-12 rounded-2xl border-slate-200 focus:ring-primary/20"
                            />
                        </div>
                    </label>
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="session" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Academic Session
                    </label>
                    <Select
                        id="session"
                        value={filters.sessionId}
                        onChange={(val) => onFilterChange({ sessionId: val })}
                        options={sessionOptions}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="term" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Academic Term
                    </label>
                    <Select
                        id="term"
                        value={filters.term}
                        onChange={(val) => onFilterChange({ term: val })}
                        options={termOptions}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="class" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Target Class
                    </label>
                    <Select
                        id="class"
                        value={filters.classId}
                        onChange={(val) => onFilterChange({ classId: val })}
                        options={classOptions}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="department" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                        Department
                    </label>
                    <Select
                        id="department"
                        value={filters.departmentId}
                        onChange={(val) => onFilterChange({ departmentId: val })}
                        options={departmentOptions}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="assessment-type" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
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
                        ]}
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                <div className="xl:col-span-1">
                    <label htmlFor="status" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
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
                        className="h-12 rounded-2xl border-slate-200 font-bold text-sm bg-slate-50/50"
                    />
                </div>

                <div className="flex items-center gap-2 xl:col-span-1">
                    <Button
                        variant="secondary"
                        className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200 hover:bg-slate-50"
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

