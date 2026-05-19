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
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { subjectService, Subject, SchemeOfWork } from "../services/subjectService";
import SubjectModal from "../components/SubjectModal";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
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

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";

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
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-8 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="size-12 rounded-full border-[3px] border-slate-100 dark:border-white/5"
          style={{ borderTopColor: primaryColor }}
        />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading Subject Syllabus...
        </p>
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
          onClick={() => router.push("/dashboard/admin/subjects")}
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
  const exams = (subject as any).exams || [];
  const subjectExamPapers = (subject as any).subjectExamPapers || [];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 p-6 md:p-10 flex flex-col gap-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          onClick={() => router.push("/dashboard/admin/subjects")}
          variant="ghost"
          className="h-11 rounded-2xl px-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-black uppercase tracking-widest gap-2 w-fit"
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Subject Directory
        </Button>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="h-11 rounded-2xl px-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
          >
            <Edit2 size={13} strokeWidth={2.5} />
            Edit Subject
          </Button>

          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 hidden sm:inline-block ml-3">
            Academic Curriculum Detail
          </span>
        </div>
      </div>

      {/* Main Subject Header Profile */}
      <div className="relative bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-[0_25px_50px_rgba(0,0,0,0.02)] dark:shadow-[0_25px_50px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Dynamic Glow */}
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[90px] opacity-[0.06] pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div
              className="size-20 rounded-[1.8rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center p-5 text-slate-400 border border-slate-100 dark:border-white/5 shadow-inner"
              style={{ color: primaryColor }}
            >
              <BookOpen className="size-full" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2.5 py-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-md">
                  {subject.code}
                </span>
                <div className={cn(
                  "flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border",
                  subject.scope === "SCHOOL"
                    ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                )}>
                  {subject.scope === "SCHOOL" ? <Globe size={9} /> : <Lock size={9} />}
                  <span>{subject.scope === "SCHOOL" ? "School-wide" : "Personal"}</span>
                </div>
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                {subject.name}
              </h1>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-6 md:pt-0 md:pl-10">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Assigned Faculty
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {assignedTeachers.length} {assignedTeachers.length === 1 ? "Teacher" : "Teachers"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Enrolled Classes
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {assignedClasses.length} {assignedClasses.length === 1 ? "Class" : "Classes"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Roadmap Progress
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {schemes.length} {schemes.length === 1 ? "Week" : "Weeks"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Assessments
              </span>
              <span className="text-xl font-black text-slate-800 dark:text-white">
                {quizzes.length + exams.length + subjectExamPapers.length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Tab Content */}
      <div className="flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-1 rounded-2xl max-w-md mx-auto w-full shadow-sm">
          {(["overview", "curriculum", "assessments"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-2",
                activeTab === tab
                  ? "bg-slate-100 dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-inner font-extrabold"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {tab === "overview" && <Users size={13} />}
              {tab === "curriculum" && <Sparkles size={13} />}
              {tab === "assessments" && <Award size={13} />}
              {tab}
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
                  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
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
                  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Building size={16} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
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
                  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                        <GraduationCap size={16} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
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
                  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                        <Users size={16} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
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
              <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                  <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Curriculum Roadmap
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Academic milestones organized week-by-week
                    </p>
                  </div>

                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl">
                    {schemes.length} Weeks Planned
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {schemes.length > 0 ? (
                    schemes.map((scheme) => {
                      const isExpanded = expandedWeek === scheme.week;
                      return (
                        <div
                          key={scheme.id}
                          className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-lg shadow-sm"
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

                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="size-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover/scheme:bg-slate-100 transition-colors"
                            >
                              <ChevronDown size={14} strokeWidth={2.5} />
                            </motion.div>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="border-t border-slate-50 dark:border-white/5"
                              >
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/30 dark:bg-slate-900/10">
                                  {/* Objectives */}
                                  <div className="space-y-3 flex flex-col text-left">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                      <BookOpenCheck size={12} className="text-blue-500" />
                                      Weekly Objectives
                                    </span>
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 flex-1 min-h-[100px] text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed shadow-sm">
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
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 flex-1 min-h-[100px] text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed shadow-sm">
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
                    <div className="py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 border shadow-inner">
                        <Sparkles size={24} />
                      </div>
                      <div className="max-w-xs">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          Roadmap Unplanned
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          No week-by-week schemes of work have been formulated for this subject yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "assessments" && (
              <div className="max-w-5xl mx-auto flex flex-col gap-8">
                {/* Quizzes Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Subject Quizzes ({quizzes.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.length > 0 ? (
                      quizzes.map((quiz: any) => (
                        <div
                          key={quiz.id}
                          className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                        >
                          <div className="text-left">
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
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">
                              {quiz.title}
                            </h4>
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
                      ))
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No active quizzes scheduled.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exams Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Subject Term Exams ({exams.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.length > 0 ? (
                      exams.map((exam: any) => (
                        <div
                          key={exam.id}
                          className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                        >
                          <div className="text-left">
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
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">
                              {exam.title}
                            </h4>
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
                      ))
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No formal exams scheduled.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Papers Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                      Subject Exam Papers ({subjectExamPapers.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectExamPapers.length > 0 ? (
                      subjectExamPapers.map((paper: any) => (
                        <div
                          key={paper.id}
                          className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative shadow-sm min-h-[170px]"
                        >
                          <div className="text-left">
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

                          <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={11} /> {paper.durationMinutes || 0} Min
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Marks: {paper.totalMarks || 0}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No subject papers assigned.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern Subject Editor Modal */}
      <SubjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchSubjectDetails}
        subject={subject}
      />
    </div>
  );
};

export default SingleSubjectPage;
