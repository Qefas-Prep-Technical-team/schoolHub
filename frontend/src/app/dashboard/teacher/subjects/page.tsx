'use client';

import React, { useState, useMemo, useEffect } from "react";
import { BookOpen, Search, LayoutGrid, List, GraduationCap, Globe, Building2, Sparkles } from "lucide-react";
import SubjectCard from "../../admin/subjects/components/SubjectCard";
import { useTeacherSubjects } from "@/lib/api/hooks/useTeacher";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";

const TeacherSubjectsPage = () => {
  const router = useRouter();
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const schoolId = selectedSchoolId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#059669'; // Emerald-600

  const { data: subjectsData, isLoading } = useTeacherSubjects(schoolId);
  const subjects = useMemo(() => {
    return Array.isArray(subjectsData) ? subjectsData : (subjectsData as any)?.data || [];
  }, [subjectsData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // On mobile screens, default to Grid View
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject: any) => 
      subject.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery]);

  // Derived Metrics for Stat Cards
  const totalClassesLinked = useMemo(() => {
    return subjects.reduce((acc: number, s: any) => acc + (s.classesCount || s.classes?.length || 0), 0);
  }, [subjects]);

  const schoolWideCount = useMemo(() => {
    return subjects.filter((s: any) => s.scope === "SCHOOL").length;
  }, [subjects]);

  const departmentCount = useMemo(() => {
    const deptSet = new Set<string>();
    subjects.forEach((s: any) => {
      s.departments?.forEach((d: any) => {
        if (d.departmentId || d.department?.name) {
          deptSet.add(d.departmentId || d.department?.name);
        }
      });
    });
    return deptSet.size;
  }, [subjects]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-transparent p-3.5 sm:p-6 md:p-8 lg:p-10 transition-colors duration-500 font-display">
      <div className="max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                My Subjects
              </h1>
              <HeaderTooltip 
                content={`Centralized overview of your assigned teaching disciplines and curriculum responsibilities. Use this console to review course codes, explore assigned student cohorts, track department linkages, and configure subject-specific grading policies. You are currently viewing ${subjects.length} active subject${subjects.length === 1 ? '' : 's'}${searchQuery ? ` matching query "${searchQuery}"` : ''}.`}
              />
            </div>
            <p className="text-slate-700 dark:text-slate-300 mt-1 font-bold text-xs bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-0.5 rounded-full w-fit">
              {selectedSchoolName || "Assigned Teaching Syllabus"}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/50 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="size-2 rounded-full animate-pulse bg-emerald-500" />
            <span>Academic Registry</span>
          </div>
        </div>

        {/* Top Stat Cards — 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard 
            label="Total Subjects" 
            value={subjects.length} 
            icon={BookOpen} 
            color="text-emerald-500" 
            bgColor="bg-emerald-500/10" 
            tooltip="Total count of academic subjects assigned to you across the institution. Use this metric to gauge your overall syllabus breadth and ensure all your course responsibilities are accurately linked to your profile." 
          />
          <StatCard 
            label="Class Cohorts" 
            value={totalClassesLinked} 
            icon={GraduationCap} 
            color="text-blue-500" 
            bgColor="bg-blue-500/10" 
            tooltip="Aggregates the total number of classroom cohorts and section blocks receiving instruction in your subjects. Use this to track cohort distribution and verify class timetable coverage." 
          />
          <StatCard 
            label="Institutional Core" 
            value={schoolWideCount} 
            icon={Globe} 
            color="text-purple-500" 
            bgColor="bg-purple-500/10" 
            tooltip="Shows subjects configured with school-wide standard curriculum guidelines. Use this to distinguish universally standardized course offerings from custom, level-specific electives." 
          />
          <StatCard 
            label="Departments" 
            value={departmentCount} 
            icon={Building2} 
            color="text-amber-500" 
            bgColor="bg-amber-500/10" 
            tooltip="Quantifies the academic faculties and specialized departments supervising your subject modules. Use this to ensure your curriculum aligns with cross-departmental standards and oversight." 
          />
        </div>

        {/* Controls Bar: Search & View Toggle */}
        <div className="p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/50 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search subjects by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-13 pl-11 sm:pl-13 pr-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-inner"
            />
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-11 sm:h-13 items-center border border-slate-200/60 dark:border-slate-800 shadow-inner w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex-1 sm:flex-none h-full px-4 sm:px-5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-300 cursor-pointer",
                  viewMode === "grid" 
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-black" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <LayoutGrid size={15} strokeWidth={2.5} />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex-1 sm:flex-none h-full px-4 sm:px-5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-300 cursor-pointer",
                  viewMode === "list" 
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-black" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <List size={15} strokeWidth={2.5} />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subjects List & Grid Display */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="h-56 sm:h-64 rounded-2xl sm:rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                    <div className="w-10 h-6 rounded-lg bg-slate-200 dark:bg-zinc-900" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="w-3/4 h-5 rounded-md bg-slate-200 dark:bg-zinc-900" />
                    <div className="w-full h-3 rounded-md bg-slate-200 dark:bg-zinc-900" />
                    <div className="w-2/3 h-3 rounded-md bg-slate-200 dark:bg-zinc-900" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between">
                    <div className="w-20 h-4 rounded-md bg-slate-200 dark:bg-zinc-900" />
                    <div className="w-16 h-4 rounded-md bg-slate-200 dark:bg-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSubjects.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
                  : "flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              }>
                {filteredSubjects.map((subject: any, index: number) => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    viewMode={viewMode}
                    index={index + 1}
                    onView={(sub) => router.push(`/dashboard/teacher/subjects/${sub.id}`)}
                    onEdit={(sub) => router.push(`/dashboard/teacher/subjects/${sub.id}`)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-24 bg-white dark:bg-emerald-950/20 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-emerald-800/40 p-6 flex flex-col items-center justify-center gap-4 shadow-sm"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <BookOpen size={32} strokeWidth={2} />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">No Subjects Found</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {searchQuery ? `No subjects match "${searchQuery}". Try searching with another term or course code.` : "You have not been assigned to teach any academic subjects yet."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  tooltip 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  tooltip: string; 
}) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className="p-3 sm:p-5 md:p-6 bg-white dark:bg-emerald-950/40 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-2 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl ${bgColor} ${color} transition-transform group-hover:scale-105 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
        </div>
        <HeaderTooltip content={tooltip} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-500 transition-colors line-clamp-1">{label}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

export default TeacherSubjectsPage;
