'use client';

import React from "react";
import { Subject } from "../services/subjectService";
import {
  Edit2,
  ArrowRight,
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
  Workflow,
  Trash2
} from "lucide-react";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SubjectCardProps {
  subject: Subject;
  onEdit?: (subject: Subject) => void;
  onView?: (subject: Subject) => void;
  onArchive?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  onEdit, 
  onView,
  selected = false,
  onSelect,
  onDelete
}) => {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const getIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes("BIO")) return <Atom className="size-full animate-spin-slow" />;
    if (c.includes("MAT")) return <Calculator className="size-full" />;
    if (c.includes("HIS")) return <HistoryIcon className="size-full" />;
    if (c.includes("PHY")) return <Rocket className="size-full" />;
    if (c.includes("ART")) return <Palette className="size-full" />;
    if (c.includes("LIT")) return <BookText className="size-full" />;
    return <BookOpen className="size-full" />;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col min-h-[220px]"
      style={{ 
        boxShadow: `0 15px 30px -10px ${primaryColor}08`
      }}
      onClick={() => onView?.(subject)}
    >
      {/* Side Color bar - subtle & clean */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all duration-300 rounded-l-3xl"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Modern Ambient Corner Glow */}
      <div
        className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-[50px] opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Section */}
      <div className="flex justify-between items-start mb-5 relative z-10 pl-1">
        <div className="flex items-center gap-3">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(subject.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="size-4 rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer transition-all bg-white dark:bg-slate-900"
            />
          )}
          <div
            className="size-11 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center p-2.5 text-slate-400 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 border border-slate-100/50 dark:border-white/5 shadow-inner"
            style={{ color: primaryColor }}
          >
            {getIcon(subject.code)}
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5 rounded-md">
            {subject.code}
          </span>
        </div>

        {/* Dynamic Action Buttons: Fade in on hover */}
        <div className="flex items-center gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-20">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(subject);
            }}
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          >
            <Edit2 size={13} />
          </Button>
          {onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subject.id);
              }}
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg bg-red-50/50 hover:bg-red-50 dark:bg-red-500/5 hover:dark:bg-red-500/10 border border-transparent hover:border-red-100 dark:hover:border-red-500/20 flex items-center justify-center text-red-500 transition-all shadow-sm"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Subject Information */}
      <div className="flex-1 relative z-10 pl-1 mb-5">
        <h3
          className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight"
          style={{ '--primary': primaryColor } as any}
        >
          {subject.name}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed font-normal">
          {subject.description || "No description provided for this subject."}
        </p>
      </div>

      {/* Dynamic Summary Section */}
      <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between relative z-10 pl-1 mt-auto">
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Users size={12} className="text-slate-400" />
            {subject.teachersCount || 0}
          </span>
          <span className="text-slate-200 dark:text-slate-800">•</span>
          <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Workflow size={12} className="text-slate-400" />
            {subject.classesCount || 0}
          </span>
        </div>

        {/* Badges & Action Link */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
            subject.scope === "SCHOOL"
              ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : "bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
          )}>
            {subject.scope === "SCHOOL" ? <Globe size={9} /> : <Lock size={9} />}
            <span>{subject.scope === "SCHOOL" ? "School" : "Private"}</span>
          </div>

          <motion.div
            whileHover={{ scale: 1.1, x: 2 }}
            className="flex items-center justify-center size-7 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-white transition-all duration-300"
            style={{ 
              backgroundColor: `${primaryColor}10`,
              color: primaryColor
            }}
          >
            <ArrowRight size={12} strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
