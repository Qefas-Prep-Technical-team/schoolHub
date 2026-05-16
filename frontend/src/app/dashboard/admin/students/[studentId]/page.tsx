"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { studentService } from '@/lib/api/services/studentService'
import { gradeService } from '@/lib/api/services/gradeService'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { useSchoolSettings } from '@/lib/api/hooks/useSchool'
import {
    Loader2, ArrowLeft, Edit2, Mail, Phone, MapPin,
    BookOpen, GraduationCap, Users, Briefcase, Star,
    ShieldCheck, Clock, ChevronRight, ChevronLeft, Award, UserCheck,
    Building2, Calendar, Hash, User, Activity, TrendingUp,
    Target, BarChart3, PieChart, ShieldAlert
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell
} from 'recharts'
import { format, addWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { TranscriptModal } from './components/TranscriptModal'
import { toast } from 'react-toastify'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

// ─── Helper Components ───────────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon, themeColor }: { label: string; value: string; icon: React.ElementType; themeColor: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="size-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                <Icon size={16} />
            </div>
            <div className="space-y-0.5 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-words">{value || '—'}</p>
            </div>
        </div>
    )
}

function SectionCard({ title, children, className = '', headerAction }: { title: string; children: React.ReactNode; className?: string; headerAction?: React.ReactNode }) {
    return (
        <div className={cn("bg-white dark:bg-slate-900 border-y md:border border-slate-200 dark:border-slate-800 rounded-none md:rounded-[2rem] overflow-hidden", className)}>
            <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
                    {headerAction}
                </div>
                {children}
            </div>
        </div>
    )
}

function StatBadge({ label, value, icon: Icon, themeColor, trend }: { label: string; value: string | number; icon: React.ElementType; themeColor: string; trend?: string }) {
    return (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="size-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                    <Icon size={18} />
                </div>
                {trend && (
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
            </div>
        </div>
    )
}

function WeekControls({ currentDate, onPrev, onNext, themeColor }: { currentDate: Date, onPrev: () => void, onNext: () => void, themeColor: string }) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const label = `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`

    return (
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-sm">
            <button 
                onClick={onPrev}
                className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-90"
            >
                <ChevronLeft size={20} />
            </button>
            <div className="px-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Academic Week</p>
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{label}</p>
            </div>
            <button 
                onClick={onNext}
                className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm active:scale-90"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    )
}

function ScheduleGrid({ type, themeColor, onCellClick, currentDate }: { 
    type: 'attendance' | 'timetable', 
    themeColor: string,
    onCellClick: (day: string, hour: string) => void,
    currentDate: Date
}) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => ({
        full: day,
        short: day.slice(0, 3),
        date: format(addDays(weekStart, i), 'dd')
    }));
    const HOURS = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];

    return (
        <div className="space-y-8">
            {/* Legend */}
            {type === 'attendance' && (
                <div className="flex flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Late</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unrecorded</span>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto custom-scrollbar pb-6">
                <div className="min-w-[1000px]">
                    <div className="grid grid-cols-[140px_repeat(12,1fr)] gap-3">
                        {/* Empty corner */}
                        <div className="h-12" />
                        
                        {/* Time Headers */}
                        {HOURS.map(hour => (
                            <div key={hour} className="h-12 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                                {hour}
                            </div>
                        ))}

                        {/* Day Rows */}
                        {DAYS.map((day, dIdx) => (
                            <div key={day.full} className="contents group/row">
                                <div className="h-20 flex flex-col justify-center px-6 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-transparent group-hover/row:border-slate-200 dark:group-hover/row:border-white/10 transition-all">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{day.short}</span>
                                    <span className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{day.date}</span>
                                </div>
                                
                                {HOURS.map((hour, hIdx) => {
                                    // Find class for this slot (if timetable)
                                    // ...
                                    const dayName = day.full;
                                    const isPast = dIdx < 3 || (dIdx === 3 && hIdx < 5);
                                    const statusChance = Math.random();
                                    
                                    return (
                                        <div 
                                            key={`${day.full}-${hour}`} 
                                            onClick={() => onCellClick(day.full, hour)}
                                            className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-2 group hover:border-primary/30 dark:hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                                            style={{ '--primary': themeColor } as any}
                                        >
                                            {type === 'attendance' ? (
                                                isPast ? (
                                                    statusChance > 0.2 ? (
                                                        <div className="size-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-500" />
                                                    ) : statusChance > 0.05 ? (
                                                        <div className="size-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/20 animate-in zoom-in duration-500" />
                                                    ) : (
                                                        <div className="size-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20 animate-in zoom-in duration-500" />
                                                    )
                                                ) : (
                                                    <div className="size-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
                                                )
                                            ) : (
                                                // Timetable Mock
                                                hIdx % 3 === 0 && dIdx !== 2 ? (
                                                    <div className="text-center px-1">
                                                        <p className="text-[9px] font-black text-primary uppercase tracking-tighter leading-none" style={{ color: themeColor }}>Mathematics</p>
                                                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-1">RM 204</p>
                                                    </div>
                                                ) : (hIdx + dIdx) % 5 === 0 ? (
                                                    <div className="text-center px-1">
                                                        <p className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter leading-none">English</p>
                                                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-1">LAB 1</p>
                                                    </div>
                                                ) : null
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'timetable', label: 'Time Table' },
]

export default function StudentProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ''
    const studentId = typeof params.studentId === 'string' ? params.studentId : Array.isArray(params.studentId) ? params.studentId[0] : ''

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: student, isLoading: isStudentLoading, error: studentError } = useQuery({
        queryKey: ['student-details', studentId],
        queryFn: () => studentService.getStudentById(studentId),
        enabled: !!studentId
    })

    const { data: gradesData, isLoading: isGradesLoading } = useQuery({
        queryKey: ['student-grades', studentId],
        queryFn: () => gradeService.getStudentGrades(studentId, { limit: 100 }),
        enabled: !!studentId
    })

    const { data: settings } = useSchoolSettings(schoolId)
    const primaryColor = settings?.themeColor || '#2563eb'

    const [activeTab, setActiveTab] = useState('overview')
    const [academicSubTab, setAcademicSubTab] = useState<'exams' | 'papers'>('exams')
    const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false)
    const [selectedScheduleCell, setSelectedScheduleCell] = useState<{ day: string; hour: string; type: 'attendance' | 'timetable' } | null>(null)
    const [scheduleDate, setScheduleDate] = useState(new Date())

    // ── Pagination State ─────────────────────────────────────────────────────
    const [examsPage, setExamsPage] = useState(1);
    const [papersPage, setPapersPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // ── Data Transformation ──────────────────────────────────────────────────
    const grades = gradesData?.grades || []
    
    const { examSections, standalonePapers, totalExams, totalPapers } = useMemo(() => {
        const sectionsMap: Record<string, any> = {};
        const standalone: any[] = [];

        grades.forEach(g => {
            if (g.exam) {
                // Group by Exam (Transcript-style)
                const subjectName = g.subject?.toLowerCase() || '';
                const examTitle = g.exam.title?.toLowerCase() || '';
                const isTotalRecord = subjectName.includes('(total)') || 
                                     subjectName === examTitle || 
                                     g.assessmentType === 'TOTAL';
                
                if (isTotalRecord) return;

                const examId = g.examId || g.exam.title;
                if (!sectionsMap[examId]) {
                    sectionsMap[examId] = {
                        id: examId,
                        title: g.exam.title,
                        session: g.exam.session?.name || 'Academic Session',
                        createdAt: g.createdAt,
                        papers: [],
                        totalScore: 0,
                        totalMax: 0
                    };
                }
                sectionsMap[examId].papers.push(g);
                sectionsMap[examId].totalScore += g.score;
                sectionsMap[examId].totalMax += g.maxMarks;
            } else {
                // Standalone Subject Paper
                standalone.push(g);
            }
        });

        const sortedSections = Object.values(sectionsMap).sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const sortedStandalone = standalone.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return { 
            examSections: sortedSections, 
            standalonePapers: sortedStandalone,
            totalExams: sortedSections.length,
            totalPapers: sortedStandalone.length
        };
    }, [grades]);
    
    const performanceStats = useMemo(() => {
        if (!grades.length) return { avg: 0, highest: 0, total: 0, subjectData: [], trendData: [] }
        
        const total = grades.length
        const sum = grades.reduce((acc, g) => acc + (g.score / g.maxMarks) * 100, 0)
        const avg = Math.round(sum / total)
        const highest = Math.max(...grades.map(g => (g.score / g.maxMarks) * 100))

        // Radar Chart Data (Group by Subject)
        const subjectMap: Record<string, { subject: string; score: number; count: number }> = {}
        grades.forEach(g => {
            const percentage = (g.score / g.maxMarks) * 100
            if (!subjectMap[g.subject]) {
                subjectMap[g.subject] = { subject: g.subject, score: 0, count: 0 }
            }
            subjectMap[g.subject].score += percentage
            subjectMap[g.subject].count += 1
        })
        const subjectData = Object.values(subjectMap).map(s => ({
            subject: s.subject,
            fullMark: 100,
            score: Math.round(s.score / s.count)
        }))

        // Area Chart Data (Trend by Date)
        const trendData = grades
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(g => ({
                date: new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: Math.round((g.score / g.maxMarks) * 100)
            }))

        return { avg, highest, total, subjectData, trendData }
    }, [grades])

    // ── Loading & Errors ─────────────────────────────────────────────────────
    if (isStudentLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="size-14 rounded-full border-4 border-slate-100 dark:border-white/10 animate-spin" style={{ borderTopColor: primaryColor }} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Student...</p>
            </div>
        )
    }

    if (studentError || !student) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <ShieldCheck size={48} className="text-slate-200" />
                <p className="text-sm font-bold text-red-500">Student not found.</p>
                <button onClick={() => router.back()} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
                    <ArrowLeft size={14} /> Go Back
                </button>
            </div>
        )
    }

    const name = student.name || 'Unknown Student'
    const email = student.email || 'No email registered'
    const studentCode = student.studentCode || 'UNASSIGNED'
    const gender = student.gender || 'Not specified'
    const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'
    const studentClass = student.classes?.[0]?.class
    const classNameLabel = studentClass ? `${studentClass.name} ${studentClass.section || ''}` : 'Unassigned Class'
    const department = student.department?.name || 'General'
    const avatar = student.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40&fontWeight=900`
    const isVerified = !!student.verified

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-500">

            {/* ── Banner ──────────────────────────────────────────────────── */}
            <section className="relative h-40 md:h-64 w-full overflow-hidden">
                <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${primaryColor}CC 0%, ${primaryColor}66 50%, ${primaryColor}22 100%)`
                }} />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)' }} />
                
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/30 transition-all border border-white/10"
                >
                    <ArrowLeft size={14} strokeWidth={3} />
                    <span className="hidden sm:inline">Back to List</span>
                </button>
            </section>

            {/* ── Profile Header ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 -mt-12 md:-mt-20 relative z-20">

                    {/* Avatar */}
                    <div className="size-28 md:size-44 rounded-3xl md:rounded-[2rem] bg-white dark:bg-slate-900 p-1.5 shadow-3xl border-[4px] border-slate-100 dark:border-slate-950 flex items-center justify-center shrink-0 overflow-hidden group">
                        <img src={avatar} alt={name} className="w-full h-full rounded-2xl md:rounded-[1.5rem] object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 md:pt-20 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85]">
                                    {name}<span style={{ color: primaryColor }}>.</span>
                                </h1>
                                <p className="text-sm md:text-lg font-bold text-slate-500 dark:text-slate-400 mt-2">
                                    {classNameLabel} · {department}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2">
                                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <Hash size={14} style={{ color: primaryColor }} />
                                        {studentCode}
                                    </span>
                                    <span className={cn(
                                        "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                        isVerified
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                    )}>
                                        <ShieldCheck size={12} />
                                        {isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    className="h-12 w-full sm:w-auto px-8 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all border-none"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Edit2 size={16} strokeWidth={3} /> Manage Student
                                </button>
                                <a
                                    href={`mailto:${email}`}
                                    className="h-12 w-full sm:w-auto px-8 rounded-2xl border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 font-black uppercase tracking-widest text-[10px] text-slate-700 dark:text-slate-300 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-xl"
                                >
                                    <Mail size={16} /> Send Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-10 md:mt-12">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide bg-white dark:bg-slate-900 rounded-none md:rounded-[2rem] border-y md:border border-slate-100 dark:border-white/5 p-2 shadow-2xl">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-shrink-0 px-6 md:px-10 py-3.5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "text-white shadow-xl scale-105"
                                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                            )}
                            style={activeTab === tab.id ? { backgroundColor: primaryColor } : {}}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Overview Tab ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
                <main className="max-w-7xl mx-auto px-0 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 pb-20">

                    <div className="lg:col-span-2 space-y-6 md:space-y-10">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatBadge 
                                label="Academic Average" 
                                value={`${performanceStats.avg}%`} 
                                icon={Star} 
                                themeColor={primaryColor} 
                                trend="+4.2%" 
                            />
                            <StatBadge 
                                label="Attendance Rate" 
                                value="94%" 
                                icon={Activity} 
                                themeColor="#10b981" 
                                trend="Stable" 
                            />
                        </div>

                        {/* Personal Information */}
                        <SectionCard title="Personal Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <InfoRow icon={Mail} label="Email Address" value={email} themeColor={primaryColor} />
                                <InfoRow icon={Calendar} label="Date of Birth" value={dob} themeColor={primaryColor} />
                                <InfoRow icon={Users} label="Gender" value={gender} themeColor={primaryColor} />
                                <InfoRow icon={GraduationCap} label="Grade Level" value={student.gradeLevel || 'Level 1'} themeColor={primaryColor} />
                            </div>
                        </SectionCard>

                        {/* Institutional Links */}
                        <SectionCard title="Academic Context">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <InfoRow icon={Building2} label="Current School" value={student.school?.name || 'Not linked'} themeColor={primaryColor} />
                                <InfoRow icon={BookOpen} label="Assigned Class" value={classNameLabel} themeColor={primaryColor} />
                                <InfoRow icon={Briefcase} label="Department" value={department} themeColor={primaryColor} />
                                <InfoRow icon={Hash} label="Student ID" value={studentCode} themeColor={primaryColor} />
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── Sidebar ──────────────────────────────────────────── */}
                    <div className="space-y-6 md:space-y-10">

                        {/* Quick Actions */}
                        <SectionCard title="Quick Actions">
                             <div className="space-y-3">
                                {[
                                    { label: 'Issue Transcript', icon: Award, onClick: () => setIsTranscriptModalOpen(true) },
                                    { label: 'Log Behaviour', icon: ShieldAlert, onClick: () => toast.info('Behaviour logging is coming soon.') },
                                    { label: 'Attendance Entry', icon: Calendar, onClick: () => toast.info('Attendance entry is coming soon.') },
                                ].map((act, i) => (
                                    <button 
                                        key={i} 
                                        onClick={act.onClick}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <act.icon size={16} className="text-slate-400 group-hover:text-primary transition-colors" style={{ color: 'inherit' }} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{act.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                             </div>
                        </SectionCard>

                        {/* Guardian Details */}
                        <SectionCard title="Guardian Details">
                            {student.parentLinks && student.parentLinks.length > 0 ? (
                                <div className="space-y-4">
                                    {student.parentLinks.map((link: any, i: number) => (
                                        <div key={i} className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-3">
                                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{link.parent.fullName || link.parent.name}</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                                    <Mail size={12} className="text-slate-400" /> {link.parent.email}
                                                </div>
                                                {link.parent.phone && (
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                                        <Phone size={12} className="text-slate-400" /> {link.parent.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center space-y-3">
                                    <Users size={32} className="text-slate-200 mx-auto" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No Guardians Linked</p>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </main>
            )}

            {/* ── Academic Tab ─────────────────────────────────────────────── */}
            {activeTab === 'academic' && (
                <main className="max-w-7xl mx-auto px-4 md:px-12 mt-10 pb-20 space-y-10">
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        {/* Radar Chart: Subject Mastery */}
                        <SectionCard title="Performance by Subject">
                            <div className="h-[400px] w-full">
                                {performanceStats.subjectData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceStats.subjectData}>
                                            <PolarGrid stroke="#94a3b833" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                            <Radar
                                                name={name}
                                                dataKey="score"
                                                stroke={primaryColor}
                                                fill={primaryColor}
                                                fillOpacity={0.4}
                                            />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff', fontWeight: 'bold' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <BarChart3 size={48} className="opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Insufficient data for mastery analysis</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* Area Chart: Performance Trend */}
                        <SectionCard title="Academic Progress">
                            <div className="h-[400px] w-full">
                                {performanceStats.trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={performanceStats.trendData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b811" vertical={false} />
                                            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff', fontWeight: 'bold' }} />
                                            <Area type="monotone" dataKey="score" stroke={primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <TrendingUp size={48} className="opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No historical metrics available</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Recent Grades Table */}
                    {/* Recent Grades Table */}
                    <SectionCard 
                        title="Recent Grades"
                        headerAction={
                            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setAcademicSubTab('exams')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        academicSubTab === 'exams' 
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    )}
                                >
                                    Examinations
                                </button>
                                <button
                                    onClick={() => setAcademicSubTab('papers')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                        academicSubTab === 'papers' 
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    )}
                                >
                                    Standalone Papers
                                </button>
                            </div>
                        }
                    >
                        {academicSubTab === 'exams' ? (
                            <div className="space-y-8">
                                {examSections.length > 0 ? (
                                    <>
                                        <div className="space-y-8">
                                            {examSections.slice((examsPage - 1) * ITEMS_PER_PAGE, examsPage * ITEMS_PER_PAGE).map((section: any, idx: number) => (
                                                <div key={idx} className="space-y-4">
                                                    <div className="flex items-end justify-between border-b-2 border-slate-100 dark:border-white/5 pb-4">
                                                        <div className="space-y-1">
                                                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h3>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.session}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{Math.round((section.totalScore / section.totalMax) * 100)}%</p>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Aggregate</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {section.papers.map((paper: any, pIdx: number) => (
                                                            <div key={pIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                                                <div className="space-y-1">
                                                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{paper.subject}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{paper.assessmentType}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{paper.score}/{paper.maxMarks}</p>
                                                                    <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Graded</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Exam Pagination */}
                                        {totalExams > ITEMS_PER_PAGE && (
                                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Page {examsPage} of {Math.ceil(totalExams / ITEMS_PER_PAGE)}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => setExamsPage(p => Math.max(1, p - 1))}
                                                        disabled={examsPage === 1}
                                                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                                                    >
                                                        Prev
                                                    </button>
                                                    <button 
                                                        onClick={() => setExamsPage(p => Math.min(Math.ceil(totalExams / ITEMS_PER_PAGE), p + 1))}
                                                        disabled={examsPage === Math.ceil(totalExams / ITEMS_PER_PAGE)}
                                                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <Award size={40} className="mx-auto text-slate-200" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No examination records found</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-white/5">
                                                <th className="py-6 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                                                <th className="py-6 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Type</th>
                                                <th className="py-6 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                                <th className="py-6 px-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="py-6 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-white/[0.02]">
                                            {standalonePapers.slice((papersPage - 1) * ITEMS_PER_PAGE, papersPage * ITEMS_PER_PAGE).map((grade, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                                    <td className="py-5 px-4">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{grade.subject}</p>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{grade.assessmentType}</p>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">{grade.score}/{grade.maxMarks}</span>
                                                            <div className="h-1.5 w-16 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden hidden sm:block">
                                                                <div 
                                                                    className="h-full rounded-full" 
                                                                    style={{ 
                                                                        width: `${(grade.score/grade.maxMarks)*100}%`,
                                                                        backgroundColor: (grade.score/grade.maxMarks)*100 > 70 ? '#10b981' : (grade.score/grade.maxMarks)*100 > 40 ? primaryColor : '#ef4444'
                                                                    }} 
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-4">
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                            (grade.score/grade.maxMarks)*100 > 50 
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                                                : "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                                        )}>
                                                            {(grade.score/grade.maxMarks)*100 > 50 ? 'Pass' : 'Critical'}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 px-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(grade.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {standalonePapers.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No standalone subject papers found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Papers Pagination */}
                                {totalPapers > ITEMS_PER_PAGE && (
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Page {papersPage} of {Math.ceil(totalPapers / ITEMS_PER_PAGE)}
                                        </p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setPapersPage(p => Math.max(1, p - 1))}
                                                disabled={papersPage === 1}
                                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                                            >
                                                Prev
                                            </button>
                                            <button 
                                                onClick={() => setPapersPage(p => Math.min(Math.ceil(totalPapers / ITEMS_PER_PAGE), p + 1))}
                                                disabled={papersPage === Math.ceil(totalPapers / ITEMS_PER_PAGE)}
                                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-white/10"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </SectionCard>
                </main>
            )}

            {/* ── Attendance Tab ─────────────────────────────────────────────── */}
            {activeTab === 'attendance' && (
                <main className="max-w-7xl mx-auto px-0 md:px-12 mt-10 pb-20">
                     <SectionCard 
                        title="Attendance Tracker"
                        headerAction={
                            <div className="flex items-center gap-6">
                                <WeekControls 
                                    currentDate={scheduleDate}
                                    onPrev={() => setScheduleDate(d => addWeeks(d, -1))}
                                    onNext={() => setScheduleDate(d => addWeeks(d, 1))}
                                    themeColor={primaryColor}
                                />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">94% Monthly Avg</span>
                            </div>
                        }
                    >
                        <ScheduleGrid 
                            type="attendance" 
                            themeColor={primaryColor} 
                            onCellClick={(day, hour) => setSelectedScheduleCell({ day, hour, type: 'attendance' })}
                            currentDate={scheduleDate}
                        />
                     </SectionCard>
                </main>
            )}

            {/* ── Time Table Tab ────────────────────────────────────────────── */}
            {activeTab === 'timetable' && (
                <main className="max-w-7xl mx-auto px-0 md:px-12 mt-10 pb-20">
                     <SectionCard 
                        title="Weekly Schedule"
                        headerAction={
                            <div className="flex items-center gap-6">
                                <WeekControls 
                                    currentDate={scheduleDate}
                                    onPrev={() => setScheduleDate(d => addWeeks(d, -1))}
                                    onNext={() => setScheduleDate(d => addWeeks(d, 1))}
                                    themeColor={primaryColor}
                                />
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline" style={{ color: primaryColor }}>
                                    Download PDF
                                </button>
                            </div>
                        }
                    >
                        <ScheduleGrid 
                            type="timetable" 
                            themeColor={primaryColor} 
                            onCellClick={(day, hour) => setSelectedScheduleCell({ day, hour, type: 'timetable' })}
                            currentDate={scheduleDate}
                        />
                     </SectionCard>
                </main>
            )}

            <TranscriptModal
                isOpen={isTranscriptModalOpen}
                onClose={() => setIsTranscriptModalOpen(false)}
                student={student}
                school={{
                    name: settings?.schoolName || student?.school?.name || 'Academic Institution',
                    logo: settings?.logo
                }}
                grades={grades}
                className={classNameLabel}
                primaryColor={primaryColor}
            />

            <Dialog open={!!selectedScheduleCell} onOpenChange={() => setSelectedScheduleCell(null)}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 border-none shadow-3xl">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl flex items-center justify-center shrink-0" 
                                style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}>
                                {selectedScheduleCell?.type === 'attendance' ? <UserCheck size={28} /> : <BookOpen size={28} />}
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {selectedScheduleCell?.type === 'attendance' ? 'Attendance Details' : 'Class Session'}
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {selectedScheduleCell?.day} · {selectedScheduleCell?.hour}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-8 space-y-6">
                        {selectedScheduleCell?.type === 'attendance' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-black text-emerald-500 uppercase">Present</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">08:05 AM</p>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} alt="Admin" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Logged by Admin</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">Institutional Registry</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                                        "Automated biometric verification completed at main gate terminal."
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest" style={{ color: primaryColor }}>Course Module</p>
                                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest" style={{ color: primaryColor, backgroundColor: `${primaryColor}15` }}>Core Subject</span>
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Advanced Mathematics</h4>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <MapPin size={14} className="text-slate-400" /> Building B, RM 402
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <Clock size={14} className="text-slate-400" /> 60 Minutes
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                    <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Teacher`} alt="Teacher" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Dr. Sarah Jenkins</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lead Instructor</p>
                                    </div>
                                    <button className="size-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                                        <Mail size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => setSelectedScheduleCell(null)}
                            className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Dismiss Record
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
