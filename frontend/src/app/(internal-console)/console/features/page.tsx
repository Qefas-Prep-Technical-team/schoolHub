"use client"

import { 
    usePlatformFeatures, 
    useUpdatePlatformFeature 
} from "@/lib/api/hooks/usePlatformSchools"
import { 
    Wrench as FeatureIcon,
    Shield as ShieldIcon,
    User as StudentIcon,
    Presentation as TeacherIcon,
    Users as ParentIcon,
    Lock as AdminIcon,
    Info as InfoIcon,
    Search as SearchIcon
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const ROLE_FEATURES: Record<string, string[]> = {
    student: ['dashboard', 'classes', 'assignments', 'grades', 'exams', 'attendance', 'documents', 'messages', 'linking', 'notifications', 'profile', 'settings', 'support', 'billing', 'aiStudy', 'timetable', 'googleLogin'],
    teacher: ['dashboard', 'students', 'parents', 'grades', 'classes', 'assignments', 'exams', 'documents', 'messages', 'notifications', 'linking', 'reports', 'resources', 'aiTools', 'timetable', 'profile', 'billing', 'settings', 'support', 'googleLogin'],
    parent: ['dashboard', 'children', 'assignments', 'grades', 'performance', 'attendance', 'behavior', 'messages', 'notifications', 'billing', 'resources', 'aiInsights', 'events', 'profile', 'settings', 'support', 'googleLogin'],
    admin: ['overview', 'schoolProfile', 'teachers', 'students', 'classes', 'linkingHub', 'sessions', 'grades', 'exams', 'subjects', 'departments', 'attendance', 'library', 'finance', 'payments', 'transactionHistory', 'reports', 'communication', 'gallery', 'aiTools', 'simulations', 'settings', 'support', 'googleLogin']
}

export default function PlatformFeaturesPage() {
    const { data: features, isLoading } = usePlatformFeatures()
    const { mutate: updateFeature } = useUpdatePlatformFeature()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeRole, setActiveRole] = useState("student")

    const handleToggle = (id: string, role: string, value: boolean) => {
        const updateData: any = {}
        updateData[`${role}Enabled`] = value
        updateFeature({ id, updateData })
    }

    const filteredFeatures = (role: string) => {
        const roleKeys = ROLE_FEATURES[role] || []
        return features?.filter((f: any) => {
            const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.featureKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.label?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const isForRole = roleKeys.includes(f.featureKey);
            
            return matchesSearch && isForRole;
        })
    }

    const roleData = {
        student: { icon: StudentIcon, color: "text-blue-500", label: "Student Portal" },
        teacher: { icon: TeacherIcon, color: "text-emerald-500", label: "Teacher Hub" },
        parent: { icon: ParentIcon, color: "text-orange-500", label: "Parent Portal" },
        admin: { icon: AdminIcon, color: "text-indigo-500", label: "Admin Console" }
    }

    const currentRole = roleData[activeRole as keyof typeof roleData]

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <FeatureIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">System Architecture</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Feature <span className="text-indigo-600 dark:text-indigo-500">Toggles</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                        Configure module visibility and permissions across all user roles globally.
                    </p>
                </div>
            </div>

            {/* Tabs for Roles */}
            <Tabs defaultValue="student" className="space-y-10" onValueChange={setActiveRole}>
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <TabsList className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-1.5 h-auto rounded-[2rem] shadow-sm">
                        <TabsTrigger value="student" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <StudentIcon size={16} /> Student
                        </TabsTrigger>
                        <TabsTrigger value="teacher" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <TeacherIcon size={16} /> Teacher
                        </TabsTrigger>
                        <TabsTrigger value="parent" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <ParentIcon size={16} /> Parent
                        </TabsTrigger>
                        <TabsTrigger value="admin" className="rounded-[1.5rem] px-8 py-3.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all">
                            <AdminIcon size={16} /> Admin
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative group min-w-[360px]">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <SearchIcon className={cn("transition-colors duration-300", currentRole.color)} size={20} />
                        </div>
                        <Input 
                            placeholder={`Search ${activeRole} features...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-16 bg-white dark:bg-slate-950 border-slate-200 dark:border-white/5 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900 dark:text-white border-2 focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                {['student', 'teacher', 'parent', 'admin'].map((role) => (
                    <TabsContent key={role} value={role} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Dynamic Header for Active Role */}
                        <div className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-white/5">
                            <div className={cn("p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/10", currentRole.color)}>
                                <currentRole.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Configuring <span className={currentRole.color}>{currentRole.label}</span>
                                </h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                                    Directly Attached Features & Modules
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {isLoading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-14 w-14 rounded-2xl" />
                                            <Skeleton className="h-8 w-1/2" />
                                        </div>
                                        <Skeleton className="h-24 w-full rounded-2xl" />
                                    </div>
                                ))
                            ) : filteredFeatures(role)?.map((feature: any) => (
                                <div 
                                    key={feature.id}
                                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
                                >
                                    <div className="flex items-start justify-between mb-8 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="h-16 w-16 rounded-[1.25rem] bg-indigo-500/5 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10 group-hover:scale-110 transition-transform duration-500">
                                                <FeatureIcon size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2.5">
                                                    {feature.label || feature.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-black bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 tracking-widest py-0.5">
                                                        {feature.featureKey.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-3 bg-slate-50/50 dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5">
                                            <Switch 
                                                checked={feature[`${role}Enabled`]} 
                                                onCheckedChange={(val) => handleToggle(feature.id, role, val)}
                                                className="data-[state=checked]:bg-indigo-500 h-7 w-12"
                                            />
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                feature[`${role}Enabled`] ? "text-emerald-500" : "text-slate-400"
                                            )}>
                                                {feature[`${role}Enabled`] ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-6 rounded-3xl border border-slate-100 dark:border-white/5 flex items-start gap-4 transition-colors group-hover:bg-indigo-500/[0.02] group-hover:dark:bg-indigo-500/[0.05]">
                                        <InfoIcon size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                        <p>{feature.description || "No description provided for this core module."}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredFeatures(role)?.length === 0 && (
                            <div className="py-40 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
                                <div className="bg-slate-50 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <FeatureIcon size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600">No {role} features found</h3>
                                <p className="text-slate-400 dark:text-slate-600 font-bold mt-2">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
