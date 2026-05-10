"use client"

import { 
    Trash2, 
    Sparkles, 
    Info as InfoIcon,
    User as StudentIcon,
    Presentation as TeacherIcon,
    Users as ParentIcon,
    Lock as AdminIcon,
    RefreshCcw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
    feature: any
    mode: 'registry' | 'role'
    activeRole?: string
    onToggle?: (id: string, role: string, value: boolean) => void
    onDelete?: (feature: any) => void
    isUpdating?: boolean
}

const ROLE_CONFIG = [
    { role: 'student', icon: StudentIcon, bg: 'bg-blue-500/10', color: 'text-blue-500' },
    { role: 'teacher', icon: TeacherIcon, bg: 'bg-indigo-500/10', color: 'text-indigo-500' },
    { role: 'parent', icon: ParentIcon, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
    { role: 'admin', icon: AdminIcon, bg: 'bg-purple-500/10', color: 'text-purple-500' }
]

export default function FeatureCard({ 
    feature, 
    mode, 
    activeRole, 
    onToggle, 
    onDelete,
    isUpdating = false
}: FeatureCardProps) {
    if (mode === 'registry') {
        return (
            <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden">
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {feature.name}
                            </h4>
                            <code className="text-[10px] font-mono text-indigo-500 font-bold uppercase tracking-tighter">
                                {feature.featureKey}
                            </code>
                        </div>
                        <div className="flex items-center gap-2">
                            {isUpdating && <RefreshCcw size={14} className="animate-spin text-indigo-500" />}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onDelete?.(feature)}
                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Role Assignments</span>
                            <div className="flex gap-2">
                                {ROLE_CONFIG.map((r) => {
                                    const roleKey = `${r.role}Enabled`;
                                    const isEnabled = feature[roleKey] !== false;
                                    return (
                                        <button
                                            key={r.role}
                                            disabled={isUpdating}
                                            onClick={() => onToggle?.(feature.id, r.role, !isEnabled)}
                                            className={cn(
                                                "p-2.5 rounded-xl transition-all border group/btn",
                                                isEnabled 
                                                ? `${r.bg} ${r.color} border-transparent shadow-sm` 
                                                : "bg-slate-50 dark:bg-slate-950/50 text-slate-400 border-slate-100 dark:border-white/5 grayscale opacity-50",
                                                isUpdating && "cursor-not-allowed opacity-50"
                                            )}
                                            title={`Toggle ${r.role} visibility`}
                                        >
                                            <r.icon size={14} className={isEnabled ? "scale-110" : "scale-100"} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active in Plans</span>
                            <div className="flex flex-wrap gap-2">
                            {feature.planAccess?.length > 0 ? (
                                feature.planAccess.map((pa: any) => (
                                    <Badge 
                                        key={pa.plan.id}
                                        variant="outline" 
                                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-lg text-[9px] px-2 py-0.5"
                                    >
                                        {pa.plan.name}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-[10px] font-medium text-slate-400 italic">Not assigned to any plans</span>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Role Mode
    const isEnabled = feature[`${activeRole}Enabled`] !== false;
    return (
        <div className={cn(
            "group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500",
            isEnabled ? "ring-2 ring-indigo-500/20 shadow-xl" : "border-dashed opacity-80 hover:opacity-100 bg-slate-50/50 dark:bg-slate-900/50"
        )}>
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-500",
                            isEnabled ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400 grayscale"
                        )}>
                            {isUpdating ? <RefreshCcw size={24} className="animate-spin" /> : <Sparkles size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2.5">
                                {feature.name}
                            </h3>
                            <div className="flex flex-col gap-1">
                                <Badge variant="outline" className="text-[9px] font-black bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 tracking-widest py-0.5 w-fit uppercase">
                                    {feature.featureKey}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    
                    
                    <div className={cn(
                        "flex flex-col items-end gap-3 p-4 rounded-3xl border transition-all duration-300",
                        isEnabled 
                        ? "bg-indigo-500/5 border-indigo-500/20 shadow-inner" 
                        : "bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/5"
                    )}>
                        <div className="flex items-center gap-3">
                            {isUpdating && <RefreshCcw size={12} className="animate-spin text-indigo-500" />}
                            <Switch 
                                checked={isEnabled} 
                                onCheckedChange={(val) => onToggle?.(feature.id, activeRole!, val)}
                                disabled={isUpdating}
                                className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-slate-300 h-7 w-12"
                            />
                        </div>
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-[0.2em]",
                            isUpdating ? "text-indigo-400 animate-pulse" : (isEnabled ? "text-emerald-500" : "text-rose-500 font-black")
                        )}>
                            {isUpdating ? "Updating..." : (isEnabled ? "Module Active" : "Module Inactive")}
                        </span>
                    </div>
                </div>
                
                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-start gap-4 transition-colors group-hover:bg-indigo-500/[0.02] group-hover:dark:bg-indigo-500/[0.05]">
                    <InfoIcon size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                    <p>{feature.description || "No description provided for this core module."}</p>
                </div>
            </div>
        </div>
    )
}
