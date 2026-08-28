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
  viewMode?: "grid" | "list";
}

const SubjectCard: React.FC<SubjectCardProps> = ({ 
  subject, 
  onEdit, 
  onView,
  selected = false,
  onSelect,
  onDelete,
  viewMode = "grid"
}) => {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const getIcon = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes("BIO")) return <Atom size={18} className="animate-spin-slow" />;
    if (c.includes("MAT")) return <Calculator size={18} />;
    if (c.includes("HIS")) return <HistoryIcon size={18} />;
    if (c.includes("PHY")) return <Rocket size={18} />;
    if (c.includes("ART")) return <Palette size={18} />;
    if (c.includes("LIT")) return <BookText size={18} />;
    return <BookOpen size={18} />;
  };

  const getIconGrid = (code: string) => {
    const c = code.toUpperCase();
    if (c.includes("BIO")) return <Atom className="size-full animate-spin-slow" />;
    if (c.includes("MAT")) return <Calculator className="size-full" />;
    if (c.includes("HIS")) return <HistoryIcon className="size-full" />;
    if (c.includes("PHY")) return <Rocket className="size-full" />;
    if (c.includes("ART")) return <Palette className="size-full" />;
    if (c.includes("LIT")) return <BookText className="size-full" />;
    return <BookOpen className="size-full" />;
  };

  if (viewMode === 'list') {
      return (
          <motion.div
              onClick={() => onView?.(subject)}
              className="group relative grid grid-cols-1 md:grid-cols-[auto_2.5fr_1.5fr_1.5fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 transition-all duration-300 first:rounded-t-2xl last:rounded-b-2xl last:border-0 z-10 cursor-pointer"
          >
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none -z-10 rounded-inherit" />
              
              <div className="flex items-center justify-center">
                  {onSelect && (
                      <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                              e.stopPropagation();
                              onSelect(subject.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                      />
                  )}
              </div>

              <div className="flex items-center gap-4">
                  <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-slate-100/50 dark:border-white/5"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                      {getIcon(subject.code)}
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1 group-hover:text-primary transition-colors">{subject.name}</h4>
                      <span className="text-xs text-slate-400 line-clamp-1 italic max-w-md">{subject.description || "No description provided."}</span>
                  </div>
              </div>

              <div className="hidden md:flex items-center">
                  <span className="font-mono text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg">
                      {subject.code}
                  </span>
              </div>

              <div className="hidden md:flex flex-wrap gap-2">
                  {subject.departments && subject.departments.length > 0 ? (
                      subject.departments.map(d => (
                          <span key={d.departmentId} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-100 dark:border-white/10">
                              {d.department?.name}
                          </span>
                      ))
                  ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/5 text-red-500 border border-transparent">
                          Unassigned
                      </span>
                  )}
              </div>

              <div className="hidden md:flex items-center justify-center gap-2">
                   <span className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                       <Users size={14} className="text-slate-400" />
                       {subject.teachersCount || 0}
                   </span>
              </div>

              <div className="hidden md:flex items-center justify-center">
                   <span className={cn(
                       "inline-flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                       subject.scope === "SCHOOL"
                           ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                           : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                   )}>
                       {subject.scope === "SCHOOL" ? "School-wide" : "Private"}
                   </span>
              </div>

              <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Button
                      onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(subject);
                      }}
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
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
                          className="size-8 rounded-lg bg-red-50/50 hover:bg-red-50 dark:bg-red-500/5 hover:dark:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 flex items-center justify-center text-red-500 transition-all shadow-sm"
                      >
                          <Trash2 size={13} />
                      </Button>
                  )}
              </div>
          </motion.div>
      );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col min-h-[200px] shadow-sm"
      onClick={() => onView?.(subject)}
    >
      {/* Top Header: Icon & Actions */}
      <div className="flex justify-between items-start mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        >
          {getIconGrid(subject.code)}
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(subject);
            }}
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Edit2 size={14} />
          </Button>
          {onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(subject.id);
              }}
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex-1 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {subject.name}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
            {subject.code}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {subject.description || "No description provided for this subject."}
        </p>
      </div>

      {/* Footer Metrics */}
      <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Users size={12} />
              Teachers
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {subject.teachersCount || 0}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Workflow size={12} />
              Classes
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {subject.classesCount || 0}
            </span>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
          subject.scope === "SCHOOL"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        )}>
          {subject.scope === "SCHOOL" ? <Globe size={12} /> : <Lock size={12} />}
          <span>{subject.scope === "SCHOOL" ? "School" : "Private"}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;

