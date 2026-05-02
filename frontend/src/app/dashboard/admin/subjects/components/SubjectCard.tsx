'use client';

import React from "react"
import { Subject } from "../services/subjectService"
import { 
  Edit2, 
  ArrowRight, 
  Layers, 
  Users, 
  Globe, 
  Lock, 
  BookOpen, 
  Atom, 
  Calculator, 
  History as HistoryIcon, 
  Rocket, 
  Palette, 
  BookText,
  Workflow
} from "lucide-react"
import { useSchoolSettings } from "@/lib/api/hooks/useSchool"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { Button } from "@/components/ui/button"

interface SubjectCardProps {
  subject: Subject
  onEdit?: (subject: Subject) => void
  onView?: (subject: Subject) => void
  onArchive?: (id: string) => void
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onEdit, onView }) => {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const getIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes("BIO")) return <Atom className="size-full" />;
    if (c.includes("MAT")) return <Calculator className="size-full" />;
    if (c.includes("HIS")) return <HistoryIcon className="size-full" />;
    if (c.includes("PHY")) return <Rocket className="size-full" />;
    if (c.includes("ART")) return <Palette className="size-full" />;
    if (c.includes("LIT")) return <BookText className="size-full" />;
    return <BookOpen className="size-full" />;
  }

  return (
    <div 
      className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
      style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
      onClick={() => onView?.(subject)}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" 
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex items-center gap-5">
          <div 
            className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center p-4 text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5 shadow-inner"
            style={{ color: primaryColor }}
          >
            {getIcon(subject.code)}
          </div>
          <div className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {subject.code}
            </span>
          </div>
        </div>

        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(subject);
          }}
          variant="ghost"
          size="icon"
          className="size-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          <Edit2 size={18} />
        </Button>
      </div>
      
      <div className="flex-1 relative z-10">
        <h3 
          className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter"
          style={{ '--primary': primaryColor } as any}
        >
          {subject.name}
        </h3>
        <p className="text-sm font-medium text-slate-500 line-clamp-2 mb-8 leading-relaxed italic">
          "{subject.description || "No curriculum parameters defined for this module node."}"
        </p>
      </div>
      
      <div className="pt-8 border-t border-slate-50 dark:border-white/5 flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="size-8 rounded-xl border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                             <Users size={14} className="text-slate-400" />
                        </div>
                    ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {subject.teachersCount || 0} Faculty Nodes
                </span>
            </div>
            
            <div className={cn(
              "flex items-center gap-2 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
              subject.scope === "SCHOOL" 
                ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                : "bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
            )}>
              {subject.scope === "SCHOOL" ? <Globe size={10} /> : <Lock size={10} />}
              <span>{subject.scope === "SCHOOL" ? "Institutional" : "Localized"}</span>
            </div>
        </div>
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Workflow size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {subject.classesCount || 0} Active Channels
                </span>
            </div>
            <div 
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all"
              style={{ color: primaryColor }}
            >
                <span>Synchronize</span>
                <ArrowRight size={14} strokeWidth={3} />
            </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectCard

