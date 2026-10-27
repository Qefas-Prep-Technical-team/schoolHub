"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  useStudentById,
  useTermlyEvaluation,
  useUpsertTermlyEvaluation,
  useStudentDownloadAudit,
  useRecordStudentDownload,
} from "@/lib/api/hooks/useStudent";
import { useMyPublishedResults } from "@/lib/api/hooks/useRecords";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useSchoolAdmins } from "@/lib/api/hooks/useAdmin";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSignaturesByUserIds, useActiveSignature } from "@/lib/api/hooks/useSignature";
import { SignatureRecord } from "@/lib/api/services/signatureService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SignatureModal } from "@/components/signature/SignatureModal";
import { adminService } from "@/lib/api/services/adminService";
import {
  GraduationCap,
  Download,
  Printer,
  School,
  ArrowLeft,
  ShieldCheck,
  Award,
  PenTool,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles,
  User,
  ChevronDown,
  RefreshCw,
  Search,
  MapPin,
  Edit3,
  SlidersHorizontal,
  Layers,
  Heart,
  Activity,
  Check,
  Star,
  Quote,
  Info,
  CreditCard,
  Wallet,
  Users,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  ArrowUpRight,
  Copy,
  PlusCircle,
  CheckCheck,
  FileCheck,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { generatePDF } from "@/utils/pdfGenerator";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import {
  getGradeEvaluation,
  getEffectiveGradingSystem,
  DEFAULT_GRADING_SYSTEM,
} from "@/utils/gradingSystem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SubjectResultItem {
  id?: string;
  scoresRevealed?: boolean;
  totalScore?: number | null;
  caScore?: number | null;
  examScore?: number | null;
  assignmentScore?: number | null;
  quizScore?: number | null;
  grade?: string | null;
  subject?: {
    id?: string;
    name?: string;
    code?: string;
  };
  paperLinks?: any;
  approval?: any;
}

interface PublishedResultGroup {
  sessionId: string;
  term: string;
  subjectCount: number;
  revealedCount: number;
  class?: {
    id?: string;
    name?: string;
  };
  session?: {
    id?: string;
    name?: string;
  };
  subjectResults?: SubjectResultItem[];
  paperLinks?: any;
  approval?: any;
}

interface TranscriptPreviewProps {
  studentId: string;
  schoolId: string;
  onBack: () => void;
  onSelectStudent: (studentId: string) => void;
  primaryColor?: string;
}

function TranscriptPreviewSkeleton({
  onBack,
  isSidebarOpen = true,
}: {
  onBack?: () => void;
  isSidebarOpen?: boolean;
}) {
  return (
    <div className="w-full space-y-6 font-sans animate-pulse">
      {/* ── Top Action & Navigation Bar Skeleton ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        {/* Back and Student Quick Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
          >
            <ArrowLeft size={15} />
            <span>Select Another Scholar</span>
          </Button>

          {/* Quick Switch Dropdown placeholder */}
          <div className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <User size={14} className="text-blue-600" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {/* Admin Verification Badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck size={14} />
            <span>Admin Certification View</span>
          </div>
        </div>

        {/* Page Switcher Tabs, Audit Sidebar Toggle & Print/Export Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Page Switcher Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold shadow-xs">
              Page 1: Academic
            </span>
            <span className="px-3 py-1.5 text-slate-500 font-bold">
              Page 2: Conduct & Remarks
            </span>
            <span className="px-3 py-1.5 text-slate-500 font-bold">
              All Pages
            </span>
          </div>

          {/* Toggle Audit Sidebar Button */}
          <div className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-600 shadow-xs">
            <CreditCard size={15} />
            <span className="hidden sm:inline">Access & Payment Audit</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
            <Printer size={15} />
            <span className="hidden sm:inline">Print Copy</span>
          </div>

          <div className="h-10 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 opacity-90">
            <Download size={15} />
            <span>Export Official PDF</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Session & Term Filter Bar Skeleton ───────────────── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-200 mr-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Filter size={15} />
            </div>
            <span>Academic Filter:</span>
          </div>

          <div className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950 flex items-center gap-2">
            <Calendar size={13} className="text-slate-400" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
            <ChevronDown size={13} className="text-slate-400" />
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold shadow-xs">
              All Terms
            </span>
            <span className="px-3 py-1.5 text-slate-500 font-bold">1st Term</span>
            <span className="px-3 py-1.5 text-slate-500 font-bold">2nd Term</span>
            <span className="px-3 py-1.5 text-slate-500 font-bold">3rd Term</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Cumulative Academic Scope (All Sessions)
          </span>
        </div>
      </div>

      {/* ── 2-Column Responsive Layout ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column: Official Transcript Document Skeleton */}
        <div className="flex-1 min-w-0 w-full space-y-10">
          <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-xs space-y-8">
            {/* Letterhead Skeleton */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b-2 border-slate-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 shadow-xs text-blue-600 dark:text-blue-400">
                  <School size={40} />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck size={12} />
                    Official Certified Institutional Record
                  </div>
                  <Skeleton className="h-7 sm:h-8 w-64 sm:w-80 rounded-lg mx-auto sm:mx-0" />
                  <p className="text-xs italic text-blue-600 dark:text-blue-400 font-serif font-medium">
                    "Excellence, Integrity, & Scholastic Achievement"
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                    <Skeleton className="h-3.5 w-44 rounded-md" />
                    <span className="text-slate-300">•</span>
                    <Skeleton className="h-3.5 w-36 rounded-md" />
                  </div>
                </div>
              </div>

              {/* Scholar Photo Box */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-2 text-center text-slate-400 shrink-0">
                <User size={28} className="text-slate-300 dark:text-zinc-600" />
                <span className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-400">Scholar Photo</span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-1">
              <div className="inline-block px-5 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-xs">
                Official Cumulative Academic Transcript
              </div>
            </div>

            {/* Student Profile Banner Skeleton (6 metadata columns) */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Scholar Full Name</p>
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Student ID / Code</p>
                  <Skeleton className="h-4 w-24 rounded-md bg-blue-100 dark:bg-blue-950/60" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Department / Cohort</p>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Enrollment Status</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 text-[10px] font-bold">
                    ENROLLED
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Document Ref</p>
                  <Skeleton className="h-4 w-28 rounded-md font-mono" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issued Date</p>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
            </div>

            {/* Cumulative Performance 4 Summary Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 space-y-1">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-blue-600" />
                  Cumulative CGPA
                </span>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
                </div>
                <Skeleton className="h-4 w-32 rounded-full bg-blue-100/80 dark:bg-blue-950/60" />
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Cumulative Average
                </span>
                <div className="pt-1">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-500" />
                  Total Subjects
                </span>
                <div className="pt-1">
                  <Skeleton className="h-8 w-14 rounded-lg" />
                </div>
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-500" />
                  Academic Standing
                </span>
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    IN GOOD STANDING
                  </span>
                </div>
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            </div>

            {/* Course Breakdown Table Skeleton */}
            <div className="space-y-5 pt-2">
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" />
                  <Skeleton className="h-5 w-52 rounded-md" />
                </div>
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
                {/* Term Subheader */}
                <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase tracking-wider">
                      1st Term
                    </span>
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>

                {/* Table Header & Rows matching exact transcript table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3 w-16">Code</th>
                        <th className="py-2.5 px-3">Subject / Course Name</th>
                        <th className="py-2.5 px-2 text-center w-12">CA</th>
                        <th className="py-2.5 px-2 text-center w-12">Exam</th>
                        <th className="py-2.5 px-2 text-center w-16">Total (%)</th>
                        <th className="py-2.5 px-2 text-center w-14">Grade</th>
                        <th className="py-2.5 px-2 text-center w-10">GP</th>
                        <th className="py-2.5 px-3 text-right w-24">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                      {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row}>
                          <td className="py-3 px-3">
                            <Skeleton className="h-3.5 w-12 rounded" />
                          </td>
                          <td className="py-3 px-3">
                            <Skeleton className="h-3.5 w-48 rounded" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Skeleton className="h-3.5 w-8 rounded mx-auto" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Skeleton className="h-3.5 w-8 rounded mx-auto" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Skeleton className="h-3.5 w-10 rounded mx-auto font-bold" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Skeleton className="h-5 w-8 rounded-md mx-auto bg-blue-100/80 dark:bg-blue-950/60" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Skeleton className="h-3.5 w-6 rounded mx-auto" />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Skeleton className="h-5 w-16 rounded-full ml-auto bg-emerald-100/80 dark:bg-emerald-950/60" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terminal Summary Footer */}
                <div className="p-3 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-4 w-28 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              </div>
            </div>

            {/* Endorsement Signatures Skeleton with Retained Dashed Baseline */}
            <div className="pt-8 border-t-2 border-slate-200 dark:border-zinc-800 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                <div className="space-y-3">
                  <div className="h-20 sm:h-24 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-end justify-start pb-2">
                    <span className="font-['Caveat',cursive] italic text-2xl text-slate-400 select-none">
                      Class Teacher
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36 rounded-md" />
                    <p className="text-[11px] text-slate-400">Class Teacher / Form Master</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center space-y-2 py-2">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400 dark:border-blue-600 flex items-center justify-center text-center p-2 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter shadow-xs mx-auto">
                    Official Electronic Seal
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-center">
                    Certified Verified Copy
                  </p>
                </div>
                <div className="space-y-3 text-center sm:text-right">
                  <div className="h-20 sm:h-24 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-end justify-center sm:justify-end pb-2">
                    <span className="font-['Caveat',cursive] italic text-2xl text-slate-400 select-none">
                      Head of Institution
                    </span>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <Skeleton className="h-4 w-36 rounded-md sm:ml-auto" />
                    <p className="text-[11px] text-slate-400 sm:text-right">Principal / Head of Institution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Electronic Record Disclaimer */}
            <div className="text-center text-[10px] text-slate-400 dark:text-zinc-500 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
              This certified academic credential was generated electronically via Qefas Hub Academic Management System. Any alteration, erasure, or unauthorized duplication invalidates this document.
            </div>
          </div>
        </div>

        {/* Right Column: Audit Sidebar Skeleton */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5">
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Access & Payment Audit
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                      Download Telemetry & Fees
                    </p>
                  </div>
                </div>
                <RefreshCw size={13} className="text-slate-400" />
              </div>

              {/* 1. Download Activity & Frequency Metric */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Download size={13} className="text-blue-600" />
                    Download Frequency
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    Live Count
                  </span>
                </div>

                {/* Total Counter Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/60 dark:border-blue-900/30 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      Total Result Downloads
                    </p>
                    <Skeleton className="h-8 w-14 rounded-lg mt-1" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Download size={20} />
                  </div>
                </div>

                {/* Breakdown: Student vs Parent */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <User size={12} />
                      Student
                    </div>
                    <Skeleton className="h-6 w-8 rounded mt-1" />
                    <p className="text-[10px] text-slate-400">Times downloaded</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <Users size={12} />
                      Parents
                    </div>
                    <Skeleton className="h-6 w-8 rounded mt-1" />
                    <p className="text-[10px] text-slate-400">Times downloaded</p>
                  </div>
                </div>

                <Skeleton className="h-3.5 w-44 rounded-md" />
                <div className="w-full h-8 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900" />
              </div>

              {/* 2. Payment & Result Clearance Status */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Wallet size={13} className="text-blue-600" />
                    Payment & Clearance
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={11} />
                    Cleared & Paid
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                    Total Result Fee Paid:
                  </span>
                  <div className="pt-1">
                    <Skeleton className="h-8 w-28 rounded-lg" />
                  </div>
                  <Skeleton className="h-3 w-36 rounded-md" />
                </div>
              </div>

              {/* 3. Linked Parents & Guardians */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Users size={13} className="text-blue-600" />
                    Connected Parents / Sponsors
                  </span>
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-40 rounded-md" />
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function getTermLabel(term: string): string {
  const map: Record<string, string> = {
    FIRST: "1st Term",
    SECOND: "2nd Term",
    THIRD: "3rd Term",
  };
  return map[term] || term;
}

function getGradeLetter(total: number | null, customGradingSystem?: any[] | null): string {
  if (total == null) return "—";
  return getGradeEvaluation(total, customGradingSystem).grade;
}

function getGradePoint(total: number | null, customGradingSystem?: any[] | null): number {
  if (total == null || isNaN(total)) return 0;
  const evaluation = getGradeEvaluation(total, customGradingSystem);
  const grade = evaluation.grade.toUpperCase().trim();

  if (grade === "A+" || grade === "A1") return 5.0;
  if (grade === "A" || grade === "B2") return 4.5;
  if (grade === "B+" || grade === "B3") return 4.0;
  if (grade === "B" || grade === "C4") return 3.5;
  if (grade === "C+" || grade === "C5") return 3.0;
  if (grade === "C" || grade === "C6") return 2.5;
  if (grade === "D" || grade === "D7") return 1.5;
  if (grade === "E" || grade === "E8") return 1.0;
  if (grade === "F") return 0.5;
  if (grade === "F9") return 0.0;

  if (total >= 90) return 5.0;
  if (total >= 70) return 4.5;
  if (total >= 65) return 4.0;
  if (total >= 60) return 3.5;
  if (total >= 55) return 3.0;
  if (total >= 50) return 2.5;
  if (total >= 40) return 1.5;
  if (total >= 30) return 0.5;
  return 0.0;
}

function getRemark(total: number | null, customGradingSystem?: any[] | null): string {
  if (total == null) return "Pending";
  return getGradeEvaluation(total, customGradingSystem).remark;
}

function getGradeBadgeClass(grade: string): string {
  const g = grade.toUpperCase().trim();
  if (g.includes("A+") || g === "A1") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (g.startsWith("A")) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (g.includes("B+")) return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";
  if (g.startsWith("B")) return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  if (g.includes("C+")) return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
  if (g.startsWith("C")) return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
  if (g.startsWith("D")) return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  if (g === "F" || g.startsWith("E")) return "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800";
  return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
}

function getCgpaGrade(cgpaNum: number, averageScore: number): string {
  if (averageScore >= 85 || cgpaNum >= 4.5) return "A";
  if (averageScore >= 75 || cgpaNum >= 3.75) return "A-";
  if (averageScore >= 70 || cgpaNum >= 3.5) return "B+";
  if (averageScore >= 65 || cgpaNum >= 3.0) return "B";
  if (averageScore >= 60 || cgpaNum >= 2.5) return "B-";
  if (averageScore >= 55 || cgpaNum >= 2.0) return "C+";
  if (averageScore >= 50 || cgpaNum >= 1.5) return "C";
  if (averageScore >= 45 || cgpaNum >= 1.0) return "D";
  return "F";
}

const AFFECTIVE_TRAITS = [
  { key: "attentiveness", label: "Attentiveness & Focus", desc: "Sustained attention in academic activities" },
  { key: "honesty", label: "Honesty & Integrity", desc: "Truthfulness in conduct and assignments" },
  { key: "neatness", label: "Neatness & Presentation", desc: "Personal grooming, books and workspace" },
  { key: "politeness", label: "Politeness & Courtesy", desc: "Respectful demeanor towards peers and staff" },
  { key: "punctuality", label: "Punctuality & Regularity", desc: "Timely arrival for classes and assemblies" },
  { key: "selfControl", label: "Self-Control & Temperament", desc: "Calmness and composure in social situations" },
  { key: "obedience", label: "Obedience & Compliance", desc: "Adherence to institutional rules and directives" },
  { key: "reliability", label: "Reliability & Dependability", desc: "Trustworthiness in carrying out assigned duties" },
  { key: "responsibility", label: "Sense of Responsibility", desc: "Accountability for personal actions and assets" },
  { key: "relationship", label: "Peer & Staff Relations", desc: "Harmonious interaction with school community" },
] as const;

const PSYCHOMOTOR_SKILLS = [
  { key: "handwriting", label: "Handwriting & Scripting", desc: "Legibility, neatness and style of handwriting" },
  { key: "handlingTools", label: "Handling Tools & Apparatus", desc: "Safe handling of laboratory and workshop equipment" },
  { key: "drawingPainting", label: "Drawing, Painting & Crafts", desc: "Creativity, artistic representation and design" },
  { key: "publicSpeaking", label: "Public Speaking & Oratory", desc: "Confidence, tone and poise in presentations" },
  { key: "speechFluency", label: "Speech Fluency & Diction", desc: "Clarity, articulation and vocabulary in communication" },
  { key: "sportsGames", label: "Sports, Games & Athletics", desc: "Physical dexterity, team play and sportsmanship" },
] as const;

export function TranscriptPreview({
  studentId,
  schoolId,
  onBack,
  onSelectStudent,
  primaryColor = "#2563eb",
}: TranscriptPreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [activePageView, setActivePageView] = useState<"all" | "page1" | "page2">("all");
  const [selectedEvaluationIdx, setSelectedEvaluationIdx] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logoLoadError, setLogoLoadError] = useState(false);

  const queryClient = useQueryClient();
  const [customHeadSig, setCustomHeadSig] = useState<SignatureRecord | null>(null);
  const [customRegistrarSig, setCustomRegistrarSig] = useState<SignatureRecord | null>(null);
  const [headImgError, setHeadImgError] = useState(false);
  const [registrarImgError, setRegistrarImgError] = useState(false);
  const [signatureModalTarget, setSignatureModalTarget] = useState<"head" | "registrar" | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const { data: studentProfile, isLoading: isStudentLoading } = useStudentById(studentId);
  const { data: rawPublishedResults, isLoading: isResultsLoading } = useMyPublishedResults(studentId);

  const effectiveSchoolId =
    schoolId ||
    studentProfile?.schoolId ||
    (studentProfile as any)?.school?.id ||
    user?.schools?.[0]?.schoolId ||
    (user as any)?.schools?.[0]?.id ||
    (user as any)?.schoolId ||
    user?.tenantId ||
    "";

  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);
  const { data: schoolAdminsResponse } = useSchoolAdmins(effectiveSchoolId);
  const schoolAdmins: any[] = schoolAdminsResponse?.data || [];

  const currentAdminUserId = user?.id || (user as any)?.userId || "admin-system";
  const { data: currentAuthSignature } = useActiveSignature(currentAdminUserId);
  const { data: systemAdminSignature } = useActiveSignature("admin-system");

  // Download Audit & Payment Telemetry
  const {
    data: auditData,
    isLoading: isAuditLoading,
    refetch: refetchAudit,
  } = useStudentDownloadAudit(studentId);
  const recordDownloadMutation = useRecordStudentDownload(studentId);

  // Quick switcher candidates
  const { data: quickStudentsResponse } = useQuery({
    queryKey: ["quick-switch-students", effectiveSchoolId],
    queryFn: () => adminService.getSchoolStudents(effectiveSchoolId, 1, 40),
    enabled: !!effectiveSchoolId,
    staleTime: 1000 * 60 * 5,
  });
  const quickStudents: any[] = quickStudentsResponse?.data || [];

  const results = (rawPublishedResults as PublishedResultGroup[] | undefined) || [];
  const school = schoolProfile || (studentProfile as any)?.school;
  const gradingSystem = schoolProfile?.gradingSystem || (studentProfile as any)?.school?.gradingSystem;
  const schoolName =
    schoolProfile?.name ||
    (studentProfile as any)?.school?.name ||
    user?.schools?.[0]?.name ||
    "Connected School";
  const schoolMotto =
    schoolProfile?.motto ||
    (studentProfile as any)?.school?.motto ||
    (schoolProfile as any)?.schoolMotto ||
    "Empowering minds for a better tomorrow.";
  const schoolLocation =
    schoolProfile?.address ||
    (studentProfile as any)?.school?.address ||
    [schoolProfile?.city, schoolProfile?.state, schoolProfile?.country].filter(Boolean).join(", ") ||
    [(studentProfile as any)?.school?.city, (studentProfile as any)?.school?.state, (studentProfile as any)?.school?.country].filter(Boolean).join(", ") ||
    "Official Institutional Campus";
  const schoolLogoUrl =
    !logoLoadError && (schoolProfile?.logo || (studentProfile as any)?.school?.logo || schoolProfile?.schoolLogo)
      ? schoolProfile?.logo || (studentProfile as any)?.school?.logo || schoolProfile?.schoolLogo
      : "/schoolhub.png";

  // ── Session & Term Filter States ─────────────────────────────────────────
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>("ALL");
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("ALL");

  const availableSessions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    results.forEach((r) => {
      const id = r.sessionId || "unknown-session";
      const name = r.session?.name || "Academic Session";
      if (!map.has(id)) {
        map.set(id, { id, name, count: 0 });
      }
      map.get(id)!.count += 1;
    });
    return Array.from(map.values());
  }, [results]);

  const availableTerms = useMemo(
    () => [
      { value: "ALL", label: "All Terms" },
      { value: "FIRST", label: "1st Term" },
      { value: "SECOND", label: "2nd Term" },
      { value: "THIRD", label: "3rd Term" },
    ],
    []
  );

  const isFilterActive = selectedSessionFilter !== "ALL" || selectedTermFilter !== "ALL";

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (selectedSessionFilter !== "ALL" && r.sessionId !== selectedSessionFilter) {
        return false;
      }
      if (selectedTermFilter !== "ALL" && r.term !== selectedTermFilter) {
        return false;
      }
      return true;
    });
  }, [results, selectedSessionFilter, selectedTermFilter]);

  const selectedSessionName =
    selectedSessionFilter === "ALL"
      ? "All Sessions"
      : availableSessions.find((s) => s.id === selectedSessionFilter)?.name || "Selected Session";
  const selectedTermLabel =
    selectedTermFilter === "ALL" ? "All Terms" : getTermLabel(selectedTermFilter);

  // ── Evaluation Context (Session, Term, Class) ───────────────────────────
  const evalCandidates = filteredResults.length > 0 ? filteredResults : results;
  const safeEvalIdx = selectedEvaluationIdx < evalCandidates.length ? selectedEvaluationIdx : 0;
  const activeEvalGroup = evalCandidates[safeEvalIdx] || results[0];
  const evalSessionId = activeEvalGroup?.sessionId || "";
  const evalTerm = (activeEvalGroup?.term as "FIRST" | "SECOND" | "THIRD") || "FIRST";
  const evalClassId =
    activeEvalGroup?.class?.id || studentProfile?.classes?.[0]?.class?.id || "";

  const {
    data: serverEvaluation,
    isLoading: isEvaluationLoading,
  } = useTermlyEvaluation(studentId, evalClassId, evalSessionId, evalTerm);

  const upsertEvaluationMutation = useUpsertTermlyEvaluation(studentId);

  const fallbackBehavior = useMemo(() => {
    for (const s of activeEvalGroup?.subjectResults || []) {
      if ((s as any)?.scoreSources?.behavior) return (s as any).scoreSources.behavior;
    }
    for (const g of results) {
      for (const s of g?.subjectResults || []) {
        if ((s as any)?.scoreSources?.behavior) return (s as any).scoreSources.behavior;
      }
    }
    return null;
  }, [activeEvalGroup, results]);

  // Edit form state for modal
  const [editFormData, setEditFormData] = useState<Record<string, any>>({
    attentiveness: 5,
    honesty: 5,
    neatness: 5,
    politeness: 5,
    punctuality: 5,
    selfControl: 5,
    obedience: 5,
    reliability: 5,
    responsibility: 5,
    relationship: 5,
    handlingTools: 5,
    drawingPainting: 5,
    handwriting: 5,
    publicSpeaking: 5,
    speechFluency: 5,
    sportsGames: 5,
    teacherRemark: "",
    principalRemark: "",
  });

  useEffect(() => {
    const evalData = serverEvaluation || fallbackBehavior;
    if (evalData) {
      setEditFormData({
        attentiveness: evalData.attentiveness ?? 5,
        honesty: evalData.honesty ?? 5,
        neatness: evalData.neatness ?? 5,
        politeness: evalData.politeness ?? 5,
        punctuality: evalData.punctuality ?? 5,
        selfControl: evalData.selfControl ?? 5,
        obedience: evalData.obedience ?? 5,
        reliability: evalData.reliability ?? 5,
        responsibility: evalData.responsibility ?? 5,
        relationship: evalData.relationship ?? 5,
        handlingTools: evalData.handlingTools ?? 5,
        drawingPainting: evalData.drawingPainting ?? 5,
        handwriting: evalData.handwriting ?? 5,
        publicSpeaking: evalData.publicSpeaking ?? 5,
        speechFluency: evalData.speechFluency ?? 5,
        sportsGames: evalData.sportsGames ?? 5,
        teacherRemark: evalData.teacherRemark || "",
        principalRemark: evalData.principalRemark || "",
      });
    } else {
      setEditFormData({
        attentiveness: 5,
        honesty: 5,
        neatness: 5,
        politeness: 5,
        punctuality: 5,
        selfControl: 5,
        obedience: 5,
        reliability: 5,
        responsibility: 5,
        relationship: 5,
        handlingTools: 5,
        drawingPainting: 5,
        handwriting: 5,
        publicSpeaking: 5,
        speechFluency: 5,
        sportsGames: 5,
        teacherRemark: "",
        principalRemark: "",
      });
    }
  }, [serverEvaluation, fallbackBehavior, evalSessionId, evalTerm]);

  const handleSaveEvaluationModal = async () => {
    if (!evalClassId || !evalSessionId || !evalTerm) {
      toast.error("An enrolled class, academic session, and term are required.");
      return;
    }

    try {
      await upsertEvaluationMutation.mutateAsync({
        classId: evalClassId,
        sessionId: evalSessionId,
        term: evalTerm,
        ...editFormData,
      });
      setIsEditModalOpen(false);
    } catch (e) {
      console.error("Failed to save evaluation:", e);
    }
  };

  // ── Find Official Approval Data from Certified Results ──────────────────
  const approvalInfo = useMemo(() => {
    const list = filteredResults.length > 0 ? filteredResults : results;
    for (const g of list) {
      const app = (g as any)?.approval || (g as any)?.paperLinks?.approval;
      if (app && app.status === "APPROVED") return app;
      for (const s of g.subjectResults || []) {
        const sApp = (s as any)?.approval || (s as any)?.paperLinks?.approval;
        if (sApp && sApp.status === "APPROVED") return sApp;
      }
    }
    // Fallback: search all results regardless of active filters
    for (const g of results) {
      const app = (g as any)?.approval || (g as any)?.paperLinks?.approval;
      if (app && app.status === "APPROVED") return app;
      for (const s of g.subjectResults || []) {
        const sApp = (s as any)?.approval || (s as any)?.paperLinks?.approval;
        if (sApp && sApp.status === "APPROVED") return sApp;
      }
    }
    return null;
  }, [filteredResults, results]);

  // ── Gather Admin Candidates for Endorsement Signatures ──────────────────
  const adminCandidates = useMemo(() => {
    const list: Array<{ id: string; name: string; adminRole: string }> = [];

    schoolAdmins.forEach((m) => {
      if (m?.id) {
        list.push({
          id: String(m.id),
          name: m.name || m.email || "School Administrator",
          adminRole: String(m.adminRole || m.role || "").toUpperCase().trim(),
        });
      }
    });

    if (user?.id) {
      const existing = list.find((a) => a.id === user.id);
      const userRole = String(
        user.role || (user as any).adminRole || (user.schools?.[0] as any)?.role || ""
      ).toUpperCase().trim();
      if (!existing) {
        list.push({
          id: String(user.id),
          name: user.name || (user as any).fullName || user.email || "School Administrator",
          adminRole: userRole,
        });
      } else if (!existing.adminRole && userRole) {
        existing.adminRole = userRole;
      }
    }

    if (!list.some((a) => a.id === "admin-system")) {
      list.push({
        id: "admin-system",
        name: "School Administration",
        adminRole: "ADMIN",
      });
    }

    return list;
  }, [schoolAdmins, user]);

  const candidateUserIds = useMemo(() => {
    const ids = new Set<string>();
    adminCandidates.forEach((a) => {
      if (a.id) ids.add(a.id);
    });
    if (user?.id) ids.add(user.id);
    if (currentAdminUserId) ids.add(currentAdminUserId);
    ids.add("admin-system");
    if (approvalInfo?.approvedById) ids.add(approvalInfo.approvedById);
    if (approvalInfo?.requestedById) ids.add(approvalInfo.requestedById);

    // Also scan localStorage keys for any saved signatures
    if (typeof window !== "undefined") {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("schoolhub_signature_")) {
            const uid = k.replace("schoolhub_signature_", "");
            if (uid) ids.add(uid);
          }
        }
      } catch {}
    }

    return Array.from(ids);
  }, [adminCandidates, user, currentAdminUserId, approvalInfo]);

  const { data: signaturesMap = {} } = useSignaturesByUserIds(candidateUserIds);

  // ── Compute Official Endorsement Signatures ──────────────────────────────
  // Slot 1 (Right): Principal / Vice Principal / School Owner (Principal first, based on who has signature; blank if unavailable)
  // Slot 2 (Left): Registrar (Registrar of school; blank if unavailable)
  const { principalSlot, registrarSlot } = useMemo(() => {
    const getSigForId = (id?: string): SignatureRecord | null => {
      if (!id) return null;
      // 0. Check instant local overrides
      if (customHeadSig && (customHeadSig.userId === id || id === currentAdminUserId)) {
        return customHeadSig;
      }
      if (customRegistrarSig && customRegistrarSig.userId === id) {
        return customRegistrarSig;
      }
      // 1. Direct match in batch signatures query
      const sig = signaturesMap[id];
      if (sig && (sig.signedUrl || (sig as any).dataUrl) && sig.isActive !== false) {
        return sig;
      }
      // 2. Active auth signature for logged-in user
      if (
        (id === user?.id || id === currentAdminUserId) &&
        currentAuthSignature &&
        (currentAuthSignature.signedUrl || (currentAuthSignature as any).dataUrl) &&
        currentAuthSignature.isActive !== false
      ) {
        return currentAuthSignature;
      }
      // 3. System admin signature
      if (
        (id === "admin-system" || id === currentAdminUserId) &&
        systemAdminSignature &&
        (systemAdminSignature.signedUrl || (systemAdminSignature as any).dataUrl) &&
        systemAdminSignature.isActive !== false
      ) {
        return systemAdminSignature;
      }
      // 4. LocalStorage direct read
      if (typeof window !== "undefined") {
        try {
          const direct = localStorage.getItem(`schoolhub_signature_${id}`);
          if (direct) {
            const parsed = JSON.parse(direct);
            if (parsed && (parsed.signedUrl || parsed.dataUrl)) return parsed;
          }
        } catch {}
      }
      return null;
    };

    // Helper to get ANY valid signature present across auth, cache, or localStorage
    const getAnyAvailableSignature = (): SignatureRecord | null => {
      if (customHeadSig && (customHeadSig.signedUrl || (customHeadSig as any).dataUrl)) {
        return customHeadSig;
      }
      if (currentAuthSignature && (currentAuthSignature.signedUrl || (currentAuthSignature as any).dataUrl)) {
        return currentAuthSignature;
      }
      if (systemAdminSignature && (systemAdminSignature.signedUrl || (systemAdminSignature as any).dataUrl)) {
        return systemAdminSignature;
      }
      for (const sig of Object.values(signaturesMap)) {
        if (sig && (sig.signedUrl || (sig as any).dataUrl)) {
          return sig;
        }
      }
      if (typeof window !== "undefined") {
        try {
          const activeDirect = localStorage.getItem("schoolhub_signature_active");
          if (activeDirect) {
            const parsed = JSON.parse(activeDirect);
            if (parsed && (parsed.signedUrl || parsed.dataUrl)) return parsed;
          }
          const sysDirect = localStorage.getItem("schoolhub_signature_admin-system");
          if (sysDirect) {
            const parsed = JSON.parse(sysDirect);
            if (parsed && (parsed.signedUrl || parsed.dataUrl)) return parsed;
          }
          if (user?.id) {
            const userDirect = localStorage.getItem(`schoolhub_signature_${user.id}`);
            if (userDirect) {
              const parsed = JSON.parse(userDirect);
              if (parsed && (parsed.signedUrl || parsed.dataUrl)) return parsed;
            }
          }
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("schoolhub_signature_")) {
              const item = localStorage.getItem(k);
              if (item) {
                const parsed = JSON.parse(item);
                if (parsed && (parsed.signedUrl || parsed.dataUrl)) return parsed;
              }
            }
          }
        } catch {}
      }
      if (approvalInfo?.signature) {
        const raw = String(approvalInfo.signature).trim();
        if (raw.length > 0) {
          return {
            id: "approval-sig",
            userId: approvalInfo.approvedById || "approver",
            storagePath: "",
            method: "typed",
            sha256: "",
            isActive: true,
            signedUrl: raw,
            dataUrl: raw,
            createdAt: approvalInfo.approvedAt || new Date().toISOString(),
          } as SignatureRecord;
        }
      }
      return null;
    };

    const getAdminRole = (admin?: { id: string; name: string; adminRole: string } | null) =>
      String(admin?.adminRole || "").toUpperCase().trim();

    const isPrincipal = (role: string) =>
      role === "PRINCIPAL" || (role.includes("PRINCIPAL") && !role.includes("VICE"));

    const isVicePrincipal = (role: string) =>
      role === "VICE_PRINCIPAL" || role.includes("VICE");

    const isSchoolOwner = (role: string) =>
      role === "SCHOOL_OWNER" ||
      role === "OWNER" ||
      role === "PROPRIETOR" ||
      role === "SUPER_ADMIN" ||
      role.includes("OWNER") ||
      role.includes("PROPRIETOR");

    const isRegistrar = (role: string) =>
      role === "REGISTRAR" || role.includes("REGISTRAR");

    const principals = adminCandidates.filter((a) => isPrincipal(getAdminRole(a)));
    const vicePrincipals = adminCandidates.filter((a) => isVicePrincipal(getAdminRole(a)));
    const schoolOwners = adminCandidates.filter(
      (a) =>
        isSchoolOwner(getAdminRole(a)) &&
        !isPrincipal(getAdminRole(a)) &&
        !isVicePrincipal(getAdminRole(a))
    );
    const registrars = adminCandidates.filter((a) => isRegistrar(getAdminRole(a)));

    // ── 1. SELECT HEAD OF INSTITUTION (Principal, Vice Principal, School Owner) ──
    // Priority: whoever has a signature first (Principal -> Vice Principal -> School Owner).
    // If none has individual signature: select by institutional hierarchy (Principal -> VP -> School Owner)
    // and bind the active available signature.
    const principalWithSig = principals.find((a) => !!getSigForId(a.id));
    const vpWithSig = vicePrincipals.find((a) => !!getSigForId(a.id));
    const ownerWithSig = schoolOwners.find((a) => !!getSigForId(a.id));

    let chosenHeadAdmin: { id: string; name: string; adminRole: string } | null = null;
    let chosenHeadSig: SignatureRecord | null = null;

    if (principalWithSig) {
      chosenHeadAdmin = principalWithSig;
      chosenHeadSig = getSigForId(principalWithSig.id);
    } else if (vpWithSig) {
      chosenHeadAdmin = vpWithSig;
      chosenHeadSig = getSigForId(vpWithSig.id);
    } else if (ownerWithSig) {
      chosenHeadAdmin = ownerWithSig;
      chosenHeadSig = getSigForId(ownerWithSig.id);
    } else {
      const anyAvailableSig = getAnyAvailableSignature();

      if (principals.length > 0) {
        chosenHeadAdmin = principals[0];
      } else if (vicePrincipals.length > 0) {
        chosenHeadAdmin = vicePrincipals[0];
      } else if (schoolOwners.length > 0) {
        chosenHeadAdmin = schoolOwners[0];
      } else if (user) {
        const uRole = String(
          user.role || (user as any).adminRole || (user.schools?.[0] as any)?.role || ""
        )
          .toUpperCase()
          .trim();
        chosenHeadAdmin = {
          id: user.id || currentAdminUserId,
          name: user.name || (user as any).fullName || "Principal / Head of Institution",
          adminRole: isVicePrincipal(uRole)
            ? "VICE_PRINCIPAL"
            : isSchoolOwner(uRole)
            ? "SCHOOL_OWNER"
            : "PRINCIPAL",
        };
      } else {
        const adminFallback = adminCandidates.find((a) => a.id !== "admin-system") || {
          id: "default-principal",
          name: "Principal / Head of Institution",
          adminRole: "PRINCIPAL",
        };
        chosenHeadAdmin = adminFallback;
      }

      chosenHeadSig = getSigForId(chosenHeadAdmin.id) || anyAvailableSig;
    }

    // Role title formatting
    const chosenRole = getAdminRole(chosenHeadAdmin);
    const headRoleTitle = isPrincipal(chosenRole)
      ? "Principal / Head of Institution"
      : isVicePrincipal(chosenRole)
      ? "Vice Principal / Academic Director"
      : isSchoolOwner(chosenRole)
      ? "School Owner / Proprietor"
      : "Principal / Head of Institution";

    let rawHeadSig =
      chosenHeadSig?.signedUrl ||
      (chosenHeadSig as any)?.dataUrl ||
      (chosenHeadSig as any)?.url ||
      undefined;

    // Clean any trailing role suffix if it was saved from records approval text (e.g. "Mr Festus (School Owner)" -> "Mr Festus")
    if (rawHeadSig && !rawHeadSig.startsWith("data:") && !rawHeadSig.startsWith("blob:") && !rawHeadSig.startsWith("http") && !rawHeadSig.startsWith("/")) {
      rawHeadSig = rawHeadSig.replace(/\s*\([^)]*\)$/, "").trim();
    }

    // Always fallback to the Head of Institution's certified name signature so it is NEVER blank
    if (!rawHeadSig) {
      rawHeadSig = chosenHeadAdmin?.name || user?.name || "Official Attestation";
    }

    const isHeadImage = !!(
      rawHeadSig &&
      (rawHeadSig.startsWith("data:") ||
        rawHeadSig.startsWith("blob:") ||
        rawHeadSig.startsWith("http") ||
        rawHeadSig.startsWith("/"))
    );

    const principalSlotData = {
      hasSignature: true, // Always true so the official signature is ALWAYS shown!
      roleTitle: headRoleTitle,
      subtitle: `${chosenHeadAdmin.name} • ${schoolName}`,
      signature: chosenHeadSig || undefined,
      signatureUrl: rawHeadSig,
      adminName: chosenHeadAdmin.name,
      adminId: chosenHeadAdmin.id,
      isImage: isHeadImage,
    };

    // ── 2. SELECT REGISTRAR (Second Endorsement Slot) ────────────────────────
    // If registrar signature is available, display it; otherwise leave blank
    const registrarWithSig = registrars.find((a) => !!getSigForId(a.id));
    const chosenRegistrar =
      registrarWithSig ||
      registrars[0] || {
        id: "default-registrar",
        name: "Office of the Registrar",
        adminRole: "REGISTRAR",
      };

    let chosenRegistrarSig = getSigForId(chosenRegistrar.id);

    // If no signature found specifically for chosenRegistrar, check if approvalInfo had registrar signature
    if (!chosenRegistrarSig && approvalInfo?.requestedRole?.toUpperCase().includes("REGISTRAR")) {
      chosenRegistrarSig = getSigForId(approvalInfo.requestedById);
    }

    let rawRegistrarSig =
      customRegistrarSig?.signedUrl ||
      (customRegistrarSig as any)?.dataUrl ||
      chosenRegistrarSig?.signedUrl ||
      (chosenRegistrarSig as any)?.dataUrl ||
      (chosenRegistrarSig as any)?.url ||
      undefined;

    if (rawRegistrarSig && !rawRegistrarSig.startsWith("data:") && !rawRegistrarSig.startsWith("blob:") && !rawRegistrarSig.startsWith("http") && !rawRegistrarSig.startsWith("/")) {
      rawRegistrarSig = rawRegistrarSig.replace(/\s*\([^)]*\)$/, "").trim();
    }

    const isRegistrarImage = !!(
      rawRegistrarSig &&
      (rawRegistrarSig.startsWith("data:") ||
        rawRegistrarSig.startsWith("blob:") ||
        rawRegistrarSig.startsWith("http") ||
        rawRegistrarSig.startsWith("/"))
    );

    const registrarSlotData = {
      hasSignature: !!rawRegistrarSig,
      roleTitle: "Registrar / Academic Director",
      subtitle: `${chosenRegistrar.name} • Office of Academic Records`,
      signature: chosenRegistrarSig || customRegistrarSig || undefined,
      signatureUrl: rawRegistrarSig,
      adminName: chosenRegistrar.name,
      adminId: chosenRegistrar.id,
      isImage: isRegistrarImage,
    };

    return {
      principalSlot: principalSlotData,
      registrarSlot: registrarSlotData,
    };
  }, [
    adminCandidates,
    signaturesMap,
    currentAuthSignature,
    systemAdminSignature,
    customHeadSig,
    customRegistrarSig,
    currentAdminUserId,
    approvalInfo,
    user,
    schoolName,
  ]);

  // ── Calculate Cumulative Academic Statistics (Reflects Filter Scope) ───
  const transcriptStats = useMemo(() => {
    let totalMarksSum = 0;
    let scoredSubjectCount = 0;
    let totalPointsSum = 0;
    let totalSubjectsOverall = 0;

    const sourceData = isFilterActive ? filteredResults : results;

    sourceData.forEach((group) => {
      const subjects = group.subjectResults || [];
      subjects.forEach((s) => {
        totalSubjectsOverall++;
        const effectiveTotal =
          s.totalScore != null
            ? s.totalScore
            : s.assignmentScore != null ||
              s.quizScore != null ||
              s.caScore != null ||
              s.examScore != null
            ? (s.assignmentScore || 0) +
              (s.quizScore || 0) +
              (s.caScore || 0) +
              (s.examScore || 0)
            : null;

        if (s.scoresRevealed && effectiveTotal != null) {
          totalMarksSum += effectiveTotal;
          totalPointsSum += getGradePoint(effectiveTotal, gradingSystem);
          scoredSubjectCount++;
        }
      });
    });

    const cgpa = scoredSubjectCount > 0 ? (totalPointsSum / scoredSubjectCount).toFixed(2) : "0.00";
    const cumulativeAverage = scoredSubjectCount > 0 ? Math.round(totalMarksSum / scoredSubjectCount) : 0;

    let academicStanding = "Good";
    const numericCGPA = parseFloat(cgpa);
    if (numericCGPA >= 4.5 || cumulativeAverage >= 75) academicStanding = "Excellent";
    else if (numericCGPA >= 3.5 || cumulativeAverage >= 65) academicStanding = "Very Good";
    else if (numericCGPA >= 2.5 || cumulativeAverage >= 50) academicStanding = "Good";
    else if (numericCGPA >= 1.5 || cumulativeAverage >= 40) academicStanding = "Pass";
    else academicStanding = "Needs Improvement";

    const cgpaGrade = getCgpaGrade(numericCGPA, cumulativeAverage);

    return {
      cgpa,
      cgpaGrade,
      cumulativeAverage,
      totalSubjectsOverall,
      scoredSubjectCount,
      academicStanding,
      totalSessions: new Set(sourceData.map((r) => r.sessionId)).size,
      totalTerms: sourceData.length,
    };
  }, [filteredResults, results, isFilterActive, gradingSystem]);

  // ── Group Results by Academic Session (Reflects Filter Scope) ───────────
  const groupedBySession = useMemo(() => {
    const sessionMap = new Map<string, { sessionName: string; terms: PublishedResultGroup[] }>();

    filteredResults.forEach((group) => {
      const sessionId = group.sessionId || "current-session";
      const sessionName = group.session?.name || "Academic Session";

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, { sessionName, terms: [] });
      }
      sessionMap.get(sessionId)!.terms.push(group);
    });

    return Array.from(sessionMap.entries()).map(([sessionId, data]) => ({
      sessionId,
      sessionName: data.sessionName,
      terms: data.terms,
    }));
  }, [filteredResults]);

  // ── Print & PDF Handlers with Automatic Audit Telemetry ─────────────────
  const handlePrint = () => {
    recordDownloadMutation.mutate({
      fileName: `${studentProfile?.studentCode || "Scholar"}_Print_Copy.pdf`,
      fileType: "TRANSCRIPT_PRINT",
    });
    window.print();
  };

  const handleDownloadPDF = async () => {
    const exportTarget = filteredResults.length > 0 ? filteredResults : results;
    if (exportTarget.length === 0) {
      toast.warning("No published records available to export as PDF.");
      return;
    }

    setIsExporting(true);
    try {
      // Record download metric
      recordDownloadMutation.mutate({
        fileName: `${studentProfile?.studentCode || "Scholar"}_Academic_Transcript.pdf`,
        fileType: "TRANSCRIPT_DOWNLOAD",
      });

      const buildTableData = (termGroup: PublishedResultGroup) => {
        const rows: any[][] = [];
        const subjects = termGroup.subjectResults || [];

        subjects.forEach((s) => {
          const subName = s.subject?.name || "Subject";
          const subCode = s.subject?.code || "SUB";
          const asst = s.scoresRevealed && s.assignmentScore != null ? String(s.assignmentScore) : "—";
          const quiz = s.scoresRevealed && s.quizScore != null ? String(s.quizScore) : "—";
          const ca = s.scoresRevealed && s.caScore != null ? String(s.caScore) : "—";
          const exam = s.scoresRevealed && s.examScore != null ? String(s.examScore) : "—";
          const effectiveTotal = s.totalScore ?? (
            (s.assignmentScore != null || s.quizScore != null || s.caScore != null || s.examScore != null)
              ? ((s.assignmentScore || 0) + (s.quizScore || 0) + (s.caScore || 0) + (s.examScore || 0))
              : null
          );
          const total = s.scoresRevealed && effectiveTotal != null ? `${effectiveTotal}%` : "Pending";
          const grade = s.scoresRevealed ? getGradeLetter(effectiveTotal ?? null, gradingSystem) : "—";
          const gp = s.scoresRevealed ? getGradePoint(effectiveTotal ?? null, gradingSystem).toFixed(1) : "—";
          const remark = s.scoresRevealed ? getRemark(effectiveTotal ?? null, gradingSystem) : "Pending";

          rows.push([subCode, subName, asst, quiz, ca, exam, total, grade, gp, remark]);
        });

        return rows;
      };

      const tableHeaders = [
        ["CODE", "COURSE / SUBJECT", "ASST", "QUIZ", "CA", "EXAM", "TOTAL", "GRADE", "GP", "REMARK"],
      ];

      const firstGroup = exportTarget[0];
      const initialTableData = buildTableData(firstGroup);

      const additionalTables = exportTarget.slice(1).map((group) => ({
        title: `${group.session?.name || "Session"} — ${getTermLabel(group.term)} (${group.class?.name || "Cohort"})`,
        headers: tableHeaders,
        data: buildTableData(group),
      }));

      const behavioralEvaluationPayload = {
        sessionName: activeEvalGroup?.session?.name || "Academic Session",
        termLabel: getTermLabel(evalTerm),
        className: activeEvalGroup?.class?.name || studentProfile?.classes?.[0]?.class?.name || "Cohort",
        affective: AFFECTIVE_TRAITS.map((t) => ({
          trait: t.label,
          score: (serverEvaluation as any)?.[t.key] ?? fallbackBehavior?.[t.key] ?? null,
        })),
        psychomotor: PSYCHOMOTOR_SKILLS.map((s) => ({
          trait: s.label,
          score: (serverEvaluation as any)?.[s.key] ?? fallbackBehavior?.[s.key] ?? null,
        })),
        teacherRemark: serverEvaluation?.teacherRemark?.trim() || fallbackBehavior?.teacherRemark?.trim() || undefined,
        principalRemark: serverEvaluation?.principalRemark?.trim() || fallbackBehavior?.principalRemark?.trim() || undefined,
        cgpa: transcriptStats.cgpa,
        cgpaGrade: transcriptStats.cgpaGrade,
      };

      await generatePDF({
        title: "OFFICIAL ACADEMIC TRANSCRIPT",
        filename: `${studentProfile?.studentCode || "Scholar"}_Academic_Transcript.pdf`,
        schoolProfile: {
          name: schoolName,
          motto: schoolMotto,
          logo: schoolLogoUrl,
          schoolLogo: schoolLogoUrl,
          address: schoolLocation,
        },
        metaData: [
          { label: "Student Name", value: studentProfile?.name || "Scholar" },
          { label: "Student Code", value: studentProfile?.studentCode || "N/A" },
          { label: "Department", value: studentProfile?.department?.name || "General Studies" },
          { label: "Cumulative CGPA", value: `${transcriptStats.cgpa} (${transcriptStats.cgpaGrade})` },
          { label: "Academic Standing", value: transcriptStats.academicStanding },
          ...(selectedSessionFilter !== "ALL"
            ? [{ label: "Session Scope", value: selectedSessionName }]
            : []),
          ...(selectedTermFilter !== "ALL"
            ? [{ label: "Term Scope", value: selectedTermLabel }]
            : []),
          { label: "Transcript Ref", value: `TRX-${studentProfile?.studentCode?.toUpperCase() || "SCH"}-${new Date().getFullYear()}` },
          { label: "Issued Date", value: format(new Date(), "MMMM d, yyyy") },
        ],
        tableHeaders,
        tableData: initialTableData,
        additionalTables,
        orientation: "portrait",
        studentPhotoUrl: studentProfile?.profileImage || undefined,
        behavioralEvaluation: behavioralEvaluationPayload,
        signatures: {
          left: {
            label: registrarSlot.roleTitle,
            name: registrarSlot.subtitle,
            signatureUrl: registrarSlot.signatureUrl || undefined,
          },
          right: {
            label: principalSlot.roleTitle,
            name: principalSlot.subtitle,
            signatureUrl: principalSlot.signatureUrl || undefined,
          },
        },
      });

      toast.success("Official Multi-Page Transcript PDF generated successfully!");
    } catch (err) {
      console.error("Failed to generate PDF transcript:", err);
      toast.error("Failed to generate PDF. You can also use Print Copy to save as PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // Simulate a download event for testing
  const handleSimulateDownload = () => {
    recordDownloadMutation.mutate(
      {
        fileName: "Simulated_Result_Download.pdf",
        fileType: "RESULT_DOWNLOAD",
      },
      {
        onSuccess: () => {
          toast.success("Result download event logged in audit ledger!");
        },
      }
    );
  };

  // ── Loading Skeleton ─────────────────────────────────────────────────────
  if (isStudentLoading || isResultsLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-44 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const enrolledClass =
    studentProfile?.classes?.[0]?.class?.name
      ? `${studentProfile.classes[0].class.name} ${studentProfile.classes[0].class.section || ""}`.trim()
      : "Active Enrolled";

  // Reusable Letterhead Component
  const renderOfficialLetterhead = (pageTitle: string, pageSubtitle: string) => (
    <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Institutional School Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
            {schoolLogoUrl ? (
              <img
                src={schoolLogoUrl}
                alt={schoolName}
                onError={() => setLogoLoadError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <School size={40} className="text-blue-600 dark:text-blue-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={12} />
              Official Certified Institutional Record
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {schoolName}
            </h2>
            <p className="text-xs italic text-blue-600 dark:text-blue-400 font-serif font-medium">
              "{schoolMotto}"
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>{schoolLocation}</span>
              </span>
              <span>•</span>
              <span>{pageSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Student Portrait Picture (Opposite School Crest in Letterhead) */}
        <div className="self-center sm:self-start shrink-0">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-sm relative flex items-center justify-center">
            {studentProfile?.profileImage ? (
              <img
                src={studentProfile.profileImage}
                alt={studentProfile.name || "Student Photo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900">
                <User size={32} className="text-slate-400 dark:text-zinc-500" />
                <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-slate-500 dark:text-zinc-400">
                  Scholar
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Reusable Student Profile & Document Reference Banner
  const renderStudentProfileBanner = (refPrefix: string = "Academic Transcript") => (
    <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs w-full">
        {/* Scholar Full Name */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Scholar Full Name
          </p>
          <p className="text-slate-900 dark:text-white font-black text-sm truncate">
            {studentProfile?.name || "Scholar Record"}
          </p>
        </div>

        {/* Student ID / Code */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Student ID / Code
          </p>
          <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm truncate">
            {studentProfile?.studentCode || "N/A"}
          </p>
        </div>

        {/* Department / Cohort */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Department / Cohort
          </p>
          <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
            {studentProfile?.department?.name || enrolledClass}
          </p>
        </div>

        {/* Enrollment Status */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Enrollment Status
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1 truncate">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>Active Enrolled</span>
          </p>
        </div>

        {/* Document Reference Number */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px] truncate">
            {refPrefix} Ref No.
          </p>
          <p className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
            TRX-{studentProfile?.studentCode?.toUpperCase() || "SCH"}-{new Date().getFullYear()}
          </p>
        </div>

        {/* Issued Date */}
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Issued Date
          </p>
          <p className="text-slate-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm truncate">
            {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );

  // Reusable Endorsement Signatures Block
  const renderEndorsementSignatures = () => (
    <div className="pt-8 border-t-2 border-slate-200 dark:border-zinc-800 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center sm:text-left">
        {/* Signature 1: Left Slot (Registrar) */}
        <div className="space-y-3">
          <div className="h-24 sm:h-28 flex items-end justify-center sm:justify-start pb-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 w-full transition-all relative group">
            {registrarSlot.signatureUrl && !registrarImgError ? (
              <div className="relative w-full flex items-end justify-center sm:justify-start">
                {registrarSlot.isImage ? (
                  <img
                    src={registrarSlot.signatureUrl}
                    alt={registrarSlot.roleTitle}
                    onError={() => setRegistrarImgError(true)}
                    className="h-20 sm:h-24 max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-xs dark:invert dark:brightness-125 dark:contrast-125 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] print:filter-none print:invert-0 transition-all select-none"
                  />
                ) : (
                  <span className="font-['Caveat',cursive] italic text-2xl sm:text-3xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 select-none pb-1 transform -rotate-1 inline-block drop-shadow-xs">
                    {registrarSlot.signatureUrl}
                  </span>
                )}
                {/* Admin Quick Action Button on Hover */}
                <button
                  type="button"
                  onClick={() => setSignatureModalTarget("registrar")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 left-0 px-2 py-1 rounded-lg bg-blue-600 text-white shadow-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 print:hidden"
                  title="Change Registrar Signature"
                >
                  <PenTool size={11} />
                  <span>Update</span>
                </button>
              </div>
            ) : (
              /* No signature on registrar slot: allow 1-click attach in admin view, leave blank on print */
              <div className="w-full flex items-center justify-center sm:justify-start h-full print:hidden">
                <button
                  type="button"
                  onClick={() => setSignatureModalTarget("registrar")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/50 text-[11px] font-bold transition-all shadow-2xs group"
                >
                  <PenTool size={12} className="group-hover:scale-110 transition-transform" />
                  <span>+ Attach Registrar Signature</span>
                </button>
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {registrarSlot.roleTitle}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {registrarSlot.subtitle}
            </p>
          </div>
        </div>

        {/* Official Seal Center */}
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400 dark:border-blue-600 flex items-center justify-center text-center p-2 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter shadow-xs">
            Official Electronic Seal
          </div>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            Certified Verified Copy
          </p>
        </div>

        {/* Signature 2: Right Slot (Principal / Vice Principal / School Owner) */}
        <div className="space-y-3 text-center sm:text-right">
          <div className="h-24 sm:h-28 flex items-end justify-center sm:justify-end pb-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 w-full transition-all relative group">
            {principalSlot.signatureUrl && !headImgError ? (
              <div className="relative w-full flex items-end justify-center sm:justify-end">
                {principalSlot.isImage ? (
                  <img
                    src={principalSlot.signatureUrl}
                    alt={principalSlot.roleTitle}
                    onError={() => setHeadImgError(true)}
                    className="h-20 sm:h-24 max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-xs dark:invert dark:brightness-125 dark:contrast-125 dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] print:filter-none print:invert-0 transition-all select-none"
                  />
                ) : (
                  <span className="font-['Caveat',cursive] italic text-3xl sm:text-4xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 select-none pb-1 transform -rotate-2 inline-block drop-shadow-xs">
                    {principalSlot.signatureUrl}
                  </span>
                )}
                {/* Admin Quick Action Button on Hover */}
                <button
                  type="button"
                  onClick={() => setSignatureModalTarget("head")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 right-0 px-2 py-1 rounded-lg bg-blue-600 text-white shadow-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 print:hidden"
                  title="Draw or Upload Custom Signature"
                >
                  <PenTool size={11} />
                  <span>{principalSlot.signature ? "Change Signature" : "Upload / Draw"}</span>
                </button>
              </div>
            ) : (
              <div className="relative w-full flex items-end justify-center sm:justify-end">
                <span className="font-['Caveat',cursive] italic text-3xl sm:text-4xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 select-none pb-1 transform -rotate-2 inline-block drop-shadow-xs">
                  {principalSlot.adminName || "Authorized Signature"}
                </span>
                <button
                  type="button"
                  onClick={() => setSignatureModalTarget("head")}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-3 right-0 px-2 py-1 rounded-lg bg-blue-600 text-white shadow-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-700 print:hidden"
                  title="Draw or Upload Custom Signature"
                >
                  <PenTool size={11} />
                  <span>Draw / Upload</span>
                </button>
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {principalSlot.roleTitle}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {principalSlot.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 dark:text-zinc-500 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
        This certified academic credential was generated electronically via Qefas Hub Academic Management System. Any alteration, erasure, or unauthorized duplication invalidates this document.
      </div>
    </div>
  );

  if (isStudentLoading || isResultsLoading) {
    return <TranscriptPreviewSkeleton onBack={onBack} isSidebarOpen={isSidebarOpen} />;
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* ── Top Action & Navigation Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        {/* Back and Student Quick Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <ArrowLeft size={15} />
            <span>Select Another Scholar</span>
          </Button>

          {/* Quick Switch Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
              >
                <User size={14} className="text-blue-600" />
                <span className="max-w-[150px] truncate">{studentProfile?.name || "Switch Scholar"}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto rounded-2xl p-1.5">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Quick Switch Scholar
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickStudents.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">No other scholars available</div>
              ) : (
                quickStudents.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => onSelectStudent(s.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl p-2 text-xs cursor-pointer font-medium",
                      s.id === studentId ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold" : ""
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.studentCode}</p>
                    </div>
                    {s.id === studentId && <CheckCircle2 size={14} className="text-blue-600 shrink-0" />}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Verification Badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck size={14} />
            <span>Admin Certification View</span>
          </div>
        </div>

        {/* Page Switcher Tabs, Audit Sidebar Toggle & Print/Export Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Page Switcher Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActivePageView("page1")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "page1"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              )}
            >
              Page 1: Academic
            </button>
            <button
              onClick={() => setActivePageView("page2")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "page2"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              )}
            >
              Page 2: Conduct & Remarks
            </button>
            <button
              onClick={() => setActivePageView("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "all"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              )}
            >
              All Pages
            </button>
          </div>

          {/* Toggle Audit Sidebar Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={cn(
              "h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 transition-colors shadow-xs",
              isSidebarOpen
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-900/60"
                : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300"
            )}
          >
            <CreditCard size={15} />
            <span className="hidden sm:inline">Access & Payment Audit</span>
            {auditData?.paymentStats?.hasPaid ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 shadow-xs"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print Copy</span>
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            {isExporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Export Official PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Interactive Session & Term Filter Bar ────────────────────────── */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden transition-all">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-200 mr-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Filter size={15} />
            </div>
            <span>Academic Filter:</span>
          </div>

          {/* Academic Session Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shadow-xs",
                  selectedSessionFilter !== "ALL"
                    ? "border-blue-300 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300"
                )}
              >
                <Calendar size={13} className={selectedSessionFilter !== "ALL" ? "text-blue-600" : "text-slate-400"} />
                <span className="max-w-[170px] truncate">{selectedSessionName}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-2xl p-1.5 shadow-lg">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Filter by Academic Session
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setSelectedSessionFilter("ALL")}
                className={cn(
                  "flex items-center justify-between rounded-xl p-2 text-xs cursor-pointer font-medium",
                  selectedSessionFilter === "ALL" ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold" : ""
                )}
              >
                <span>All Sessions ({results.length} total terms)</span>
                {selectedSessionFilter === "ALL" && <Check size={14} className="text-blue-600" />}
              </DropdownMenuItem>
              {availableSessions.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => setSelectedSessionFilter(s.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl p-2 text-xs cursor-pointer font-medium",
                    selectedSessionFilter === s.id ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold" : ""
                  )}
                >
                  <span className="truncate">{s.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {s.count} {s.count === 1 ? "term" : "terms"}
                    </span>
                    {selectedSessionFilter === s.id && <Check size={14} className="text-blue-600" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Academic Term Selector Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs shadow-inner">
            {availableTerms.map((t) => {
              const isSelected = selectedTermFilter === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedTermFilter(t.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                    isSelected
                      ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Reset Filters Button */}
          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSessionFilter("ALL");
                setSelectedTermFilter("ALL");
              }}
              className="h-9 px-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Filter State Metric Badge */}
        <div className="flex items-center gap-2 text-xs">
          {isFilterActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Filtered Scope: Showing {filteredResults.length} of {results.length} certified {results.length === 1 ? "term" : "terms"}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              Cumulative All-Time View • {results.length} certified {results.length === 1 ? "term" : "terms"}
            </span>
          )}
        </div>
      </div>

      {/* ── Document + Audit Sidebar 2-Column Responsive Layout ───────────── */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* ── Left Column: Official Institutional Document ─────────────────── */}
        <div ref={printRef} className="flex-1 min-w-0 w-full space-y-10">
          {/* ================================================================= */}
          {/* ── PAGE 1: OFFICIAL ACADEMIC TRANSCRIPT ───────────────────────── */}
          {/* ================================================================= */}
          <div
            className={cn(
              "rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0",
              activePageView === "page2" ? "hidden print:block" : "block"
            )}
          >
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
              <GraduationCap className="w-96 h-96 mx-auto text-slate-900 dark:text-white" />
            </div>

            {/* Letterhead */}
            {renderOfficialLetterhead("Academic Transcript", "Office of the Registrar & Academic Council")}

            {/* Student Biographical Profile Strip with Ref No. & Issue Date */}
            {renderStudentProfileBanner("Academic Transcript")}

            {/* Cumulative Performance Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 space-y-1">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-blue-600" />
                  Cumulative CGPA
                </span>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {transcriptStats.cgpa}
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    ({transcriptStats.cgpaGrade})
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
                </div>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5">
                  {transcriptStats.academicStanding}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Cumulative Average
                </span>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {transcriptStats.cumulativeAverage}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Over {transcriptStats.scoredSubjectCount} verified scores
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-500" />
                  Total Subjects
                </span>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {transcriptStats.totalSubjectsOverall}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Registered in transcript
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-500" />
                  Completed Terms
                </span>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {transcriptStats.totalTerms}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    ({transcriptStats.totalSessions} Sessions)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Certified terminal score sheets
                </p>
              </div>
            </div>

            {/* Session-by-Session & Term-by-Term Course Breakdown */}
            <div className="space-y-8 pt-2">
              {filteredResults.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <FileText size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {results.length === 0
                      ? "No Certified Score Records Found"
                      : "No Records Match Filter Criteria"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    {results.length === 0 ? (
                      <>
                        No published score sheets have been certified for{" "}
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {studentProfile?.name}
                        </span>{" "}
                        yet.
                      </>
                    ) : (
                      <>
                        No certified results found for {selectedSessionName} ({selectedTermLabel}). Try adjusting or resetting your filter.
                      </>
                    )}
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    {isFilterActive ? (
                      <Button
                        onClick={() => {
                          setSelectedSessionFilter("ALL");
                          setSelectedTermFilter("ALL");
                        }}
                        className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                      >
                        <RotateCcw size={13} />
                        <span>Reset Filters</span>
                      </Button>
                    ) : (
                      <Link href="/dashboard/admin/records">
                        <Button variant="outline" className="rounded-xl text-xs font-bold">
                          Go to Final Results Hub
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                groupedBySession.map(({ sessionId, sessionName, terms }) => (
                  <div key={sessionId} className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-zinc-700">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        <span>{sessionName}</span>
                      </h3>
                      <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                        {terms.length} {terms.length === 1 ? "Term Record" : "Term Records"}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {terms.map((termGroup, termIdx) => {
                        const subjects = termGroup.subjectResults || [];
                        const termLabel = getTermLabel(termGroup.term);
                        const revealedCount = termGroup.revealedCount || 0;
                        const totalSubjects = termGroup.subjectCount || subjects.length;

                        let termMarksSum = 0;
                        let termPointsSum = 0;
                        let termScoredCount = 0;
                        subjects.forEach((s) => {
                          const effectiveTotal = s.totalScore ?? (
                            (s.assignmentScore != null || s.quizScore != null || s.caScore != null || s.examScore != null)
                              ? ((s.assignmentScore || 0) + (s.quizScore || 0) + (s.caScore || 0) + (s.examScore || 0))
                              : null
                          );
                          if (s.scoresRevealed && effectiveTotal != null) {
                            termMarksSum += effectiveTotal;
                            termPointsSum += getGradePoint(effectiveTotal, gradingSystem);
                            termScoredCount++;
                          }
                        });

                        const termGpa = termScoredCount > 0 ? (termPointsSum / termScoredCount).toFixed(2) : "0.00";
                        const termAvg = termScoredCount > 0 ? Math.round(termMarksSum / termScoredCount) : 0;

                        return (
                          <div
                            key={`${sessionId}-${termGroup.term}-${termIdx}`}
                            className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs"
                          >
                            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase tracking-wider">
                                  {termLabel}
                                </span>
                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                  {termGroup.class?.name || "Class Cohort"}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
                                  <span>Term GPA:</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {termGpa}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
                                  <span>Average:</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {termAvg}%
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                                  {revealedCount}/{totalSubjects} Scores Released
                                </span>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100/60 dark:bg-zinc-800/40 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                                  <tr>
                                    <th className="py-2.5 px-4 w-20">Code</th>
                                    <th className="py-2.5 px-4">Subject / Course Name</th>
                                    <th className="py-2.5 px-3 text-center w-14">Assignment</th>
                                    <th className="py-2.5 px-3 text-center w-14">Quiz</th>
                                    <th className="py-2.5 px-3 text-center w-14">CA</th>
                                    <th className="py-2.5 px-3 text-center w-14">Exam</th>
                                    <th className="py-2.5 px-3 text-center w-16">Total (%)</th>
                                    <th className="py-2.5 px-3 text-center w-14">Grade</th>
                                    <th className="py-2.5 px-3 text-center w-12">GP</th>
                                    <th className="py-2.5 px-4 text-right w-24">Remark</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                  {subjects.length === 0 ? (
                                    <tr>
                                      <td colSpan={10} className="py-6 text-center text-slate-400 italic">
                                        No subject records registered for this term.
                                      </td>
                                    </tr>
                                  ) : (
                                    subjects.map((subj, sIdx) => {
                                      const isRevealed = subj.scoresRevealed;
                                      const calculatedTotal = subj.totalScore ?? (
                                        (subj.assignmentScore != null || subj.quizScore != null || subj.caScore != null || subj.examScore != null)
                                          ? ((subj.assignmentScore || 0) + (subj.quizScore || 0) + (subj.caScore || 0) + (subj.examScore || 0))
                                          : null
                                      );
                                      const grade = isRevealed ? getGradeLetter(calculatedTotal ?? null, gradingSystem) : "—";
                                      const gp = isRevealed ? getGradePoint(calculatedTotal ?? null, gradingSystem).toFixed(1) : "—";
                                      const remark = isRevealed ? getRemark(calculatedTotal ?? null, gradingSystem) : "Pending";

                                      return (
                                        <tr
                                          key={subj.id || sIdx}
                                          className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                          <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-zinc-400">
                                            {subj.subject?.code || `SUB${sIdx + 1}`}
                                          </td>
                                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                                            {subj.subject?.name || "Registered Course"}
                                          </td>
                                          <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-300 font-medium">
                                            {isRevealed && subj.assignmentScore != null ? subj.assignmentScore : "—"}
                                          </td>
                                          <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-300 font-medium">
                                            {isRevealed && subj.quizScore != null ? subj.quizScore : "—"}
                                          </td>
                                          <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-300 font-medium">
                                            {isRevealed && subj.caScore != null ? subj.caScore : "—"}
                                          </td>
                                          <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-300 font-medium">
                                            {isRevealed && subj.examScore != null ? subj.examScore : "—"}
                                          </td>
                                          <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white">
                                            {isRevealed && calculatedTotal != null ? `${calculatedTotal}%` : "Pending"}
                                          </td>
                                          <td className="py-3 px-3 text-center">
                                            {isRevealed && grade !== "—" ? (
                                              <span
                                                className={cn(
                                                  "inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border",
                                                  getGradeBadgeClass(grade)
                                                )}
                                              >
                                                {grade}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400 font-semibold">—</span>
                                            )}
                                          </td>
                                          <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-zinc-300">
                                            {gp}
                                          </td>
                                          <td className="py-3 px-4 text-right font-medium text-slate-600 dark:text-zinc-300">
                                            {remark}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cumulative CGPA Summary Line (Matching Progress Report Design) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  CGPA: {transcriptStats.cgpa} ({transcriptStats.cgpaGrade})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {transcriptStats.academicStanding}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Overall Average: <strong className="text-slate-800 dark:text-zinc-200">{transcriptStats.cumulativeAverage}%</strong> across {transcriptStats.scoredSubjectCount} certified courses
              </p>
            </div>

            {/* Endorsements on Page 1 */}
            {renderEndorsementSignatures()}
          </div>

          {/* ================================================================= */}
          {/* ── PAGE 2: BEHAVIORAL EVALUATIONS & EXECUTIVE REMARKS ──────────── */}
          {/* ================================================================= */}
          <div
            className={cn(
              "rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:break-before-page",
              activePageView === "page1" ? "hidden print:block" : "block"
            )}
          >
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
              <Heart className="w-96 h-96 mx-auto text-slate-900 dark:text-white" />
            </div>

            {/* Letterhead Page 2 */}
            {renderOfficialLetterhead(
              "Behavioral Record",
              "Department of Student Affairs & Behavioral Guidance"
            )}

            {/* Student Profile Banner */}
            {renderStudentProfileBanner("Behavioral Record")}

            {/* Page 2 Document Title & Term Selector Toolbar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-transparent dark:from-blue-950/20 dark:via-zinc-900/40 dark:to-transparent border border-blue-200/60 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider">
                    Page 2 of 2
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Student Conduct Appraisal & Behavioral Domain Evaluation
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Official appraisal of behavioral traits, psychomotor skills, and institutional remarks.
                </p>
              </div>

              {/* Term Selector & Quick Edit Action */}
              <div className="flex items-center flex-wrap gap-2 print:hidden">
                {evalCandidates.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-1.5 shadow-xs"
                      >
                        <Calendar size={13} className="text-blue-600" />
                        <span>
                          {activeEvalGroup?.session?.name || "Session"} • {getTermLabel(evalTerm)}
                        </span>
                        <ChevronDown size={13} className="text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5">
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                        Select Term Evaluation
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {evalCandidates.map((res, idx) => (
                        <DropdownMenuItem
                          key={`${res.sessionId}-${res.term}-${idx}`}
                          onClick={() => setSelectedEvaluationIdx(idx)}
                          className={cn(
                            "flex items-center justify-between rounded-xl p-2 text-xs font-medium cursor-pointer",
                            idx === safeEvalIdx ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold" : ""
                          )}
                        >
                          <span>
                            {res.session?.name} • {getTermLabel(res.term)}
                          </span>
                          {idx === safeEvalIdx && <Check size={14} className="text-blue-600" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  size="sm"
                  className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Record / Edit Remarks</span>
                </Button>
              </div>
            </div>

            {/* Active Session & Cohort Metadata Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">Evaluation Session:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeEvalGroup?.session?.name || "Current Academic Session"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">Academic Term:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {getTermLabel(evalTerm)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">Assessed Class:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeEvalGroup?.class?.name || enrolledClass}
                </span>
              </div>
            </div>

            {/* ── Section 1: Affective Domain Table ──────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" />
                  <span>Affective Domain Appraisal (Behavior & Social Conduct)</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  5-Point Standardized Institutional Scale
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Behavioral Attribute</th>
                      <th className="py-2.5 px-4 hidden sm:table-cell">Description</th>
                      <th className="py-2.5 px-3 text-center w-24">Rating (1-5)</th>
                      <th className="py-2.5 px-4 text-center w-40">Proficiency Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {AFFECTIVE_TRAITS.map((item, idx) => {
                      const score = (serverEvaluation as any)?.[item.key] ?? fallbackBehavior?.[item.key] ?? null;
                      return (
                        <tr
                          key={item.key}
                          className={cn(
                            "transition-colors",
                            idx % 2 === 1 ? "bg-slate-50/50 dark:bg-zinc-900/30" : "bg-white dark:bg-zinc-950",
                            "hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
                          )}
                        >
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-zinc-100">
                            {item.label}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 hidden sm:table-cell text-[11px]">
                            {item.desc}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {score != null ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-200 dark:border-blue-800">
                                {score}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">5</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={cn(
                                "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                (score ?? 5) >= 5
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : (score ?? 5) === 4
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  : (score ?? 5) === 3
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              )}
                            >
                              {(score ?? 5) >= 5
                                ? "Excellent"
                                : (score ?? 5) === 4
                                ? "High / Good"
                                : (score ?? 5) === 3
                                ? "Acceptable"
                                : "Needs Guidance"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 2: Psychomotor Domain Table ────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-indigo-500" />
                  <span>Psychomotor Domain Appraisal (Practical & Physical Skills)</span>
                </h4>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Observational Rubric (1-5 Scale)
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Psychomotor Skill</th>
                      <th className="py-2.5 px-4 hidden sm:table-cell">Description</th>
                      <th className="py-2.5 px-3 text-center w-24">Rating (1-5)</th>
                      <th className="py-2.5 px-4 text-center w-40">Proficiency Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {PSYCHOMOTOR_SKILLS.map((item, idx) => {
                      const score = (serverEvaluation as any)?.[item.key] ?? fallbackBehavior?.[item.key] ?? null;
                      return (
                        <tr
                          key={item.key}
                          className={cn(
                            "transition-colors",
                            idx % 2 === 1 ? "bg-slate-50/50 dark:bg-zinc-900/30" : "bg-white dark:bg-zinc-950",
                            "hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
                          )}
                        >
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-zinc-100">
                            {item.label}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 hidden sm:table-cell text-[11px]">
                            {item.desc}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {score != null ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-indigo-200 dark:border-indigo-800">
                                {score}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">5</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={cn(
                                "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                (score ?? 5) >= 5
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                  : (score ?? 5) === 4
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  : (score ?? 5) === 3
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              )}
                            >
                              {(score ?? 5) >= 5
                                ? "Excellent"
                                : (score ?? 5) === 4
                                ? "High / Good"
                                : (score ?? 5) === 3
                                ? "Acceptable"
                                : "Needs Guidance"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 3: Rating Key Rubric ───────────────────────────────── */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs">
              <p className="font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[10px] mb-2">
                Behavioral Evaluation Rubric Key:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                    5
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Excellent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">High / Good</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Acceptable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Minimal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">Needs Attention</span>
                </div>
              </div>
            </div>

            {/* ── CGPA Banner (Matching Uploaded Progress Report) ──────────────── */}
            <div className="pt-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                CGPA: {transcriptStats.cgpa} ({transcriptStats.cgpaGrade})
              </h3>
            </div>

            {/* ── Section 4: Executive Remarks & Appraisal ──────────────────── */}
            <div className="space-y-4 pt-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
                <Quote size={16} className="text-blue-600" />
                <span>Remarks:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Teacher's Remark */}
                <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <User size={13} className="text-blue-600" />
                      Class Teacher's Remark
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Official Attestation</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800 min-h-[72px] flex items-center">
                    <p className="text-xs italic text-slate-800 dark:text-zinc-200 font-serif leading-relaxed">
                      "{serverEvaluation?.teacherRemark?.trim() ||
                        fallbackBehavior?.teacherRemark?.trim() ||
                        "Consistently displays commendable discipline, attentiveness in class, and positive interaction with classmates. Keep up the high standard!"}"
                    </p>
                  </div>
                </div>

                {/* Principal's Executive Remark */}
                <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <Award size={13} className="text-blue-600" />
                      Principal's Executive Conduct Remark
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Head of Institution</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-950/50 min-h-[72px] flex items-center">
                    <p className="text-xs italic text-slate-800 dark:text-zinc-200 font-serif leading-relaxed">
                      "{serverEvaluation?.principalRemark?.trim() ||
                        fallbackBehavior?.principalRemark?.trim() ||
                        "An exemplary scholar with admirable academic focus and leadership qualities. Certified for continuous advancement in good standing."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Endorsements on Page 2 */}
            {renderEndorsementSignatures()}
          </div>
        </div>

        {/* ── Right Column: Access, Download & Payment Audit Sidebar ───────── */}
        {isSidebarOpen && (
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5 print:hidden">
            {/* Sidebar Master Card */}
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Access & Payment Audit
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                      Download Telemetry & Fees
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchAudit()}
                  className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Refresh Audit Data"
                >
                  <RefreshCw size={13} className={cn(isAuditLoading ? "animate-spin" : "")} />
                </Button>
              </div>

              {/* 1. Download Activity & Frequency Metric */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Download size={13} className="text-blue-600" />
                    Download Frequency
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                    Live Count
                  </span>
                </div>

                {/* Total Counter Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/60 dark:border-blue-900/30 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                      Total Result Downloads
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                      {auditData?.downloadStats?.totalDownloads ?? 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Download size={20} />
                  </div>
                </div>

                {/* Breakdown: Student vs Parent */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <User size={12} />
                      Student
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {auditData?.downloadStats?.studentDownloads ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Times downloaded</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <Users size={12} />
                      Parents
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      {auditData?.downloadStats?.parentDownloads ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Times downloaded</p>
                  </div>
                </div>

                {auditData?.downloadStats?.lastDownloadedAt && (
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-1">
                    <Clock size={12} />
                    <span>Last accessed: {format(new Date(auditData.downloadStats.lastDownloadedAt), "MMM d, yyyy • h:mm a")}</span>
                  </p>
                )}

                {/* Simulate / Test tracking button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateDownload}
                  disabled={recordDownloadMutation.isPending}
                  className="w-full h-8 rounded-xl text-[11px] font-bold border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-600"
                >
                  <PlusCircle size={12} className="mr-1" />
                  <span>Log Manual Download Test</span>
                </Button>
              </div>

              {/* 2. Payment & Result Clearance Status */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Wallet size={13} className="text-blue-600" />
                    Payment & Clearance
                  </span>
                  {auditData?.paymentStats?.hasPaid ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={11} />
                      Cleared & Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                      <AlertCircle size={11} />
                      Unpaid / Pending
                    </span>
                  )}
                </div>

                {/* Amount Display */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                      Total Result Fee Paid:
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">NGN (₦)</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      ₦{(auditData?.paymentStats?.totalPaid ?? 0).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {auditData?.paymentStats?.totalOutstanding ? (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      Outstanding balance: ₦{auditData.paymentStats.totalOutstanding.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCheck size={12} />
                      Full academic clearance verified
                    </p>
                  )}
                </div>

                {/* Payment Transactions Ledger */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Payment Transactions ({auditData?.paymentStats?.payments?.length || 0})
                  </p>
                  {(!auditData?.paymentStats?.payments || auditData.paymentStats.payments.length === 0) ? (
                    <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 text-center text-slate-400 text-[11px]">
                      No digital payment receipts logged yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {auditData.paymentStats.payments.map((pmt) => (
                        <div
                          key={pmt.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-900 dark:text-white">
                              ₦{pmt.amount.toLocaleString()}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                pmt.status === "SUCCESS" || pmt.status === "PAID"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              )}
                            >
                              {pmt.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>{pmt.paymentType || "Result Checker"}</span>
                            <span>{pmt.paidAt ? format(new Date(pmt.paidAt), "MMM d, yyyy") : "Pending"}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            Paid by: <span className="font-semibold text-slate-700 dark:text-zinc-300">{pmt.paidBy}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Linked Parents & Guardians */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Users size={13} className="text-blue-600" />
                    Connected Parents / Sponsors
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {auditData?.linkedParents?.length || 0} Linked
                  </span>
                </div>

                {(!auditData?.linkedParents || auditData.linkedParents.length === 0) ? (
                  <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 text-center text-slate-400 text-[11px]">
                    No parent accounts currently linked to this student code.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditData.linkedParents.map((parent) => (
                      <div
                        key={parent.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {parent.fullName}
                          </p>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Active
                          </span>
                        </div>
                        <div className="space-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                          {parent.email && (
                            <p className="flex items-center gap-1.5 truncate">
                              <Mail size={11} className="shrink-0 text-slate-400" />
                              <span className="truncate">{parent.email}</span>
                            </p>
                          )}
                          {parent.phone && (
                            <div className="flex items-center justify-between pt-0.5">
                              <span className="flex items-center gap-1.5">
                                <Phone size={11} className="shrink-0 text-slate-400" />
                                <span>{parent.phone}</span>
                              </span>
                              <a
                                href={`https://wa.me/${parent.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                              >
                                <span>WhatsApp</span>
                                <ArrowUpRight size={10} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── Dialog Modal: Record / Edit Behavioral Evaluation & Remarks ─────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 size={18} className="text-blue-600" />
              <span>Record / Edit Student Behavioral Evaluation</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Update affective conduct scores, psychomotor skills, and executive remarks for{" "}
              <span className="font-bold text-slate-800 dark:text-zinc-200">{studentProfile?.name}</span> (
              {getTermLabel(evalTerm)}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4 text-xs">
            {/* Affective Domain Inputs */}
            <div className="space-y-3">
              <h5 className="font-black uppercase tracking-wider text-slate-900 dark:text-white text-[11px] flex items-center gap-1.5">
                <Heart size={14} className="text-rose-500" />
                Affective Domain (Scores 1 to 5)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AFFECTIVE_TRAITS.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800"
                  >
                    <span className="font-medium text-slate-800 dark:text-zinc-200 pr-2">
                      {item.label}
                    </span>
                    <select
                      value={editFormData[item.key] ?? 5}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          [item.key]: parseInt(e.target.value, 10),
                        }))
                      }
                      className="h-8 px-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-xs"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - High / Good</option>
                      <option value={3}>3 - Acceptable</option>
                      <option value={2}>2 - Minimal</option>
                      <option value={1}>1 - Needs Guidance</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychomotor Domain Inputs */}
            <div className="space-y-3">
              <h5 className="font-black uppercase tracking-wider text-slate-900 dark:text-white text-[11px] flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-500" />
                Psychomotor Domain (Scores 1 to 5)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PSYCHOMOTOR_SKILLS.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800"
                  >
                    <span className="font-medium text-slate-800 dark:text-zinc-200 pr-2">
                      {item.label}
                    </span>
                    <select
                      value={editFormData[item.key] ?? 5}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          [item.key]: parseInt(e.target.value, 10),
                        }))
                      }
                      className="h-8 px-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold text-xs"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - High / Good</option>
                      <option value={3}>3 - Acceptable</option>
                      <option value={2}>2 - Minimal</option>
                      <option value={1}>1 - Needs Guidance</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-zinc-200">
                  Class Teacher's Remark
                </label>
                <textarea
                  rows={3}
                  value={editFormData.teacherRemark || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, teacherRemark: e.target.value }))
                  }
                  placeholder="e.g. An attentive and hardworking student with commendable enthusiasm."
                  className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-zinc-200">
                  Principal's Executive Conduct Remark
                </label>
                <textarea
                  rows={3}
                  value={editFormData.principalRemark || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, principalRemark: e.target.value }))
                  }
                  placeholder="e.g. Excellent conduct and remarkable scholastic capability. Promoted in good standing."
                  className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEvaluationModal}
              disabled={upsertEvaluationMutation.isPending}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
            >
              {upsertEvaluationMutation.isPending ? "Saving..." : "Save Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Official Endorsement Signature Capture Modal ───────────────── */}
      <SignatureModal
        isOpen={!!signatureModalTarget}
        onClose={() => setSignatureModalTarget(null)}
        userId={
          signatureModalTarget === "registrar"
            ? registrarSlot.adminId || "registrar"
            : principalSlot.adminId || currentAdminUserId
        }
        userName={
          signatureModalTarget === "registrar"
            ? registrarSlot.adminName || "Registrar"
            : principalSlot.adminName || "Authorized Administrator"
        }
        userRole={
          signatureModalTarget === "registrar"
            ? registrarSlot.roleTitle
            : principalSlot.roleTitle
        }
        onSaveSuccess={(sigRecord) => {
          if (signatureModalTarget === "registrar") {
            setCustomRegistrarSig(sigRecord);
            setRegistrarImgError(false);
          } else {
            setCustomHeadSig(sigRecord);
            setHeadImgError(false);
          }
          queryClient.invalidateQueries({ queryKey: ["activeSignature"] });
          queryClient.invalidateQueries({ queryKey: ["signaturesByUserIds"] });
          toast.success("Official digital signature applied to transcript!");
        }}
      />
    </div>
  );
}
