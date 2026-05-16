"use client"
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTeacherDetails } from '@/lib/api/hooks/useAdmin'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { useSchoolSettings } from '@/lib/api/hooks/useSchool'
import SchedulePage from './schedule/SchedulePage'
import PerformancePage from './performance/PerformancePage'
import { EditTeacherModal } from '../components/EditTeacherModal'
import {
    Loader2, ArrowLeft, Edit2, Mail, Phone, MapPin,
    BookOpen, GraduationCap, Users, Briefcase, Star,
    ShieldCheck, Clock, ChevronRight, Award, UserCheck,
    Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("bg-white dark:bg-slate-900 border-y md:border border-slate-200 dark:border-slate-800 rounded-none md:rounded-[2rem] overflow-hidden", className)}>
            <div className="p-6 md:p-8 space-y-6">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
                {children}
            </div>
        </div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'performance', label: 'Performance' },
]

export default function TeacherProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuthStore()
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ''
    const teacherId = typeof params.teacherId === 'string' ? params.teacherId : Array.isArray(params.teacherId) ? params.teacherId[0] : ''

    const { data: teacher, isLoading, error } = useTeacherDetails(teacherId)
    const { data: settings } = useSchoolSettings(schoolId)
    const primaryColor = settings?.themeColor || '#2563eb'

    const [activeTab, setActiveTab] = useState('overview')
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="size-14 rounded-full border-4 border-slate-100 dark:border-white/10 animate-spin" style={{ borderTopColor: primaryColor }} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Profile...</p>
            </div>
        )
    }

    if (error || !teacher) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-bold text-red-500">Failed to load teacher profile.</p>
            </div>
        )
    }

    // ── Data Transformation ──────────────────────────────────────────────────
    const isVerified = !!teacher.verified
    const isClaimed = !!teacher.isClaimed
    const canEdit = teacher.primarySchoolId === schoolId && !isClaimed

    const name = teacher.name || 'Unknown Teacher'
    const email = teacher.email || 'No email registered'
    const phone = teacher.phone || 'Not provided'
    const address = teacher.address || 'Not provided'
    const gender = teacher.gender || 'Not specified'
    const department = teacher.department?.name || 'General'
    const qualification = teacher.highestQualification || 'Not specified'
    const experience = teacher.yearsOfExperience ? `${teacher.yearsOfExperience} Years` : 'Not specified'
    const teacherCode = teacher.teacherCode || 'UNASSIGNED'
    const subjects: string[] = teacher.teacherSubjects?.map((ts: any) => ts.subject.name) || []
    const classes: string[] = teacher.classTeachers?.map((ct: any) => ct.class.name) || []
    const avatar = teacher.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb&fontFamily=Arial&fontSize=40&fontWeight=900`

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

            {/* ── Banner ──────────────────────────────────────────────────── */}
            <section className="relative h-40 md:h-64 w-full overflow-hidden">
                <div className="absolute inset-0" style={{
                    background: `linear-gradient(135deg, ${primaryColor}CC 0%, ${primaryColor}66 50%, ${primaryColor}22 100%)`
                }} />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)' }} />
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/30 transition-all"
                >
                    <ArrowLeft size={14} strokeWidth={3} />
                    <span className="hidden sm:inline">Back</span>
                </button>
            </section>

            {/* ── Profile Header ───────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 -mt-12 md:-mt-20 relative z-20 px-0 sm:px-0">

                    {/* Avatar */}
                    <div className="size-28 md:size-44 rounded-3xl md:rounded-[2rem] bg-white dark:bg-slate-900 p-1.5 shadow-2xl border-[4px] border-slate-100 dark:border-slate-950 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={avatar} alt={name} className="w-full h-full rounded-2xl md:rounded-[1.5rem] object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2 md:pt-20 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
                                    {name}
                                </h1>
                                <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400">
                                    {department} {subjects.length > 0 ? `· ${subjects.slice(0, 2).join(', ')}` : ''}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        <MapPin size={12} style={{ color: primaryColor }} />
                                        {address !== 'Not provided' ? address : 'Location not set'}
                                    </span>
                                    <span className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                        isVerified
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                    )}>
                                        <ShieldCheck size={10} />
                                        {isVerified ? 'Verified' : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {canEdit && (
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="h-11 w-full sm:w-auto px-6 rounded-full text-white font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Edit2 size={14} strokeWidth={3} /> Edit Profile
                                    </button>
                                )}
                                <a
                                    href={`mailto:${email}`}
                                    className="h-11 w-full sm:w-auto px-6 rounded-full border-2 border-slate-200 dark:border-slate-700 font-black uppercase tracking-widest text-[10px] text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                    <Mail size={14} /> Message
                                </a>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="flex items-center gap-6 pt-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                <span className="text-slate-900 dark:text-white font-black">{subjects.length}</span> Subjects
                            </p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                <span className="text-slate-900 dark:text-white font-black">{classes.length}</span> Classes
                            </p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{teacherCode}</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mt-6 md:mt-8">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide bg-white dark:bg-slate-900 rounded-none md:rounded-2xl border-y md:border border-slate-200 dark:border-slate-800 p-1.5">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-shrink-0 px-5 md:px-8 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "text-white shadow-md"
                                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                <main className="max-w-7xl mx-auto px-0 md:px-12 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-16">

                    {/* ── Left Main Column ────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">

                        {/* About / Bio */}
                        <SectionCard title="About">
                            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                {(teacher as any).bio || `${name} is a dedicated educator in the ${department} department with ${experience} of professional teaching experience. Specializing in ${subjects.slice(0, 2).join(' and ') || 'multiple subjects'}, they are committed to inspiring students through innovative and engaging learning methodologies.`}
                            </p>
                        </SectionCard>

                        {/* Personal Information */}
                        <SectionCard title="Personal Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoRow icon={Mail} label="Email Address" value={email} themeColor={primaryColor} />
                                <InfoRow icon={Phone} label="Phone Number" value={phone} themeColor={primaryColor} />
                                <InfoRow icon={MapPin} label="Address" value={address} themeColor={primaryColor} />
                                <InfoRow icon={Users} label="Gender" value={gender} themeColor={primaryColor} />
                                <InfoRow icon={GraduationCap} label="Highest Qualification" value={qualification} themeColor={primaryColor} />
                                <InfoRow icon={Clock} label="Years of Experience" value={experience} themeColor={primaryColor} />
                            </div>
                        </SectionCard>

                        {/* Teaching Portfolio */}
                        <SectionCard title="Teaching Portfolio">
                            <div className="space-y-6">
                                {/* Subjects */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} style={{ color: primaryColor }} />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Subjects Taught</p>
                                    </div>
                                    {subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {subjects.map((s, i) => (
                                                <span key={i} className="px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No subjects assigned.</p>
                                    )}
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800" />

                                {/* Classes */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Award size={16} style={{ color: primaryColor }} />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Classes</p>
                                    </div>
                                    {classes.length > 0 ? (
                                        <div className="space-y-2">
                                            {classes.map((c, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{c}</span>
                                                    <ChevronRight size={16} className="text-slate-300" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No classes assigned.</p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* ── Sidebar ──────────────────────────────────────────── */}
                    <div className="space-y-4 md:space-y-6">

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4 px-4 md:px-0">
                            {[
                                { label: 'Subjects', value: subjects.length, icon: BookOpen, color: primaryColor },
                                { label: 'Classes', value: classes.length, icon: Users, color: '#10b981' },
                                { label: 'Verified', value: isVerified ? 'Yes' : 'No', icon: ShieldCheck, color: isVerified ? '#10b981' : '#f59e0b' },
                                { label: 'Claimed', value: isClaimed ? 'Yes' : 'No', icon: UserCheck, color: isClaimed ? '#10b981' : '#f59e0b' },
                            ].map((stat, i) => (
                                <div key={i} className="p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <div className="size-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}12`, color: stat.color }}>
                                        <stat.icon size={16} />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Account Status */}
                        <SectionCard title="Account Status">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("size-2.5 rounded-full", isVerified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500")} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Verification</span>
                                    </div>
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", isVerified ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" : "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20")}>
                                        {isVerified ? 'Verified' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("size-2.5 rounded-full", isClaimed ? "bg-emerald-500" : "bg-slate-300")} />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Account Claimed</span>
                                    </div>
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", isClaimed ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" : "text-slate-500 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700")}>
                                        {isClaimed ? 'Claimed' : 'Unclaimed'}
                                    </span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Professional Details */}
                        <SectionCard title="Professional Details">
                            <div className="space-y-5">
                                <InfoRow icon={Briefcase} label="Department" value={department} themeColor={primaryColor} />
                                <InfoRow icon={GraduationCap} label="Qualification" value={qualification} themeColor={primaryColor} />
                                <InfoRow icon={Clock} label="Experience" value={experience} themeColor={primaryColor} />
                                <InfoRow icon={Building2} label="Teacher ID" value={teacherCode} themeColor={primaryColor} />
                            </div>
                        </SectionCard>

                        {/* System Health */}
                        <div className="p-6 md:p-8 rounded-none md:rounded-[2rem] bg-slate-900 dark:bg-slate-800 text-white space-y-4 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <Star size={70} style={{ color: primaryColor }} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Staff Profile</p>
                                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none mt-1">
                                    {isVerified ? 'Active' : 'Awaiting'}<br />
                                    {isVerified ? 'Educator' : 'Verification'}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={cn("size-2 rounded-full", isVerified ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                                <span className={cn("text-[9px] font-black uppercase tracking-widest", isVerified ? "text-emerald-500" : "text-amber-500")}>
                                    {isVerified ? 'Profile Active' : 'Pending Review'}
                                </span>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {/* ── Schedule Tab ─────────────────────────────────────────────── */}
            {activeTab === 'schedule' && (
                <div className="max-w-7xl mx-auto px-4 md:px-12 mt-6 pb-16">
                    <SchedulePage teacher={teacher} teacherId={teacherId} primaryColor={primaryColor} />
                </div>
            )}

            {/* ── Performance Tab ──────────────────────────────────────────── */}
            {activeTab === 'performance' && (
                <div className="max-w-7xl mx-auto px-4 md:px-12 mt-6 pb-16">
                    <PerformancePage />
                </div>
            )}

            {/* ── Edit Modal ───────────────────────────────────────────────── */}
            <EditTeacherModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                primaryColor={primaryColor}
                teacher={{
                    id: teacher.id,
                    name: teacher.name,
                    gender: (teacher as any).gender,
                    department: (teacher as any).department
                }}
            />
        </div>
    )
}
