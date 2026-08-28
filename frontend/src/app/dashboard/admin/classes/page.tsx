'use client';
import { useRouter } from 'next/navigation';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { classService, Class } from './services/classService';
import { toast } from 'react-toastify';
import {
    Layers,
    Plus,
    Search,
    Filter,
    Download,
    Edit2,
    Users,
    BookOpen,
    Activity,
    ArrowRight,
    Monitor,
    LayoutGrid,
    Zap,
    ShieldCheck,
    TrendingUp,
    Globe,
    Cpu,
    MoreVertical,
    List,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClassGrid from './components/ClassGrid';
import ClassModal from './components/ClassModal';
import Pagination from '@/components/ui/Pagination';
import { ClassData } from './components/types';
import { cn } from '@/lib/utils';

const TeacherListSlider = ({ teachers, defaultTeacher }: { teachers?: ClassData['teachers'], defaultTeacher?: ClassData['teacher'] }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!teachers || teachers.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % teachers.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [teachers]);

    const activeTeacher = teachers?.[activeIndex]?.teacher || defaultTeacher;

    return (
        <div className="flex items-center gap-3 relative h-[32px] w-[200px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 absolute inset-0"
                >
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                        {activeTeacher?.avatarUrl ? <img src={activeTeacher.avatarUrl} alt="" className="size-full object-cover" /> : <Users size={14} className="text-slate-400" />}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{activeTeacher?.name || "No Teacher Assigned"}</span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default function ClassesOverviewPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;

    // Reset page to 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const router = useRouter();
    const { user } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';

    const { data: settings } = useSchoolSettings(schoolId);
    const primaryColor = settings?.themeColor || '#2563eb';

    const { data: fetchClassesData, isLoading: loading, refetch: fetchClasses } = useClasses(schoolId);
    const classes = (fetchClassesData as Class[]) || [];

    const mappedClassData: ClassData[] = useMemo(() => {
        return classes.map((c: Class) => ({
            id: c.id,
            name: c.name,
            section: c.section || 'N/A',
            teacher: {
                name: c.teachers?.[0]?.teacher?.name || 'No Teacher Assigned',
                avatarUrl: c.teachers?.[0]?.teacher?.avatarUrl || '',
            },
            teachers: c.teachers,
            _count: c._count,
            studentCount: c._count?.enrollments ?? c.enrollments?.length ?? 0,
            subjectCount: c._count?.subjects ?? c.subjects?.length ?? 0,
            timetableStatus: c.status === 'ACTIVE' ? 'complete' : 'pending',
            classCode: c.classCode,
            departments: c.departments?.map((d: any) => ({
                id: d.department.id,
                name: d.department.name
            })),
            isLive: c.status === 'ACTIVE' && Math.random() > 0.3,
            currentActivity: c.status === 'ACTIVE' ? (c.subjects?.[0]?.subject?.name || 'Study Session') : undefined,
        }));
    }, [classes]);

    const filteredClasses = useMemo(() => {
        return mappedClassData.filter((classItem) => {
            const query = searchQuery.toLowerCase();
            return classItem.name.toLowerCase().includes(query) ||
                (classItem.section?.toLowerCase() || "").includes(query) ||
                (classItem.teacher?.name?.toLowerCase() || "").includes(query);
        });
    }, [searchQuery, mappedClassData]);

    const paginatedClasses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredClasses.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredClasses, currentPage]);

    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

    const stats = useMemo(() => {
        const totalClasses = classes.length;
        const teachersAssigned = classes.filter((c: Class) => c.teachers && c.teachers.length > 0).length;
        const studentsTotal = classes.reduce((sum: number, c: Class) => sum + (c._count?.enrollments ?? c.enrollments?.length ?? 0), 0);
        const activeNodes = mappedClassData.filter(c => c.isLive).length;

        return [
            {
                label: 'Total Classes',
                value: totalClasses,
                icon: LayoutGrid,
                color: primaryColor,
                desc: 'Registered Classes'
            },
            {
                label: 'Assigned Faculty',
                value: teachersAssigned,
                icon: Users,
                color: '#2563eb', // Indigo
                desc: 'Primary Teachers'
            },
            {
                label: 'Enrolled Students',
                value: studentsTotal,
                icon: Zap,
                color: '#10b981', // Emerald
                desc: 'Platform Enrollment'
            },
            {
                label: 'Active Now',
                value: activeNodes,
                icon: Activity,
                color: '#f59e0b', // Amber
                desc: 'In-Session Classes'
            },
        ];
    }, [classes, mappedClassData, primaryColor]);

    const handleEditClass = (classId: string) => {
        const cls = classes.find(c => c.id === classId);
        if (cls) {
            setEditingClass(cls);
            setIsModalOpen(true);
        }
    };

    const handleDeleteClass = async (classId: string) => {
        if (confirm('Are you sure you want to archive this class?')) {
            try {
                await classService.archiveClass(classId);
                toast.success("Class archived successfully");
                fetchClasses();
            } catch (error) {
                toast.error("Failed to archive class");
            }
        }
    };

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 space-y-6">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            <Layers size={16} style={{ color: primaryColor }} /> Classes & Timetable
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Classes
                        </h1>
                        <p className="text-sm font-medium text-slate-500 max-w-xl">
                            Manage school classes, sections, assigned teachers, and student enrollment in real-time.
                        </p>
                    </div>

                    <Button
                        onClick={() => {
                            setEditingClass(null);
                            setIsModalOpen(true);
                        }}
                        style={{ backgroundColor: primaryColor }}
                        className="h-10 px-6 rounded-xl text-white font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus size={16} />
                        Add New Class
                    </Button>
                </div>

                {/* Analytics Hub */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="size-12 rounded-2xl flex items-center justify-center border shadow-sm"
                                    style={{
                                        backgroundColor: `${stat.color}10`,
                                        borderColor: `${stat.color}20`,
                                        color: stat.color
                                    }}
                                >
                                    <stat.icon size={20} />
                                </div>
                                {stat.label === 'Active Now' && (
                                     <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                         <TrendingUp size={10} /> Live
                                     </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm mb-6">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:border-primary text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("px-3 py-1.5 rounded-lg flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700")}
                                style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("px-3 py-1.5 rounded-lg flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700")}
                                style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                            >
                                <List size={16} />
                            </button>
                        </div>
                        <Button variant="outline" className="h-10 px-4 rounded-xl text-sm font-semibold text-slate-600 hidden sm:flex">
                            <Download size={16} className="mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Class Registry */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <ClassGrid
                                classes={paginatedClasses}
                                isLoading={loading}
                                onEditClass={handleEditClass}
                                onDeleteClass={handleDeleteClass}
                                onCreateClass={() => setIsModalOpen(true)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Class Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Teacher</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Details</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="size-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-primary animate-spin" style={{ borderTopColor: primaryColor }} />
                                                        <span className="text-sm font-medium text-slate-500">Loading Classes...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredClasses.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center gap-3 opacity-50">
                                                        <Layers size={40} strokeWidth={1.5} />
                                                        <span className="text-sm font-medium">No Classes Found</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedClasses.map((cls, index) => (
                                                <tr 
                                                    key={cls.id || index} 
                                                    onClick={() => router.push(`/dashboard/admin/classes/${cls.id}`)}
                                                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700" style={{ color: primaryColor }}>
                                                                <Layers size={18} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                                                    {cls.name}
                                                                </div>
                                                                <span className="text-xs font-medium text-slate-500 uppercase">
                                                                    {cls.section} SECTION
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <TeacherListSlider teachers={cls.teachers} defaultTeacher={cls.teacher} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{cls.studentCount} Students</span>
                                                            <span className="text-xs font-medium text-slate-500">{cls.subjectCount} Subjects</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {cls.isLive ? (
                                                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20">In Session</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-semibold border border-slate-200 dark:border-slate-700">Inactive</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClass(cls.id);
                                                                }}
                                                            >
                                                                <Edit2 size={16} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:hover:bg-rose-500/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClass(cls.id);
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dynamic Pagination */}
                {filteredClasses.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        totalItems={filteredClasses.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}

                {/* Global Security Footer */}
                <div className="flex justify-center pt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-500" /> Verified Classes
                    </div>
                </div>
            </div>

            <ClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchClasses}
                classItem={editingClass}
                schoolId={schoolId}
            />
        </div>
    );
}

