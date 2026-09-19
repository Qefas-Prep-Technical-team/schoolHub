'use client';

import React, { useState, useMemo } from "react";
import { BookOpen, Search, LayoutGrid, List } from "lucide-react";
import SubjectCard from "../../admin/subjects/components/SubjectCard";
import { useTeacherSubjects } from "@/lib/api/hooks/useTeacher";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const TeacherSubjectsPage = () => {
  const router = useRouter();
  const { selectedSchoolId } = useDashboardStore();
  const schoolId = selectedSchoolId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#059669'; // Emerald-600

  const { data: subjectsData, isLoading } = useTeacherSubjects(schoolId);
  const subjects = Array.isArray(subjectsData) ? subjectsData : (subjectsData as any)?.data || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject: any) => 
      subject.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-neutral-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Academic Overview</span>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                My Subjects<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-sm font-medium text-slate-500 max-w-xl">
                View all the academic subjects you are assigned to teach across your classes.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search your subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}40` } as any}
                />
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] h-14 items-center border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={cn(
                            "h-full px-5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            viewMode === "grid" 
                                ? "bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <LayoutGrid size={14} strokeWidth={2.5} />
                        Grid
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "h-full px-5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            viewMode === "list" 
                                ? "bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                    >
                        <List size={14} strokeWidth={2.5} />
                        List
                    </button>
                </div>
            </div>
        </div>

        {/* Subjects List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[2rem] bg-white dark:bg-white/[0.02] animate-pulse border border-slate-200 dark:border-white/5 shadow-sm" />)}
            </div>
          ) : filteredSubjects.length > 0 ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              }>
                {filteredSubjects.map((subject: any, index: number) => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    viewMode={viewMode}
                    index={index + 1}
                    onEdit={(sub) => router.push(`/dashboard/teacher/subjects/${sub.id}`)}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-6 shadow-sm"
            >
              <div className="size-24 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700">
                <BookOpen size={48} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Subjects Found</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  {searchQuery ? "No subjects found matching your search criteria." : "You have not been assigned to teach any subjects yet."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default TeacherSubjectsPage;
