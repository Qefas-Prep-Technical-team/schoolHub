"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Award,
  Globe,
  Lock,
  Clock,
  Calendar,
  Building,
  ArrowRight,
  ClipboardList,
  ExternalLink,
  BookOpenCheck,
  ChevronDown,
  Edit2,
  Plus,
  Trash2,
  AlertCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { subjectService, Subject, SchemeOfWork } from "@/app/dashboard/admin/subjects/services/subjectService";
import SubjectModal from "@/app/dashboard/admin/subjects/components/SubjectModal";
import CurriculumModal from "@/app/dashboard/admin/subjects/components/CurriculumModal";
import DeleteCurriculumModal from "@/app/dashboard/admin/subjects/components/DeleteCurriculumModal";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SingleSubjectPage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "assessments">("overview");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [deleteScheme, setDeleteScheme] = useState<SchemeOfWork | null>(null);

  const [quizzesPage, setQuizzesPage] = useState(1);
  const [termExamsPage, setTermExamsPage] = useState(1);
  const [casPage, setCasPage] = useState(1);
  const [papersPage, setPapersPage] = useState(1);
  const itemsPerPage = 3;

  const { user } = useAuthStore();
  const { selectedSchoolId } = useDashboardStore();
  const schoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#059669";

  useEffect(() => {
    if (id) {
      fetchSubjectDetails();
    }
  }, [id]);

  const fetchSubjectDetails = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getSubject(id);
      setSubject(data);
      const schemeData = await subjectService.getScheme(id);
      setSchemes(schemeData.sort((a, b) => a.week - b.week));
    } catch (error) {
      console.error("Failed to fetch subject details", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-6 md:p-10 flex flex-col gap-8 animate-pulse">
        {/* Back Button Skeleton */}
        <div className="h-10 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm" />
        
        {/* Header Card Skeleton */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="flex flex-col gap-3">
              <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex flex-col gap-3">
               <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
               <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Tabs and Tab Content Skeleton */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 px-1">
             <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-t-lg" />
             <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-t-lg" />
             <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-t-lg" />
          </div>
          <div className="h-[40vh] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-8 flex flex-col items-center justify-center gap-6">
        <div className="size-20 rounded-[2rem] bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500">
          <BookOpen size={36} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Subject Not Found
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            This subject may have been archived or deleted.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/teacher/subjects")}
          className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest"
        >
          Back to Directory
        </Button>
      </div>
    );
  }

  // Casting subject relationships for easier consumption
  const assignedTeachers = (subject as any).teacherSubjects || [];
  const assignedClasses = subject.classes || [];
  const quizzes = (subject as any).quizzes || [];
  const subjectExamPapers = (subject as any).subjectExamPapers || [];
  
  // Extract exams linked through subjectExamPapers
  const linkedExams = subjectExamPapers.flatMap((paper: any) => 
    paper.exams?.map((e: any) => e.exam) || []
  );

  // Combine directly linked exams and indirectly linked exams
  const allExamsRaw = [...((subject as any).exams || []), ...linkedExams];
  
  // Deduplicate by ID
  const allExamsMap = new Map();
  allExamsRaw.forEach((e: any) => {
    if (e && e.id && !allExamsMap.has(e.id)) {
      allExamsMap.set(e.id, e);
    }
  });
  const allExams = Array.from(allExamsMap.values());

  const termExams = allExams.filter((e: any) => e.category !== 'CA');
  const cas = allExams.filter((e: any) => e.category === 'CA');

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-6 md:p-10 flex flex-col gap-8">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.push("/dashboard/teacher/subjects")}
          variant="ghost"
          className="h-10 rounded-xl px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold gap-2"
        >
          <ArrowLeft size={14} />
          Back to Directory
        </Button>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className="size-16 rounded-full flex items-center justify-center p-4"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <BookOpen className="size-full" />
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none">
              {subject.name}
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                {subject.code}
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                {subject.scope === "SCHOOL" ? <Globe size={12} /> : <Lock size={12} />}
                <span>{subject.scope === "SCHOOL" ? "School-wide" : "Personal"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Assigned Faculty
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-white">
            {assignedTeachers.length}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Enrolled Classes
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-white">
            {assignedClasses.length}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Roadmap Progress
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-white">
            {schemes.length} <span className="text-sm text-slate-400 font-medium lowercase">weeks</span>
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Assessments
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-white">
            {quizzes.length + allExams.length + subjectExamPapers.length} <span className="text-sm text-slate-400 font-medium lowercase">active</span>
          </span>
        </div>
      </div>

      {/* Tabs and Tab Content */}
      <div className="flex flex-col gap-6 mt-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 px-1 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Users },
            { id: "curriculum", label: `Curriculum (${schemes.length})`, icon: Sparkles },
            { id: "assessments", label: `Assessments (${quizzes.length + allExams.length + subjectExamPapers.length})`, icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-wider relative transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <tab.icon size={14} className={activeTab === tab.id ? "text-blue-600 dark:text-blue-400" : ""} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: General Overview, Departments, Classes */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* Subject description */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Syllabus Overview
                    </h3>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                      {subject.description ? (
                        <LaTeXRenderer content={subject.description} />
                      ) : (
                        "No general course overview provided. Modify the subject settings to initialize description roadmap details."
                      )}
                    </div>
                  </div>

                  {/* Linked Departments */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Building size={16} />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Target Departments
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2.5 mt-2">
                      {subject.departments && subject.departments.length > 0 ? (
                        subject.departments.map((d: any) => (
                          <div
                            key={d.departmentId}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-tight shadow-sm"
                          >
                            <span className="size-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                            {d.department?.name}
                          </div>
                        ))
                      ) : (
                        <div className="w-full py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No departments linked to this subject.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enrolled Classes */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                        <GraduationCap size={16} />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Active Classes
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {assignedClasses.length > 0 ? (
                        assignedClasses.map((c: any) => (
                          <div
                            key={c.classId}
                            className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                {c.class?.name}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Code: {c.class?.classCode}
                              </span>
                            </div>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 bg-white dark:bg-slate-950">
                              {c.class?.scope || "Class"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 py-6 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No active school classes bound to this subject.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Faculty details */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                        <Users size={16} />
                      </div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Assigned Faculty Members
                      </h3>
                    </div>

                    <div className="space-y-4 mt-2">
                      {assignedTeachers.length > 0 ? (
                        assignedTeachers.map((ts: any) => {
                          const teacher = ts.teacher;
                          if (!teacher) return null;
                          return (
                            <div
                              key={teacher.id}
                              className="flex items-center gap-4 p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-100/50 dark:border-white/5 rounded-2xl group/faculty"
                            >
                              <div
                                className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                              >
                                {teacher.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 flex flex-col text-left">
                                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                  {teacher.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  ID: {teacher.teacherCode}
                                </span>
                              </div>

                              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 px-2 py-0.5 bg-blue-50/80 border border-blue-100 rounded-md dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                                Instructor
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No teachers assigned to this subject.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="w-full flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-xl shadow-sm gap-4">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                      Curriculum Roadmap
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Academic milestones organized week-by-week
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                        {schemes.length}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Weeks Planned
                      </span>
                    </div>
                    <Button onClick={() => setIsCurriculumModalOpen(true)} className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm gap-2">
                      <Plus size={14} />
                      Add Curriculum
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {schemes.length > 0 ? (
                    schemes.map((scheme) => {
                      const isExpanded = expandedWeek === scheme.week;
                      return (
                        <div
                          key={scheme.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md shadow-sm"
                        >
                          {/* Toggle Bar */}
                          <div
                            onClick={() => setExpandedWeek(isExpanded ? null : scheme.week)}
                            className="flex items-center justify-between p-6 cursor-pointer select-none group/scheme"
                          >
                            <div className="flex items-center gap-5">
                              <div
                                className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black border shadow-inner"
                                style={{ 
                                  backgroundColor: `${primaryColor}15`, 
                                  color: primaryColor,
                                  borderColor: `${primaryColor}20`
                                }}
                              >
                                W{scheme.week}
                              </div>
                              <div className="flex flex-col text-left">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                  Week {scheme.week} Target Topic
                                </h4>
                                <span className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-tight group-hover/scheme:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                  {scheme.topic}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteScheme(scheme);
                                }}
                                className="size-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 size={14} />
                              </Button>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="size-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/scheme:bg-slate-100 dark:group-hover/scheme:bg-white/10 transition-colors"
                              >
                                <ChevronDown size={14} strokeWidth={2.5} />
                              </motion.div>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="border-t border-slate-200 dark:border-white/10"
                              >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50">
                                  {/* Objectives */}
                                  <div className="space-y-3 flex flex-col text-left">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <BookOpenCheck size={12} className="text-blue-500" />
                                      Weekly Objectives
                                    </span>
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-white/10 flex-1 min-h-[100px] text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed shadow-sm">
                                      {scheme.objectives ? (
                                        <LaTeXRenderer content={scheme.objectives} />
                                      ) : (
                                        "No specific weekly learning goals detailed for this entry."
                                      )}
                                    </div>
                                  </div>

                                  {/* Resources */}
                                  <div className="space-y-3 flex flex-col text-left">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <ClipboardList size={12} className="text-green-500" />
                                      Curriculum Resources
                                    </span>
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-white/10 flex-1 min-h-[100px] text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed shadow-sm">
                                      {scheme.resources ? (
                                        <LaTeXRenderer content={scheme.resources} />
                                      ) : (
                                        "No specific learning materials or textbooks recommended."
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full min-h-[50vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-400 border shadow-inner">
                        <Sparkles size={24} />
                      </div>
                      <div className="max-w-xs">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          Roadmap Unplanned
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                          No week-by-week schemes of work have been formulated for this subject yet.
                        </p>
                        <Button onClick={() => setIsCurriculumModalOpen(true)} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm gap-2">
                          <Plus size={14} />
                          Add Curriculum
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "assessments" && (
              <div className="w-full flex flex-col gap-8">
                {/* Quizzes Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Subject Quizzes ({quizzes.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length > 0 ? (
                      quizzes.slice((quizzesPage - 1) * itemsPerPage, quizzesPage * itemsPerPage).map((quiz: any, index: number) => {
                        const globalIndex = (quizzesPage - 1) * itemsPerPage + index + 1;
                        return (
                          <div
                            key={quiz.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                          >
                            <div className="absolute top-6 right-6 text-2xl font-black text-slate-100 dark:text-slate-800/50 pointer-events-none select-none z-0">
                              #{String(globalIndex).padStart(2, '0')}
                            </div>
                            <div className="text-left relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md">
                                  <ClipboardList size={14} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                  {quiz.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-500">
                                  QUIZ
                                </span>
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                  quiz.status === "PUBLISHED"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                )}>
                                  {quiz.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium line-clamp-2 mt-1 leading-normal">
                                {quiz.description || "No custom instructions detailed."}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between mt-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={11} /> {quiz.durationMinutes || 0} Min
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Marks: {quiz.totalMarks || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No active quizzes scheduled.
                        </span>
                      </div>
                    )}
                  </div>
                  {quizzes.length > itemsPerPage && (
                    <div className="flex justify-center gap-4 mt-6">
                      <Button variant="outline" size="sm" onClick={() => setQuizzesPage(p => Math.max(1, p - 1))} disabled={quizzesPage === 1} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Previous</Button>
                      <div className="flex items-center px-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 tracking-widest uppercase">
                        Page {quizzesPage} of {Math.ceil(quizzes.length / itemsPerPage)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setQuizzesPage(p => p + 1)} disabled={quizzesPage * itemsPerPage >= quizzes.length} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Next</Button>
                    </div>
                  )}
                </div>

                {/* Exams Grid */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Subject Term Exams ({termExams.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {termExams.length > 0 ? (
                      termExams.slice((termExamsPage - 1) * itemsPerPage, termExamsPage * itemsPerPage).map((exam: any, index: number) => {
                        const globalIndex = (termExamsPage - 1) * itemsPerPage + index + 1;
                        return (
                          <div
                            key={exam.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                          >
                            <div className="absolute top-6 right-6 text-2xl font-black text-slate-100 dark:text-slate-800/50 pointer-events-none select-none z-0">
                              #{String(globalIndex).padStart(2, '0')}
                            </div>
                            <div className="text-left relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-md">
                                  <AlertCircle size={14} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                  {exam.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                                  TERM EXAM
                                </span>
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                  exam.status === "PUBLISHED"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                )}>
                                  {exam.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium line-clamp-2 mt-1 leading-normal">
                                {exam.instructions || "Term assessment session."}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between mt-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={11} /> {exam.durationMinutes || 0} Min
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Marks: {exam.totalMarks || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No formal exams scheduled.
                        </span>
                      </div>
                    )}
                  </div>
                  {termExams.length > itemsPerPage && (
                    <div className="flex justify-center gap-4 mt-6">
                      <Button variant="outline" size="sm" onClick={() => setTermExamsPage(p => Math.max(1, p - 1))} disabled={termExamsPage === 1} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Previous</Button>
                      <div className="flex items-center px-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 tracking-widest uppercase">
                        Page {termExamsPage} of {Math.ceil(termExams.length / itemsPerPage)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setTermExamsPage(p => p + 1)} disabled={termExamsPage * itemsPerPage >= termExams.length} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Next</Button>
                    </div>
                  )}
                </div>

                {/* CAs Grid */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Continuous Assessments ({cas.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cas.length > 0 ? (
                      cas.slice((casPage - 1) * itemsPerPage, casPage * itemsPerPage).map((ca: any, index: number) => {
                        const globalIndex = (casPage - 1) * itemsPerPage + index + 1;
                        return (
                          <div
                            key={ca.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                          >
                            <div className="absolute top-6 right-6 text-2xl font-black text-slate-100 dark:text-slate-800/50 pointer-events-none select-none z-0">
                              #{String(globalIndex).padStart(2, '0')}
                            </div>
                            <div className="text-left relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md">
                                  <FileText size={14} />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
                                  {ca.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                                  CA
                                </span>
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                  ca.status === "PUBLISHED"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                )}>
                                  {ca.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium line-clamp-2 mt-1 leading-normal">
                                {ca.instructions || "Continuous Assessment session."}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between mt-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={11} /> {ca.durationMinutes || 0} Min
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Marks: {ca.totalMarks || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No continuous assessments scheduled.
                        </span>
                      </div>
                    )}
                  </div>
                  {cas.length > itemsPerPage && (
                    <div className="flex justify-center gap-4 mt-6">
                      <Button variant="outline" size="sm" onClick={() => setCasPage(p => Math.max(1, p - 1))} disabled={casPage === 1} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Previous</Button>
                      <div className="flex items-center px-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 tracking-widest uppercase">
                        Page {casPage} of {Math.ceil(cas.length / itemsPerPage)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCasPage(p => p + 1)} disabled={casPage * itemsPerPage >= cas.length} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Next</Button>
                    </div>
                  )}
                </div>

                {/* Subject Papers Grid */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Subject Exam Papers ({subjectExamPapers.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectExamPapers.length > 0 ? (
                      subjectExamPapers.slice((papersPage - 1) * itemsPerPage, papersPage * itemsPerPage).map((paper: any, index: number) => {
                        const globalIndex = (papersPage - 1) * itemsPerPage + index + 1;
                        return (
                          <div
                            key={paper.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                          >
                            <div className="absolute top-6 right-6 text-2xl font-black text-slate-100 dark:text-slate-800/50 pointer-events-none select-none z-0">
                              #{String(globalIndex).padStart(2, '0')}
                            </div>
                            <div className="text-left relative z-10">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-50 border border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                                  SUBJECT PAPER
                                </span>
                                <span className={cn(
                                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                  paper.status === "PUBLISHED"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                )}>
                                  {paper.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">
                                {paper.title || "Untitled Paper"}
                              </h4>
                              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium line-clamp-2 mt-1 leading-normal">
                                {paper.instructions || "Academic subject examination paper."}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between mt-4 relative z-10">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={11} /> {paper.durationMinutes || 0} Min
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Marks: {paper.totalMarks || 0}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No subject papers assigned.
                        </span>
                      </div>
                    )}
                  </div>
                  {subjectExamPapers.length > itemsPerPage && (
                    <div className="flex justify-center gap-4 mt-6">
                      <Button variant="outline" size="sm" onClick={() => setPapersPage(p => Math.max(1, p - 1))} disabled={papersPage === 1} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Previous</Button>
                      <div className="flex items-center px-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 tracking-widest uppercase">
                        Page {papersPage} of {Math.ceil(subjectExamPapers.length / itemsPerPage)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setPapersPage(p => p + 1)} disabled={papersPage * itemsPerPage >= subjectExamPapers.length} className="rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest text-slate-500 border-2 border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Next</Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <SubjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchSubjectDetails}
        subject={subject}
      />

      <CurriculumModal
        isOpen={isCurriculumModalOpen}
        onClose={() => setIsCurriculumModalOpen(false)}
        onSuccess={fetchSubjectDetails}
        subjectId={id}
        nextWeekNumber={schemes.length + 1}
      />

      <DeleteCurriculumModal
        isOpen={!!deleteScheme}
        onClose={() => setDeleteScheme(null)}
        weekNumber={deleteScheme?.week}
        topic={deleteScheme?.topic}
        onConfirm={async () => {
          if (deleteScheme?.id) {
            await subjectService.deleteSchemeEntry(deleteScheme.id);
            fetchSubjectDetails();
            toast.success("Curriculum deleted successfully");
          }
        }}
      />
    </div>
  );
};

export default SingleSubjectPage;
