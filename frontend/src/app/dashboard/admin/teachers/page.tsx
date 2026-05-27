"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { apiClient } from '@/lib/api/client'
import { useSchoolTeachers, useSchoolSettings } from '@/lib/api/hooks/useSchool'
import { useMarkBulkTeacherAttendance, useSchoolTeacherAttendanceByDate, useSchoolTeacherAttendanceTrend } from '@/lib/api/hooks/useAdmin'
import { AddTeacherModal } from './components/AddTeacherModal'
import { BulkAttendanceModal, TeacherAttendanceRecord } from './components/BulkAttendanceModal'
import { BulkAttendanceModeModal } from './components/BulkAttendanceModeModal'
import { BulkAttendanceSwipeModal } from './components/BulkAttendanceSwipeModal'
import { toast } from 'react-toastify'
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
    Users,
    UserPlus,
    Search,
    ShieldCheck,
    Zap,
    Activity,
    ArrowRight,
    Download,
    Mail,
    ChevronRight,
    TrendingUp,
    LayoutGrid,
    List,
    ChevronLeft,
    Edit2,
    ClipboardList,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EditTeacherModal } from './components/EditTeacherModal'

export default function ManageTeachersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [currentPage, setCurrentPage] = useState(0)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAttendanceModeModalOpen, setIsAttendanceModeModalOpen] = useState(false)
    const [isAttendanceListModalOpen, setIsAttendanceListModalOpen] = useState(false)
    const [isAttendanceSwipeModalOpen, setIsAttendanceSwipeModalOpen] = useState(false)
    const [attendanceTargetDate, setAttendanceTargetDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState<any>(null)
    const itemsPerPage = 12
    const router = useRouter()
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ''

    const { data: teachersData, isLoading, refetch: refetchTeachers } = useSchoolTeachers(schoolId)
    const { mutate: markBulkAttendance, isPending: isSavingAttendance } = useMarkBulkTeacherAttendance(schoolId)
    const { data: existingAttendance } = useSchoolTeacherAttendanceByDate(schoolId, attendanceTargetDate)
    const { data: settings } = useSchoolSettings(schoolId)
    const { data: subUsage } = useSubscriptionUsage()
    const { data: rawTrendData } = useSchoolTeacherAttendanceTrend(schoolId, 5)
    const primaryColor = settings?.themeColor || '#2563eb'

    const attendanceTrend = useMemo(() => {
        if (rawTrendData && rawTrendData.length > 0) {
            return rawTrendData;
        }
        
        const total = teachersData?.length || 0;
        if (total === 0) {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => ({ day, present: 0, absent: 0, late: 0 }));
        }
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
            const absent = Math.min(total, Math.floor((day.charCodeAt(0) % 5) + (total * 0.05)));
            return { day, present: total - absent, absent, late: 0 };
        });
    }, [teachersData?.length, rawTrendData]);

    const teachersList = useMemo(() => {
        if (!teachersData || !Array.isArray(teachersData)) return []
        return teachersData.map((t: any) => ({
            id: t.id,
            teacherCode: t.teacherCode,
            code: t.teacherCode || 'UNASSIGNED',
            name: t.name,
            email: t.email || 'No Email Registered',
            subjects: t.teacherSubjects?.map((ts: any) => ts.subject.name) || [],
            classes: t.classTeachers?.map((ct: any) => ct.class.name) || [],
            status: t.verified ? 'active' : 'pending',
            isClaimed: t.isClaimed,
            primarySchoolId: t.primarySchoolId,
            profileImage: t.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40&fontWeight=900`
        }))
    }, [teachersData])

    const filteredTeachers = useMemo(() => {
        return teachersList.filter(teacher =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.subjects.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }, [searchTerm, teachersList])

    const handleResendEmail = async (teacherId: string) => {
        try {
            const res = await apiClient.post(`/admin/teachers/${teacherId}/resend-claim-email`);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to resend email");
        }
    };

    const downloadCsv = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExportModalOpen(false);
    };

    const exportTeacherProfiles = () => {
        const headers = ["Name", "Email", "Faculty ID", "Subjects", "Classes", "Status"];
        const csvContent = [
            headers.join(","),
            ...filteredTeachers.map(t => [
                `"${t.name.replace(/"/g, '""')}"`,
                `"${t.email.replace(/"/g, '""')}"`,
                `"${t.teacherCode || 'UNASSIGNED'}"`,
                `"${t.subjects.join(', ').replace(/"/g, '""')}"`,
                `"${t.classes.join(', ').replace(/"/g, '""')}"`,
                `"${t.status}"`
            ].join(","))
        ].join("\n");
        downloadCsv(csvContent, `teachers_profiles_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const exportAttendanceData = () => {
        const headers = ["Name", "Teacher ID", "Date", "Status", "Time In", "Time Out", "Remarks"];
        const records = existingAttendance?.data || [];
        const csvContent = [
            headers.join(","),
            ...records.map((r: any) => [
                `"${r.teacher?.name?.replace(/"/g, '""') || ''}"`,
                `"${r.teacher?.teacherCode || ''}"`,
                `"${new Date(r.date).toLocaleDateString()}"`,
                `"${r.status}"`,
                `"${r.timeIn || 'N/A'}"`,
                `"${r.timeOut || 'N/A'}"`,
                `"${r.remarks?.replace(/"/g, '""') || ''}"`
            ].join(","))
        ].join("\n");
        downloadCsv(csvContent, `teachers_attendance_${attendanceTargetDate}.csv`);
    };

    const handleSaveBulkAttendance = (records: TeacherAttendanceRecord[], date: string) => {
        markBulkAttendance(
            { schoolId, records: records.map(r => ({ ...r, date })) },
            { 
                onSuccess: () => {
                    setIsAttendanceListModalOpen(false)
                    setIsAttendanceSwipeModalOpen(false)
                } 
            }
        );
    };

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
    const paginatedTeachers = filteredTeachers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

    const uniqueSubjects = new Set(teachersList.flatMap(t => t.subjects));

    const stats = [
        {
            label: 'Total Teachers',
            value: teachersList.length,
            icon: Users,
            color: primaryColor,
            desc: 'Registered Teachers'
        },
        {
            label: 'Verified Teachers',
            value: teachersList.filter(t => t.status === 'active').length,
            icon: ShieldCheck,
            color: '#10b981',
            desc: 'Active Accounts'
        },
        {
            label: 'Total Subjects',
            value: uniqueSubjects.size,
            icon: Activity,
            color: '#2563eb',
            desc: 'Subjects Covered'
        },
        {
            label: 'Pending Teachers',
            value: teachersList.filter(t => t.status === 'pending').length,
            icon: Zap,
            color: '#f59e0b',
            desc: 'Awaiting Verification'
        },
    ]

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4 md:p-10 transition-colors duration-500 relative">
            <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-12">
            
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8 px-4 md:px-0">
                    <div className="space-y-3 md:space-y-4 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 mx-auto lg:mx-0">
                            <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Teacher Management</span>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight md:leading-[0.9]">
                                Teachers<span style={{ color: primaryColor }}>.</span>
                            </h1>
                            <p className="mt-2 md:mt-4 text-sm md:text-lg font-medium text-slate-500 max-w-xl mx-auto lg:mx-0">
                                Manage all school teachers, their assigned subjects, and verify new teacher accounts.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Button
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            className="h-14 md:h-16 w-full sm:w-auto px-6 md:px-8 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest gap-3 hover:scale-105 active:scale-95 transition-all border-0 text-[10px] md:text-sm"
                            onClick={() => setIsAttendanceModeModalOpen(true)}
                        >
                            <ClipboardList size={18} strokeWidth={3} />
                            Take Attendance
                        </Button>
                        <Button
                            disabled={subUsage?.limits?.teachers !== -1 && (subUsage?.usage?.teachers || teachersList.length) >= (subUsage?.limits?.teachers || 0)}
                            style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}4D`, opacity: (subUsage?.limits?.teachers !== -1 && (subUsage?.usage?.teachers || teachersList.length) >= (subUsage?.limits?.teachers || 0)) ? 0.5 : 1 }}
                            className="h-14 md:h-16 w-full sm:w-auto px-6 md:px-10 rounded-2xl md:rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 hover:scale-105 active:scale-95 transition-all border-0 text-[10px] md:text-sm disabled:cursor-not-allowed disabled:hover:scale-100"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <UserPlus size={18} strokeWidth={3} />
                            {(subUsage?.limits?.teachers !== -1 && (subUsage?.usage?.teachers || teachersList.length) >= (subUsage?.limits?.teachers || 0)) ? 'Limit Reached' : 'Add New Teacher'}
                        </Button>
                    </div>
                </div>

                {/* Analytics Hub */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 px-4 md:px-0">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-6 md:p-10 rounded-2xl md:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 space-y-4 md:space-y-6">
                                <Skeleton className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16 md:w-24" />
                                    <Skeleton className="h-8 md:h-12 w-12 md:w-20" />
                                </div>
                            </div>
                        ))
                        : stats.map((stat, index) => (
                            <div
                                key={index}
                                className="p-5 md:p-10 rounded-2xl md:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 relative overflow-hidden group transition-all"
                                style={{ boxShadow: `0 15px 30px -12px ${stat.color}10` }}
                            >
                                <div
                                    className="absolute -right-4 md:-right-6 -bottom-4 md:-bottom-6 size-24 md:size-40 rounded-full blur-2xl md:blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"
                                    style={{ backgroundColor: stat.color }}
                                />
                                <div className="relative z-10 space-y-4 md:space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110"
                                            style={{
                                                backgroundColor: `${stat.color}10`,
                                                borderColor: `${stat.color}20`,
                                                color: stat.color
                                            }}
                                        >
                                            <stat.icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <TrendingUp size={10} /> Live
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5 md:mb-1">{stat.label}</p>
                                        <h3 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                                            {stat.value}
                                        </h3>
                                        <p className="hidden md:flex text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest items-center gap-2">
                                            <Zap size={12} className="text-slate-300" /> {stat.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 px-4 md:px-0">
                    {/* Attendance Chart */}
                    <div className="lg:col-span-2 p-5 md:p-8 rounded-2xl md:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 space-y-6 relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Attendance Trend</h3>
                                <p className="text-sm text-slate-500 font-medium">Weekly teacher presence</p>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                        labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                                    />
                                    <Line type="monotone" dataKey="present" name="Present" stroke={primaryColor} strokeWidth={4} dot={{ r: 4, fill: primaryColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={3} dot={{ r: 3, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} opacity={0.5} />
                                    <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} opacity={0.7} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subscription Limits */}
                    <div className="p-5 md:p-8 rounded-2xl md:rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 space-y-6 relative flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Teacher Quota</h3>
                            <p className="text-sm text-slate-500 font-medium">Current plan limits</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">{subUsage?.usage?.teachers || teachersList.length}</span>
                                    <span className="text-slate-500 font-bold ml-2 uppercase text-xs">Used</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-slate-400">{subUsage?.limits?.teachers === -1 ? '∞' : subUsage?.limits?.teachers || 0}</span>
                                    <span className="text-slate-500 font-bold ml-1 uppercase text-xs">Limit</span>
                                </div>
                            </div>
                            
                            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ 
                                        width: `${subUsage?.limits?.teachers === -1 ? 100 : Math.min(100, ((subUsage?.usage?.teachers || teachersList.length) / (subUsage?.limits?.teachers || 1)) * 100)}%`,
                                        backgroundColor: primaryColor 
                                    }}
                                />
                            </div>
                            
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Activity size={12} />
                                {subUsage?.limits?.teachers === -1 
                                    ? "Unlimited Teachers Available" 
                                    : `${Math.max(0, (subUsage?.limits?.teachers || 0) - (subUsage?.usage?.teachers || teachersList.length))} seats remaining`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 md:gap-6 p-3 md:p-4 rounded-2xl md:rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 mx-4 md:mx-0">
                    <div className="relative group flex-1">
                        <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(0)
                            }}
                            className="w-full h-12 md:h-16 pl-12 md:pl-16 pr-5 md:pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-xl md:rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-sm md:text-base text-slate-700 dark:text-slate-200"
                            style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                        />
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 justify-between sm:justify-end">
                        <div className="flex bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-xl md:rounded-2xl p-1 md:p-1.5 shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("size-10 md:size-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-slate-50 dark:bg-white/10 shadow-inner" : "text-slate-400 hover:text-slate-600")}
                                style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                            >
                                <LayoutGrid size={18} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("size-10 md:size-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-slate-50 dark:bg-white/10 shadow-inner" : "text-slate-400 hover:text-slate-600")}
                                style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                            >
                                <List size={18} strokeWidth={3} />
                            </button>
                        </div>
                        <Button 
                            onClick={() => setIsExportModalOpen(true)}
                            variant="outline" 
                            className="h-12 md:h-16 px-4 md:px-8 rounded-xl md:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        >
                            <Download size={18} strokeWidth={3} className="text-slate-400" />
                        </Button>
                    </div>
                </div>

                {/* Teacher Registry */}
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
                        >
                            {isLoading ? (
                                [1, 2, 3].map(i => <Skeleton key={i} className="h-[300px] md:h-[400px] rounded-none md:rounded-[4rem] bg-slate-50 dark:bg-white/5" />)
                            ) : paginatedTeachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border-y md:border border-slate-100 dark:border-white/5 rounded-none md:rounded-[4rem] p-6 md:p-10 md:hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                                    style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
                                    onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}
                                >
                                    <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: primaryColor }} />

                                    <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                                        <div
                                            className="size-20 md:size-24 rounded-2xl md:rounded-[2.5rem] overflow-hidden border-2 md:border-4 border-white dark:border-slate-800 md:group-hover:scale-110 transition-transform duration-500"
                                            style={{ boxShadow: `0 15px 20px -5px ${primaryColor}22` }}
                                        >
                                            <img src={teacher.profileImage} alt={teacher.name} className="size-full object-cover" />
                                        </div>
                                        <div className={cn(
                                            "px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border",
                                            teacher.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                        )}>
                                            {teacher.status}
                                        </div>
                                    </div>

                                    <div className="flex-1 relative z-10">
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1.5 md:mb-2 leading-tight md:leading-[0.9] capitalize tracking-tighter">
                                            {teacher.name}
                                        </h3>
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-8">{teacher.email}</p>

                                        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-10">
                                            {teacher.subjects.slice(0, 3).map((subject: string, i: number) => (
                                                <span key={i} className="text-[8px] md:text-[9px] font-black bg-slate-50 dark:bg-white/5 text-slate-500 px-2.5 md:px-3 py-1 rounded-md md:rounded-lg border border-slate-100 dark:border-white/10 uppercase tracking-tighter">
                                                    {subject}
                                                </span>
                                            ))}
                                            {teacher.subjects.length > 3 && (
                                                <span className="text-[8px] md:text-[9px] font-black bg-slate-50 dark:bg-white/5 text-slate-400 px-2.5 md:px-3 py-1 rounded-md md:rounded-lg border border-slate-100 dark:border-white/10 uppercase tracking-tighter">
                                                    +{teacher.subjects.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 md:pt-8 border-t border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty ID</span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{teacher.teacherCode || 'UNASSIGNED'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 justify-between md:justify-end">
                                            <div className="flex items-center gap-2">
                                                {teacher.status === 'pending' && teacher.isClaimed === false && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); handleResendEmail(teacher.id); }}
                                                        className="h-8 px-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-all border border-amber-100 dark:border-amber-500/20"
                                                    >
                                                        <Mail size={12} className="mr-1.5" />
                                                        Resend
                                                    </Button>
                                                )}
                                                {teacher.primarySchoolId === schoolId && !teacher.isClaimed && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); setEditingTeacher(teacher); }}
                                                        className="h-8 px-3 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-white/5 text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10"
                                                    >
                                                        <Edit2 size={12} className="mr-1.5" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all" style={{ color: primaryColor }}>
                                                <span className="hidden sm:inline">Access Profile</span>
                                                <ArrowRight size={14} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-slate-950 border-y md:border border-slate-100 dark:border-white/5 rounded-none md:rounded-[4rem] overflow-hidden transition-all"
                            style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
                        >
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                            <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel</th>
                                            <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialization</th>
                                            <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID HASH</th>
                                            <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Status</th>
                                            <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-40 text-center">
                                                    <div className="flex flex-col items-center gap-6">
                                                        <div className="size-12 md:size-16 rounded-full border-4 border-slate-100 dark:border-white/5 animate-spin" style={{ borderTopColor: primaryColor }} />
                                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading teachers...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paginatedTeachers.map((teacher) => (
                                            <tr key={teacher.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer" onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}>
                                                <td className="px-6 md:px-10 py-6 md:py-8">
                                                    <div className="flex items-center gap-4 md:gap-6">
                                                        <div className="size-12 md:size-16 rounded-2xl md:rounded-3xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg md:group-hover:scale-110 transition-transform">
                                                            <img src={teacher.profileImage} alt={teacher.name} className="size-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="text-base md:text-xl font-black text-slate-900 dark:text-white capitalize tracking-tighter">
                                                                {teacher.name}
                                                            </div>
                                                            <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">{teacher.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-6 md:py-8">
                                                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                        {teacher.subjects.slice(0, 2).map((subject: string, i: number) => (
                                                            <Badge key={i} variant="outline" className="rounded-lg md:rounded-xl px-2.5 md:px-3 py-0.5 md:py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-none text-slate-500">
                                                                {subject}
                                                            </Badge>
                                                        ))}
                                                        {teacher.subjects.length > 2 && <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">+{teacher.subjects.length - 2}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-6 md:py-8">
                                                    <code className="text-[9px] md:text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl uppercase tracking-widest border border-slate-200 dark:border-white/5">
                                                        {teacher.teacherCode || 'UNASSIGNED'}
                                                    </code>
                                                </td>
                                                <td className="px-6 md:px-10 py-6 md:py-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("size-2 rounded-full", teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                                        <span className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-widest", teacher.status === 'active' ? 'text-emerald-600' : 'text-amber-600')}>
                                                            {teacher.status === 'active' ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-10 py-6 md:py-8 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="size-10 md:size-12 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                            <ChevronRight size={18} className="text-slate-400" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination Controls */}
                {!isLoading && filteredTeachers.length > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-6 bg-white dark:bg-slate-900 border-y md:border border-slate-100 dark:border-white/5 rounded-none md:rounded-3xl mx-4 md:mx-0" style={{ boxShadow: `0 25px 50px -12px ${primaryColor}10` }}>
                        <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                            Showing {currentPage * itemsPerPage + 1} – {Math.min((currentPage + 1) * itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} Personnel
                        </span>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="h-10 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-slate-100 dark:border-white/5"
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                            >
                                <ChevronLeft size={16} className="mr-2" />
                                Prev
                            </Button>
                            <div className="hidden sm:flex items-center gap-1 px-4">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={cn(
                                            "size-8 rounded-lg text-xs font-black transition-all",
                                            currentPage === i ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                        onClick={() => setCurrentPage(i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                className="h-10 px-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border-slate-100 dark:border-white/5"
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1}
                            >
                                Next
                                <ChevronRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AddTeacherModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                primaryColor={primaryColor}
                onSuccess={() => refetchTeachers()}
                schoolId={schoolId}
            />

            {editingTeacher && (
                <EditTeacherModal
                    isOpen={!!editingTeacher}
                    onClose={() => setEditingTeacher(null)}
                    primaryColor={primaryColor}
                    teacher={editingTeacher}
                />
            )}

            <BulkAttendanceModeModal
                isOpen={isAttendanceModeModalOpen}
                onClose={() => setIsAttendanceModeModalOpen(false)}
                onSelectList={() => {
                    setIsAttendanceModeModalOpen(false)
                    setIsAttendanceListModalOpen(true)
                }}
                onSelectSwipe={() => {
                    setIsAttendanceModeModalOpen(false)
                    setIsAttendanceSwipeModalOpen(true)
                }}
            />

            <BulkAttendanceModal
                isOpen={isAttendanceListModalOpen}
                onClose={() => setIsAttendanceListModalOpen(false)}
                onSave={handleSaveBulkAttendance}
                teachers={teachersList}
                initialRecords={existingAttendance || []}
                targetDate={attendanceTargetDate}
                onTargetDateChange={setAttendanceTargetDate}
                isSaving={isSavingAttendance}
            />

            <BulkAttendanceSwipeModal
                isOpen={isAttendanceSwipeModalOpen}
                onClose={() => setIsAttendanceSwipeModalOpen(false)}
                onSave={handleSaveBulkAttendance}
                teachers={teachersList}
                initialRecords={existingAttendance || []}
                targetDate={attendanceTargetDate}
                onTargetDateChange={setAttendanceTargetDate}
                isSaving={isSavingAttendance}
            />
            {/* Export Modal */}
            <AnimatePresence>
                {isExportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Export Data</h2>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Select which dataset you would like to download as a CSV file.</p>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={exportTeacherProfiles}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all text-left group"
                                >
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Teacher Profiles</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Names, subjects, and verified status</p>
                                    </div>
                                    <Download size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                </button>
                                
                                <button 
                                    onClick={exportAttendanceData}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all text-left group"
                                >
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Attendance ({new Date(attendanceTargetDate).toLocaleDateString()})</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Daily logs, time-in, and remarks</p>
                                    </div>
                                    <Download size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                </button>
                            </div>
                            
                            <Button 
                                variant="outline" 
                                className="w-full mt-6 rounded-xl font-bold uppercase tracking-widest text-xs"
                                onClick={() => setIsExportModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
