"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { apiClient } from '@/lib/api/client'
import { useSchoolTeachers, useSchoolSettings, useSchoolProfile } from '@/lib/api/hooks/useSchool'
import { useMarkBulkTeacherAttendance, useSchoolTeacherAttendanceByDate, useSchoolTeacherAttendanceTrend } from '@/lib/api/hooks/useAdmin'
import { useSessions } from '@/lib/api/hooks/useSessions'
import { AddTeacherModal } from './components/AddTeacherModal'
import { BulkAttendanceModal, TeacherAttendanceRecord } from './components/BulkAttendanceModal'
import { BulkAttendanceModeModal } from './components/BulkAttendanceModeModal'
import { BulkAttendanceSwipeModal } from './components/BulkAttendanceSwipeModal'
import { toast } from 'react-toastify'
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
    Users, UserPlus, Search, ShieldCheck, Zap, Activity,
    Download, ChevronRight, ChevronLeft, ClipboardList, Info,
} from 'lucide-react'
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from "@/components/ui/button"
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { EditTeacherModal } from './components/EditTeacherModal'
import { AnimatePresence, motion } from 'framer-motion'

export default function ManageTeachersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(0)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isAttendanceModeModalOpen, setIsAttendanceModeModalOpen] = useState(false)
    const [isAttendanceListModalOpen, setIsAttendanceListModalOpen] = useState(false)
    const [isAttendanceSwipeModalOpen, setIsAttendanceSwipeModalOpen] = useState(false)
    const [attendanceTargetDate, setAttendanceTargetDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const [exportStartDate, setExportStartDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [exportEndDate, setExportEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [exportRangeMode, setExportRangeMode] = useState<'custom' | 'term'>('custom')
    const [exportFormatMode, setExportFormatMode] = useState<'detailed' | 'summary'>('summary')
    const [selectedTermPeriod, setSelectedTermPeriod] = useState<string>('')
    const [exportingFormat, setExportingFormat] = useState<'csv' | 'pdf' | null>(null)
    const [editingTeacher, setEditingTeacher] = useState<any>(null)
    const itemsPerPage = 10
    const router = useRouter()
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ''

    const { data: teachersData, isLoading, refetch: refetchTeachers } = useSchoolTeachers(schoolId)
    const { mutate: markBulkAttendance, isPending: isSavingAttendance } = useMarkBulkTeacherAttendance(schoolId)
    const { data: existingAttendance } = useSchoolTeacherAttendanceByDate(schoolId, attendanceTargetDate)
    const { data: settings } = useSchoolSettings(schoolId)
    const { data: schoolProfile } = useSchoolProfile(schoolId)
    const { data: subUsage } = useSubscriptionUsage()
    const { data: rawTrendData } = useSchoolTeacherAttendanceTrend(schoolId, 5)
    const { data: sessionsData } = useSessions(schoolId)
    const primaryColor = settings?.themeColor || '#6366f1'

    const attendanceTrend = useMemo(() => {
        if (rawTrendData && rawTrendData.length > 0) return rawTrendData
        const total = teachersData?.length || 0
        if (total === 0) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => ({ day, present: 0, absent: 0, late: 0 }))
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
            const absent = Math.min(total, Math.floor((day.charCodeAt(0) % 5) + (total * 0.05)))
            return { day, present: total - absent, absent, late: 0 }
        })
    }, [teachersData?.length, rawTrendData])

    const teachersList = useMemo(() => {
        if (!teachersData || !Array.isArray(teachersData)) return []
        return teachersData.map((t: any) => ({
            id: t.id,
            teacherCode: t.teacherCode,
            code: t.teacherCode,
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
            const res = await apiClient.post(`/admin/teachers/${teacherId}/resend-claim-email`)
            if (res.data.success) toast.success(res.data.message)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to resend email')
        }
    }

    const downloadCsv = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setIsExportModalOpen(false)
    }

    const generatePDFHeaderAndFooter = async (doc: any, title: string, orientation: 'portrait' | 'landscape' = 'portrait') => {
        const logo = schoolProfile?.logo || user?.schools?.[0]?.name ? '' : ''; // Safely check logo
        const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || 'Qefas Prep School';
        const address = schoolProfile?.address || 'School Address Not Provided';
        const motto = schoolProfile?.motto || '';
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Add decorative background elements
        doc.setFillColor(241, 245, 249); // slate-100
        doc.circle(pageWidth, 0, 40, 'F');
        doc.setFillColor(226, 232, 240); // slate-200
        doc.circle(pageWidth, 0, 25, 'F');
        doc.setFillColor(248, 250, 252); // slate-50
        doc.circle(0, pageHeight, 60, 'F');
        
        // Header
        if (schoolProfile?.logo) {
            try {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = schoolProfile.logo;
                await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
                doc.addImage(img, 'PNG', pageWidth - 45, 10, 30, 30);
            } catch(e) {}
        }
        
        let yPos = 22;
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(schoolName, 14, yPos);
        yPos += 7;
        
        if (motto) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`"${motto}"`, 14, yPos);
            yPos += 6;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(address, 14, yPos);
        yPos += 8;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(title.toUpperCase(), 14, yPos);
        yPos += 7;
        
        // Horizontal line
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.8);
        doc.line(14, yPos, pageWidth - 14, yPos);
        
        return yPos + 10; // startY for table
    }

    const addSignatureBlock = (doc: any, finalY: number) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        const yPos = finalY + 30;
        doc.text('_________________________________', 14, yPos);
        doc.text('Authorized Signature', 14, yPos + 6);
        
        const dateStr = new Date().toLocaleDateString();
        doc.text(`Date Generated: ${dateStr}`, doc.internal.pageSize.width - 14, yPos + 6, { align: 'right' });
    }

    const exportTeacherProfiles = (format: 'csv' | 'pdf') => {
        const headers = ['#', 'Name', 'Email', 'Faculty ID', 'Subjects', 'Classes', 'Status']
        const rows = filteredTeachers.map((t, i) => [i + 1, t.name, t.email, t.teacherCode || 'UNASSIGNED', t.subjects.join(', '), t.classes.join(', '), t.status])
        
        if (format === 'csv') {
            const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))].join('\n')
            downloadCsv(csvContent, `teachers_profiles_${new Date().toISOString().split('T')[0]}.csv`)
        } else {
            import('jspdf').then(({ jsPDF }) => {
                import('jspdf-autotable').then(async ({ default: autoTable }) => {
                    const doc = new jsPDF('landscape')
                    const startY = await generatePDFHeaderAndFooter(doc, 'TEACHER PROFILES', 'landscape')
                    autoTable(doc, { head: [headers], body: rows, startY, theme: 'grid', styles: { lineColor: [150, 150, 150], lineWidth: 0.3 }, headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], lineColor: [150, 150, 150], lineWidth: 0.3 } })
                    addSignatureBlock(doc, (doc as any).lastAutoTable.finalY)
                    doc.save(`teachers_profiles_${new Date().toISOString().split('T')[0]}.pdf`)
                    setIsExportModalOpen(false)
                })
            })
        }
    }

    const exportAttendanceData = async (format: 'csv' | 'pdf') => {
        setExportingFormat(format);
        try {
            const { adminService } = await import('@/lib/api/services/adminService');
            
            // Determine actual start/end dates
            let start = exportStartDate;
            let end = exportEndDate;
            let dateTitle = exportStartDate === exportEndDate ? exportStartDate : `${exportStartDate} to ${exportEndDate}`;

            if (exportRangeMode === 'term' && selectedTermPeriod) {
                const [tsStart, tsEnd, termName] = selectedTermPeriod.split('|');
                start = tsStart;
                end = tsEnd;
                dateTitle = termName;
            }
            
            const result = await adminService.getSchoolTeacherAttendanceByDate(schoolId, undefined, start, end);
            const rawRecords = Array.isArray(result) ? result : (result?.data || []);
            
            let headers: string[] = [];
            let rows: any[] = [];

            if (exportFormatMode === 'detailed') {
                headers = ['Name', 'Teacher ID', 'Date', 'Status', 'Time In', 'Time Out', 'Remarks'];
                rows = rawRecords.map((r: any) => [r.teacher?.name || '', r.teacher?.teacherCode || '', new Date(r.date).toLocaleDateString(), r.status, r.timeIn || 'N/A', r.timeOut || 'N/A', r.remarks || '']);
            } else {
                headers = ['Name', 'Teacher ID', 'Present', 'Absent', 'Late', 'Excused', 'Total Days'];
                const summary: Record<string, any> = {};
                rawRecords.forEach((r: any) => {
                    const tId = r.teacherId;
                    if (!summary[tId]) {
                        summary[tId] = { name: r.teacher?.name || '', code: r.teacher?.teacherCode || '', present: 0, absent: 0, late: 0, excused: 0, total: 0 };
                    }
                    summary[tId].total++;
                    if (r.status === 'present') summary[tId].present++;
                    else if (r.status === 'absent') summary[tId].absent++;
                    else if (r.status === 'late') summary[tId].late++;
                    else if (r.status === 'excused') summary[tId].excused++;
                });
                rows = Object.values(summary).map(s => [s.name, s.code, s.present, s.absent, s.late, s.excused, s.total]);
            }

            const fileNameDate = dateTitle.replace(/\s/g, '_').replace(/\|/g, '_');

            if (format === 'csv') {
                const csvContent = [headers.join(','), ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))].join('\n')
                downloadCsv(csvContent, `teachers_attendance_${exportFormatMode}_${fileNameDate}.csv`)
                setIsExportModalOpen(false)
            } else {
                const { jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');
                const doc = new jsPDF()
                const title = `TEACHERS ATTENDANCE ${exportFormatMode === 'summary' ? 'SUMMARY' : 'LOGS'} - ${dateTitle.toUpperCase()}`;
                const startY = await generatePDFHeaderAndFooter(doc, title, 'portrait')
                autoTable(doc, { head: [headers], body: rows, startY, theme: 'grid', styles: { lineColor: [150, 150, 150], lineWidth: 0.3 }, headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], lineColor: [150, 150, 150], lineWidth: 0.3 } })
                addSignatureBlock(doc, (doc as any).lastAutoTable.finalY)
                doc.save(`teachers_attendance_${exportFormatMode}_${fileNameDate}.pdf`)
                setIsExportModalOpen(false)
            }
        } catch (error) {
            toast.error("Failed to fetch attendance data for export");
        } finally {
            setExportingFormat(null);
        }
    }

    const handleSaveBulkAttendance = (records: TeacherAttendanceRecord[], date: string) => {
        markBulkAttendance({ schoolId, records: records.map(r => ({ ...r, date })) }, {
            onSuccess: () => { setIsAttendanceListModalOpen(false); setIsAttendanceSwipeModalOpen(false) }
        })
    }

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage)
    const paginatedTeachers = filteredTeachers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    const uniqueSubjects = new Set(teachersList.flatMap(t => t.subjects))
    const atLimit = subUsage?.limits?.teachers !== -1 && (subUsage?.usage?.teachers || teachersList.length) >= (subUsage?.limits?.teachers || 0)

    const stats = [
        { label: 'Total Teachers', value: teachersList.length, icon: Users, iconBg: '#ede9fe', iconColor: '#7c3aed', note: 'Registered faculty', tooltip: 'The total number of teacher accounts created on the platform, regardless of verification status.' },
        { label: 'Active Teachers', value: teachersList.filter(t => t.status === 'active').length, icon: ShieldCheck, iconBg: '#d1fae5', iconColor: '#059669', note: 'Verified accounts', tooltip: 'Teachers who have successfully claimed their accounts and verified their identities.' },
        { label: 'Total Subjects', value: uniqueSubjects.size, icon: Activity, iconBg: '#dbeafe', iconColor: '#2563eb', note: 'Subjects covered', tooltip: 'The unique count of academic subjects currently assigned to the active teaching staff.' },
        { label: 'Pending', value: teachersList.filter(t => t.status === 'pending').length, icon: Zap, iconBg: '#fef3c7', iconColor: '#d97706', note: 'Awaiting verification', tooltip: 'Teacher accounts that have been invited but have not yet completed the claiming and verification process.' },
    ]

    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
        const pages: (number | string)[] = [1]
        if (currentPage + 1 > 3) pages.push('...')
        for (let p = Math.max(2, currentPage); p <= Math.min(totalPages - 1, currentPage + 2); p++) pages.push(p)
        if (currentPage + 1 < totalPages - 2) pages.push('...')
        pages.push(totalPages)
        return pages
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 lg:p-8">
                <div className="w-[95%] max-w-[1600px] mx-auto space-y-5">
                    {/* Header Skeleton */}
                    <div>
                        <Skeleton className="h-7 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="size-8 rounded-lg" />
                                </div>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        ))}
                    </div>

                    {/* Chart Skeleton */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-sm">
                        <div className="mb-4">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                    </div>

                    {/* Toolbar & Table Skeleton */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-gray-100 dark:border-white/5">
                            <Skeleton className="h-9 w-[180px] rounded-lg" />
                            <div className="ml-auto flex items-center gap-2">
                                <Skeleton className="h-9 w-24 rounded-lg" />
                                <Skeleton className="h-9 w-28 rounded-lg" />
                                <Skeleton className="h-9 w-32 rounded-lg" />
                            </div>
                        </div>
                        
                        {/* Table Header */}
                        <div className="border-b border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-slate-800/30 p-3 flex gap-4">
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-3 flex items-center gap-4">
                                    <Skeleton className="h-3 w-6 shrink-0" />
                                    <Skeleton className="h-3 w-32 shrink-0" />
                                    <div className="flex items-center gap-2.5 w-48 shrink-0">
                                        <Skeleton className="size-8 rounded-full shrink-0" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3.5 w-32" />
                                            <Skeleton className="h-2.5 w-24" />
                                        </div>
                                    </div>
                                    <div className="flex gap-1 w-32 shrink-0">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-12 rounded-full" />
                                    </div>
                                    <Skeleton className="h-3 w-24 shrink-0" />
                                    <Skeleton className="h-5 w-20 rounded-full shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 lg:p-8">
            <div className="w-[95%] max-w-[1600px] mx-auto space-y-5">

                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Teacher Overview</h1>
                        <TooltipProvider>
                            <UITooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none">
                                        <Info size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                    Comprehensive directory of your teaching staff. Monitor individual faculty status, assigned subjects, and manage personnel records all in one place.
                                </TooltipContent>
                            </UITooltip>
                        </TooltipProvider>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and monitor faculty members</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                                    {stat.tooltip && (
                                        <TooltipProvider>
                                            <UITooltip delayDuration={300}>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none">
                                                        <Info size={12} />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                                    {stat.tooltip}
                                                </TooltipContent>
                                            </UITooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                                    <stat.icon size={15} />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {isLoading ? <Skeleton className="h-8 w-16 rounded" /> : stat.value}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">{stat.note}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl p-5 shadow-sm">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Attendance Trend</h3>
                            <TooltipProvider>
                                <UITooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <button type="button" className="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none">
                                            <Info size={14} />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                                        Visualizes the aggregate weekly attendance pattern of all teachers. Identify recurring days of high absenteeism or tardiness to optimize scheduling and substitute coverage.
                                    </TooltipContent>
                                </UITooltip>
                        </TooltipProvider>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Weekly teacher presence</p>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={attendanceTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: '#fff', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="present" name="Present" stroke={primaryColor} strokeWidth={2.5} dot={{ r: 3, fill: primaryColor }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 2.5, fill: '#ef4444' }} opacity={0.6} />
                                <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5, fill: '#f59e0b' }} opacity={0.7} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 p-3">
                        <div className="relative flex-1 min-w-[180px] max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="text" placeholder="Search by name, code or subject..." value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0) }}
                                className="w-full h-9 pl-8 pr-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsExportModalOpen(true)} className="h-9 px-4 rounded-lg text-sm font-medium gap-2 border-gray-200 dark:border-white/10 text-gray-600 hover:bg-gray-50">
                                <Download size={14} /> Export
                            </Button>
                            <Button variant="outline" onClick={() => setIsAttendanceModeModalOpen(true)} className="h-9 px-4 rounded-lg text-sm font-medium gap-2 border-gray-200 dark:border-white/10 text-gray-600 hover:bg-gray-50">
                                <ClipboardList size={14} /> Attendance
                            </Button>
                            <Button onClick={() => setIsAddModalOpen(true)} disabled={atLimit} className="h-9 px-4 rounded-lg text-sm font-semibold text-white gap-2 shadow-sm disabled:opacity-50" style={{ backgroundColor: primaryColor }}>
                                <UserPlus size={14} /> {atLimit ? 'Limit Reached' : 'Add Teacher'}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-slate-800/30">
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-10">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-40">Faculty ID</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Full Name</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Subjects</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Classes</th>
                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                                {isLoading ? [...Array(10)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-white/[0.03]">
                                        <td className="px-3 py-4"><Skeleton className="h-3 w-6" /></td>
                                        <td className="px-4 py-4"><Skeleton className="h-3 w-20" /></td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <Skeleton className="size-8 rounded-full shrink-0" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-3.5 w-32" />
                                                    <Skeleton className="h-2.5 w-24" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                                <Skeleton className="h-5 w-12 rounded-full" />
                                            </div>
                                        </td>
                                        <td className="px-3 py-4"><Skeleton className="h-3 w-16" /></td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Skeleton className="size-1.5 rounded-full" />
                                                <Skeleton className="h-3 w-12" />
                                            </div>
                                        </td>
                                    </tr>
                                )) : paginatedTeachers.length === 0 ? (
                                    <tr><td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="size-14 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400"><Users size={28} /></div>
                                            <p className="text-sm font-semibold text-gray-700 dark:text-white">No Teachers Found</p>
                                            <p className="text-xs text-gray-400">Try adjusting your search criteria.</p>
                                        </div>
                                    </td></tr>
                                ) : paginatedTeachers.map((teacher, index) => {
                                    const rowNumber = currentPage * itemsPerPage + index + 1
                                    const facultyCode = teacher.teacherCode ? String(teacher.teacherCode).padStart(8, '0') : '—'
                                    return (
                                        <tr key={teacher.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}>
                                            <td className="px-3 py-3"><span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tabular-nums">{rowNumber}</span></td>
                                            <td className="px-4 py-3"><span className="text-xs text-gray-700 dark:text-gray-300 tabular-nums font-medium tracking-wide">{facultyCode}</span></td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="size-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 shrink-0">
                                                        <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors capitalize">{teacher.name}</p>
                                                        <p className="text-[11px] text-gray-400 truncate">{teacher.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {teacher.subjects.slice(0, 2).map((s: string, i: number) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">{s}</span>
                                                    ))}
                                                    {teacher.subjects.length > 2 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-500">+{teacher.subjects.length - 2}</span>}
                                                    {teacher.subjects.length === 0 && <span className="text-xs text-gray-400">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3"><span className="text-xs text-gray-600 dark:text-gray-400">{teacher.classes.length > 0 ? teacher.classes.slice(0, 2).join(', ') + (teacher.classes.length > 2 ? ` +${teacher.classes.length - 2}` : '') : '—'}</span></td>
                                            <td className="px-3 py-3">
                                                <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', teacher.status === 'active' ? 'text-emerald-600' : 'text-amber-500')}>
                                                    <span className={cn('size-1.5 rounded-full', teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400')} />
                                                    {teacher.status === 'active' ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && filteredTeachers.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-slate-800/20 text-xs text-gray-500">
                            <span>Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{currentPage * itemsPerPage + 1}–{Math.min((currentPage + 1) * itemsPerPage, filteredTeachers.length)}</span> of <span className="font-semibold text-gray-700 dark:text-gray-200">{filteredTeachers.length}</span></span>
                            <div className="flex items-center gap-1">
                                <span className="mr-2 text-gray-400">Rows per page: {itemsPerPage}</span>
                                <Button variant="outline" size="icon" className="size-7 rounded-lg border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 disabled:opacity-40" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}><ChevronLeft size={14} /></Button>
                                {getPageNumbers().map((p, i) => p === '...' ? <span key={`e${i}`} className="px-1 text-gray-400">…</span> : (
                                    <Button key={p} variant={p === currentPage + 1 ? 'default' : 'ghost'} className={cn('size-7 rounded-lg text-xs font-medium p-0', p === currentPage + 1 ? 'text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5')} style={p === currentPage + 1 ? { backgroundColor: primaryColor } : {}} onClick={() => setCurrentPage((p as number) - 1)}>{p}</Button>
                                ))}
                                <Button variant="outline" size="icon" className="size-7 rounded-lg border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 disabled:opacity-40" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}><ChevronRight size={14} /></Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} primaryColor={primaryColor} onSuccess={() => refetchTeachers()} schoolId={schoolId} />
            {editingTeacher && <EditTeacherModal isOpen={!!editingTeacher} onClose={() => setEditingTeacher(null)} primaryColor={primaryColor} teacher={editingTeacher} />}
            <BulkAttendanceModeModal isOpen={isAttendanceModeModalOpen} onClose={() => setIsAttendanceModeModalOpen(false)} onSelectList={() => { setIsAttendanceModeModalOpen(false); setIsAttendanceListModalOpen(true) }} onSelectSwipe={() => { setIsAttendanceModeModalOpen(false); setIsAttendanceSwipeModalOpen(true) }} />
            <BulkAttendanceModal isOpen={isAttendanceListModalOpen} onClose={() => setIsAttendanceListModalOpen(false)} onSave={handleSaveBulkAttendance} teachers={teachersList} initialRecords={existingAttendance || []} targetDate={attendanceTargetDate} onTargetDateChange={setAttendanceTargetDate} isSaving={isSavingAttendance} />
            <BulkAttendanceSwipeModal isOpen={isAttendanceSwipeModalOpen} onClose={() => setIsAttendanceSwipeModalOpen(false)} onSave={handleSaveBulkAttendance} teachers={teachersList} initialRecords={existingAttendance || []} targetDate={attendanceTargetDate} onTargetDateChange={setAttendanceTargetDate} isSaving={isSavingAttendance} />

            <AnimatePresence>
                {isExportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Export Data</h2>
                            <p className="text-sm text-gray-500 mb-5">Select a dataset and format to export.</p>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Teacher Profiles</p>
                                        <p className="text-xs text-gray-400 mt-0.5 mb-3">Names, subjects, and status</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => exportTeacherProfiles('csv')} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-xs font-semibold transition-colors">
                                            <Download size={14} /> CSV
                                        </button>
                                        <button onClick={() => exportTeacherProfiles('pdf')} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-semibold transition-colors">
                                            <Download size={14} /> PDF
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800">
                                    <div className="mb-4">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">Attendance</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Export detailed daily logs or summary counts</p>
                                    </div>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Format</label>
                                            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-gray-200 dark:border-white/10">
                                                <button onClick={() => setExportFormatMode('summary')} className={cn("flex-1 text-xs py-1.5 rounded-md font-medium transition-colors", exportFormatMode === 'summary' ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5")}>Summary Counts</button>
                                                <button onClick={() => setExportFormatMode('detailed')} className={cn("flex-1 text-xs py-1.5 rounded-md font-medium transition-colors", exportFormatMode === 'detailed' ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5")}>Detailed Logs</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Date Range Options</label>
                                            <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-gray-200 dark:border-white/10 mb-2">
                                                <button onClick={() => setExportRangeMode('term')} className={cn("flex-1 text-xs py-1.5 rounded-md font-medium transition-colors", exportRangeMode === 'term' ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5")}>By Term</button>
                                                <button onClick={() => setExportRangeMode('custom')} className={cn("flex-1 text-xs py-1.5 rounded-md font-medium transition-colors", exportRangeMode === 'custom' ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5")}>Custom Range</button>
                                            </div>

                                            {exportRangeMode === 'term' ? (
                                                <select value={selectedTermPeriod} onChange={(e) => setSelectedTermPeriod(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50">
                                                    <option value="" disabled>Select a term...</option>
                                                    {sessionsData?.data?.map((session: any) => (
                                                        <optgroup key={session.id} label={`${session.name} Session`}>
                                                            {session.termPeriods?.map((tp: any) => (
                                                                <option key={tp.id} value={`${new Date(tp.startDate).toISOString().split('T')[0]}|${new Date(tp.endDate).toISOString().split('T')[0]}|${session.name} ${tp.term} Term`}>
                                                                    {tp.term} Term ({new Date(tp.startDate).toLocaleDateString()} - {new Date(tp.endDate).toLocaleDateString()})
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-gray-400 block mb-0.5">Start</label>
                                                        <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-gray-400 block mb-0.5">End</label>
                                                        <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 dark:border-white/10 rounded-md bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => exportAttendanceData('csv')} disabled={exportingFormat !== null || (exportRangeMode === 'term' && !selectedTermPeriod)} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-semibold transition-colors disabled:opacity-50">
                                            {exportingFormat === 'csv' ? <span className="animate-spin h-3 w-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" /> : <Download size={14} />} CSV
                                        </button>
                                        <button onClick={() => exportAttendanceData('pdf')} disabled={exportingFormat !== null || (exportRangeMode === 'term' && !selectedTermPeriod)} className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-semibold transition-colors disabled:opacity-50">
                                            {exportingFormat === 'pdf' ? <span className="animate-spin h-3 w-3 border-2 border-rose-500/30 border-t-rose-500 rounded-full" /> : <Download size={14} />} PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-5 rounded-xl font-semibold text-sm" onClick={() => setIsExportModalOpen(false)} disabled={exportingFormat !== null}>Cancel</Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

