import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  School,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  MapPin,
  User,
} from "lucide-react";
import {
  SignatureSlotInfo,
  GraduatedSchoolBadge,
} from "../types/transcript.types";

export { TranscriptSignaturesFooter } from "./TranscriptSignaturesFooter";

export function TranscriptNotConnectedGate() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 sm:p-12 text-center shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 shadow-inner">
          <Lock size={36} />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-950">
            <School size={14} />
          </div>
        </div>
        <div className="space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <AlertCircle size={14} />
            School Affiliation Required
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Official Academic Transcript Locked
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
            Academic transcripts are officially certified institutional records.
            Only students actively connected to an accredited school can view,
            generate, and export cumulative academic transcripts.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/dashboard/student/linking" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
              <span>Connect to Your School</span>
              <ArrowRight size={15} />
            </Button>
          </Link>
          <Link href="/dashboard/student" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold text-sm"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function TranscriptLetterhead({
  schoolName,
  schoolMotto,
  schoolLocation,
  schoolLogoUrl,
  onLogoError,
  studentName,
  studentProfileImage,
  pageSubtitle,
}: {
  schoolName: string;
  schoolMotto: string;
  schoolLocation: string;
  schoolLogoUrl: string | null;
  onLogoError: () => void;
  studentName?: string;
  studentProfileImage?: string | null;
  pageSubtitle: string;
}) {
  return (
    <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
            {schoolLogoUrl ? (
              <img
                src={schoolLogoUrl}
                alt={schoolName}
                onError={onLogoError}
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
              &quot;{schoolMotto}&quot;
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin
                  size={12}
                  className="text-slate-400 dark:text-zinc-500 shrink-0"
                />
                <span>{schoolLocation}</span>
              </span>
              <span>•</span>
              <span>{pageSubtitle}</span>
            </div>
          </div>
        </div>
        <div className="self-center sm:self-start shrink-0">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-sm relative flex items-center justify-center">
            {studentProfileImage ? (
              <img
                src={studentProfileImage}
                alt={studentName || "Student Photo"}
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
}

export function TranscriptStudentBanner({
  studentName,
  studentCode,
  departmentOrClass,
  isGraduated,
  refPrefix = "Academic Transcript",
}: {
  studentName?: string;
  studentCode?: string;
  departmentOrClass: string;
  isGraduated: boolean;
  refPrefix?: string;
}) {
  return (
    <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs w-full">
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Scholar Full Name
          </p>
          <p className="text-slate-900 dark:text-white font-black text-sm truncate">
            {studentName || "Scholar Record"}
          </p>
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Student ID / Code
          </p>
          <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm truncate">
            {studentCode || "N/A"}
          </p>
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Department / Cohort
          </p>
          <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
            {departmentOrClass}
          </p>
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Enrollment Status
          </p>
          {isGraduated ? (
            <p className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-1 truncate">
              <GraduationCap size={14} className="shrink-0 text-amber-500" />
              <span>Graduated Alumnus</span>
            </p>
          ) : (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1 truncate">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>Active Enrolled</span>
            </p>
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px] truncate">
            {refPrefix} Ref No.
          </p>
          <p className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
            TRX-{studentCode?.toUpperCase() || "SCH"}-{new Date().getFullYear()}
          </p>
        </div>
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
}

export function TranscriptGraduatedBadges({
  graduatedSchools,
}: {
  graduatedSchools: GraduatedSchoolBadge[];
}) {
  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-blue-500/10 border border-amber-300/70 dark:border-amber-700/60 shadow-xs flex flex-wrap items-center justify-between gap-3.5 transition-all print:border-amber-400 print:bg-white">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
          <Award size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Badge
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <GraduationCap
                size={12}
                className="text-amber-600 dark:text-amber-400"
              />
              Graduated Scholar
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
            Official graduation credential and institutional alumni badge
          </p>
        </div>
      </div>
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
        {graduatedSchools.map((sch) => (
          <div
            key={sch.id}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs"
          >
            <div className="size-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center overflow-hidden shrink-0">
              {sch.logo ? (
                <img
                  src={sch.logo}
                  alt={sch.name}
                  className="size-full object-contain"
                />
              ) : (
                <School
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {sch.name}
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                <span>Graduated Alumnus</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

