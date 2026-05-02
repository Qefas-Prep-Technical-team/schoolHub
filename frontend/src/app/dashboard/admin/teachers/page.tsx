"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { useSchoolTeachers, useSchoolSettings } from '@/lib/api/hooks/useSchool'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  GraduationCap, 
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Download,
  Mail,
  ChevronRight,
  UserCheck,
  TrendingUp,
  Globe,
  Cpu,
  LayoutGrid,
  List
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ManageTeachersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const router = useRouter()
  const { user } = useAuthStore()
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ''
  
  const { data: teachersData, isLoading } = useSchoolTeachers(schoolId)
  const { data: settings } = useSchoolSettings(schoolId)
  const primaryColor = settings?.themeColor || '#2563eb'

  const teachersList = useMemo(() => {
    if (!teachersData || !Array.isArray(teachersData)) return []
    return teachersData.map((t: any) => ({
      id: t.id,
      teacherCode: t.teacherCode,
      name: t.name,
      email: t.email || 'No Email Registered',
      subjects: t.subjects?.map((s: any) => s.name) || ['General'],
      classes: t.classes?.map((c: any) => c.name) || [],
      status: t.verified ? 'active' : 'pending',
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

  const stats = [
    { 
        label: 'Total Faculty', 
        value: teachersList.length, 
        icon: Users, 
        color: primaryColor,
        desc: 'Institutional Nodes'
    },
    { 
        label: 'Verified Personnel', 
        value: teachersList.filter(t => t.status === 'active').length, 
        icon: ShieldCheck, 
        color: '#10b981', // Emerald
        desc: 'Authenticated Nodes'
    },
    { 
        label: 'Active Channels', 
        value: '12', 
        icon: Activity, 
        color: '#2563eb', // Indigo
        desc: 'Instructional Streams'
    },
    { 
        label: 'Pending Protocols', 
        value: teachersList.filter(t => t.status === 'pending').length, 
        icon: Zap, 
        color: '#f59e0b', // Amber
        desc: 'Await Auth'
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Human Capital Terminal</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Faculty Network<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Advanced instructional personnel management, faculty node synchronization, and operational authorization.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}4D` }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 hover:scale-105 active:scale-95 transition-all border-0"
              onClick={() => {}}
            >
              <UserPlus size={20} strokeWidth={3} />
              Add New Faculty
            </Button>
          </div>
        </div>

        {/* Tactical Analytics Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <div 
                    key={index}
                    className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 relative overflow-hidden group transition-all"
                    style={{ boxShadow: `0 25px 50px -12px ${stat.color}15` }}
                >
                    <div 
                        className="absolute -right-6 -bottom-6 size-40 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" 
                        style={{ backgroundColor: stat.color }}
                    />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div 
                                className="size-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110"
                                style={{ 
                                    backgroundColor: `${stat.color}10`,
                                    borderColor: `${stat.color}20`,
                                    color: stat.color
                                }}
                            >
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <TrendingUp size={10} /> Live
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} className="text-slate-300" /> {stat.desc}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Operational Control Terminal */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search faculty nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="flex bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-sm">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-slate-50 dark:bg-white/10 shadow-inner" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                    >
                      <LayoutGrid size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-slate-50 dark:bg-white/10 shadow-inner" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                    >
                      <List size={20} strokeWidth={3} />
                    </button>
                 </div>
                 <Button variant="outline" className="h-16 px-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 hidden sm:flex hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <Download size={22} strokeWidth={3} className="text-slate-400" />
                 </Button>
            </div>
        </div>

        {/* Dynamic Personnel Registry */}
        <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
                <motion.div
                    key="grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {isLoading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] rounded-[4rem] bg-slate-50 dark:bg-white/5" />)
                    ) : filteredTeachers.map((teacher) => (
                        <div 
                            key={teacher.id}
                            className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[4rem] p-10 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
                            style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
                            onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}
                        >
                            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: primaryColor }} />
                            
                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div 
                                    className="size-24 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 group-hover:scale-110 transition-transform duration-500"
                                    style={{ boxShadow: `0 20px 25px -5px ${primaryColor}33` }}
                                >
                                    <img src={teacher.profileImage} alt={teacher.name} className="size-full object-cover" />
                                </div>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    teacher.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                )}>
                                    {teacher.status}
                                </div>
                            </div>

                            <div className="flex-1 relative z-10">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-[0.9] uppercase tracking-tighter" style={{ '--primary': primaryColor } as any}>
                                    {teacher.name}
                                </h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{teacher.email}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-10">
                                    {teacher.subjects.slice(0, 3).map((subject: string, i: number) => (
                                        <span key={i} className="text-[9px] font-black bg-slate-50 dark:bg-white/5 text-slate-500 px-3 py-1 rounded-lg border border-slate-100 dark:border-white/10 uppercase tracking-tighter">
                                            {subject}
                                        </span>
                                    ))}
                                    {teacher.subjects.length > 3 && (
                                        <span className="text-[9px] font-black bg-slate-50 dark:bg-white/5 text-slate-400 px-3 py-1 rounded-lg border border-slate-100 dark:border-white/10 uppercase tracking-tighter">
                                            +{teacher.subjects.length - 3} More
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty ID</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{teacher.teacherCode || 'UNASSIGNED'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all" style={{ color: primaryColor }}>
                                    <span>Access Profile</span>
                                    <ArrowRight size={14} strokeWidth={3} />
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
                    className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[4rem] overflow-hidden transition-all"
                    style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialization</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID HASH</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Status</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="size-16 rounded-full border-4 border-slate-100 dark:border-white/5 border-t-primary animate-spin" style={{ borderTopColor: primaryColor }} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Faculty Network...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer" onClick={() => router.push(`/dashboard/admin/teachers/${teacher.id}`)}>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="size-16 rounded-3xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition-transform">
                                                    <img src={teacher.profileImage} alt={teacher.name} className="size-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                                        {teacher.name}
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{teacher.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-wrap gap-2">
                                                {teacher.subjects.slice(0, 2).map((subject: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="rounded-xl px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-slate-50/50 dark:bg-white/5 border-none text-slate-500">
                                                        {subject}
                                                    </Badge>
                                                ))}
                                                {teacher.subjects.length > 2 && <span className="text-[9px] font-black text-slate-400 uppercase">+{teacher.subjects.length - 2} More</span>}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <code className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200 dark:border-white/5">
                                                {teacher.teacherCode || 'UNASSIGNED'}
                                            </code>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("size-2 rounded-full", teacher.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", teacher.status === 'active' ? 'text-emerald-600' : 'text-amber-600')}>
                                                    {teacher.status === 'active' ? 'Verified Node' : 'Pending Auth'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <Button variant="ghost" size="icon" className="size-12 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                <ChevronRight size={20} className="text-slate-400" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  )
}

