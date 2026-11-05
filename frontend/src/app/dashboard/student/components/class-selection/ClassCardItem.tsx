"use client";

import React from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  TrendingUp,
  Lock,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClassItem, StudentClassStatus, AVATAR_COLORS } from "./types";

interface ClassCardItemProps {
  cls: ClassItem;
  studentClassStatus: StudentClassStatus;
  isPending: boolean;
  isLocked: boolean;
  lockReason?: string | null;
  isCurrentMutating: boolean;
  currentStudentId?: string;
  currentStudentCode?: string;
  onJoinClick: (cls: ClassItem) => void;
  onLockedClick: (cls: ClassItem, reason?: string | null) => void;
}

export function ClassCardItem({
  cls,
  studentClassStatus,
  isPending,
  isLocked,
  lockReason,
  isCurrentMutating,
  currentStudentId,
  currentStudentCode,
  onJoinClick,
  onLockedClick,
}: ClassCardItemProps) {
  const enrollments = cls.enrollments || [];
  const studentCount = enrollments.length;
  const subjectsCount = cls.subjects?.length || 0;
  const teacher = cls.teachers?.[0]?.teacher;

  const isEnrolled = studentClassStatus === "ENROLLED";
  const isExpelled = studentClassStatus === "EXPELLED";
  const isGraduated = studentClassStatus === "GRADUATED";
  const isPromoted = studentClassStatus === "PROMOTED";
  const isTransferred = studentClassStatus === "TRANSFERRED";
  const isNone = studentClassStatus === "NONE";

  // Sort enrollments so current student's avatar is displayed first
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    const aIsMe =
      Boolean(currentStudentId && a.student?.id === currentStudentId) ||
      Boolean(currentStudentCode && a.student?.studentCode === currentStudentCode);
    const bIsMe =
      Boolean(currentStudentId && b.student?.id === currentStudentId) ||
      Boolean(currentStudentCode && b.student?.studentCode === currentStudentCode);
    if (aIsMe && !bIsMe) return -1;
    if (!aIsMe && bIsMe) return 1;
    return 0;
  });

  return (
    <div
      className={cn(
        "group border rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between transition-all duration-200 relative overflow-hidden w-full min-w-0 max-w-full min-h-[290px] sm:min-h-[310px]",
        isEnrolled &&
        "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800/70 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm",
        isExpelled &&
        "bg-rose-50/25 dark:bg-rose-950/15 border-rose-300 dark:border-rose-800/70 hover:border-rose-400 dark:hover:border-rose-700 shadow-sm",
        isGraduated &&
        "bg-purple-50/25 dark:bg-purple-950/15 border-purple-300 dark:border-purple-800/70 hover:border-purple-400 dark:hover:border-purple-700 shadow-sm",
        isPromoted &&
        "bg-indigo-50/25 dark:bg-indigo-950/15 border-indigo-300 dark:border-indigo-800/70 hover:border-indigo-400 dark:hover:border-indigo-700 shadow-sm",
        isTransferred &&
        "bg-amber-50/25 dark:bg-amber-950/15 border-amber-300 dark:border-amber-800/70 hover:border-amber-400 dark:hover:border-amber-700 shadow-sm",
        isNone &&
        (isLocked
          ? "bg-slate-50/60 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 opacity-90"
          : "bg-white dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 hover:border-pink-300 dark:hover:border-pink-800/60 hover:shadow-lg hover:shadow-pink-500/5")
      )}
    >
      <div className="space-y-2.5 sm:space-y-3">
        {/* Class Header & Badges */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span
              className={cn(
                "inline-block px-2 py-0.5 rounded-md font-mono text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-1",
                isEnrolled && "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
                isExpelled && "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
                isGraduated && "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300",
                isPromoted && "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300",
                isTransferred && "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
                isNone && (isLocked ? "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400" : "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300")
              )}
            >
              {cls.classCode}
            </span>
            <h4
              className={cn(
                "text-sm sm:text-lg font-black line-clamp-1 transition-colors truncate",
                isEnrolled && "text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400",
                isExpelled && "text-slate-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400",
                isGraduated && "text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400",
                isPromoted && "text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400",
                isTransferred && "text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400",
                isNone && "text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400"
              )}
            >
              {cls.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end max-w-[48%] sm:max-w-none">
            {cls.level && (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
                {cls.level}
              </span>
            )}
            {isLocked && (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Lock size={10} className="text-amber-600 dark:text-amber-400" />
                Locked
              </span>
            )}
            {isEnrolled && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                <CheckCircle2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                Enrolled
              </span>
            )}
            {isGraduated && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                <GraduationCap size={11} className="text-purple-600 dark:text-purple-400" />
                Graduated
              </span>
            )}
            {isPromoted && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                <TrendingUp size={11} className="text-indigo-600 dark:text-indigo-400" />
                Promoted
              </span>
            )}
            {isTransferred && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                <ArrowRightLeft size={11} className="text-amber-600 dark:text-amber-400" />
                Transferred
              </span>
            )}
            {isExpelled && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                <XCircle size={11} className="text-rose-600 dark:text-rose-400" />
                Expelled
              </span>
            )}
          </div>
        </div>

        {/* Meta strip: Teacher & Subjects */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 pt-0.5 sm:pt-1">
          <span className="inline-flex items-center gap-1 font-medium">
            <BookOpen size={12} className="text-slate-400" />
            {subjectsCount} {subjectsCount === 1 ? "Subject" : "Subjects"}
          </span>
          {teacher && (
            <span className="inline-flex items-center gap-1 font-medium truncate">
              <GraduationCap size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">{teacher.name}</span>
            </span>
          )}
        </div>

        {/* Enrolled Students Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5 sm:mb-2">
            <span
              className={cn(
                "font-bold inline-flex items-center gap-1 sm:gap-1.5",
                isEnrolled && "text-emerald-800 dark:text-emerald-300",
                isExpelled && "text-rose-800 dark:text-rose-300",
                isGraduated && "text-purple-800 dark:text-purple-300",
                isTransferred && "text-amber-800 dark:text-amber-300",
                isNone && "text-slate-700 dark:text-zinc-300"
              )}
            >
              <Users
                size={12}
                className={
                  isEnrolled
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isExpelled
                      ? "text-rose-600 dark:text-rose-400"
                      : isGraduated
                        ? "text-purple-600 dark:text-purple-400"
                        : isTransferred
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-pink-600 dark:text-pink-400"
                }
              />
              Students in Class
            </span>
            <span className="font-bold text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
              {studentCount} {studentCount === 1 ? "student" : "students"}
            </span>
          </div>

          {/* Student Avatars & Names preview */}
          {studentCount > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center -space-x-1.5 sm:-space-x-2 overflow-hidden py-0.5 sm:py-1">
                {sortedEnrollments.slice(0, 5).map((e, idx) => {
                  const st = e.student;
                  const isMe =
                    Boolean(currentStudentId && st?.id === currentStudentId) ||
                    Boolean(currentStudentCode && st?.studentCode === currentStudentCode);
                  const initial = isMe ? "YOU" : st?.name?.charAt(0).toUpperCase() || "S";
                  let colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  if (isMe) {
                    if (isExpelled) {
                      colorClass = "bg-rose-600 text-white ring-2 ring-rose-400";
                    } else if (isGraduated) {
                      colorClass = "bg-purple-600 text-white ring-2 ring-purple-400";
                    } else if (isTransferred) {
                      colorClass = "bg-amber-600 text-white ring-2 ring-amber-400";
                    } else {
                      colorClass = "bg-emerald-600 text-white ring-2 ring-emerald-400";
                    }
                  }
                  return (
                    <div
                      key={st?.id || idx}
                      title={isMe ? `${st?.name || "Student"} (You)` : st?.name || "Student"}
                      className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold ring-2 shrink-0 shadow-sm transition-transform",
                        isMe ? "text-[7px] sm:text-[8px] z-10 scale-105" : "text-[9px] sm:text-[10px] ring-white dark:ring-zinc-900",
                        colorClass
                      )}
                    >
                      {initial}
                    </div>
                  );
                })}
                {studentCount > 5 && (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center text-[9px] sm:text-[10px] font-bold ring-2 ring-white dark:ring-zinc-900 shrink-0">
                    +{studentCount - 5}
                  </div>
                )}
              </div>
              {isEnrolled && (
                <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold line-clamp-1 flex items-center gap-1">
                  <CheckCircle2 size={11} className="shrink-0" />
                  <span>
                    You are enrolled in this class
                    {studentCount > 1
                      ? ` with ${studentCount - 1} other ${studentCount - 1 === 1 ? "student" : "students"}`
                      : ""}
                  </span>
                </p>
              )}
              {isGraduated && (
                <p className="text-[10px] sm:text-[11px] text-purple-600 dark:text-purple-400 font-semibold line-clamp-1 flex items-center gap-1">
                  <GraduationCap size={11} className="shrink-0" />
                  <span>You have graduated from this class (Alumni)</span>
                </p>
              )}
              {isPromoted && (
                <p className="text-[10px] sm:text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1 flex items-center gap-1">
                  <TrendingUp size={11} className="shrink-0" />
                  <span>You were promoted from this class</span>
                </p>
              )}
              {isTransferred && (
                <p className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold line-clamp-1 flex items-center gap-1">
                  <ArrowRightLeft size={11} className="shrink-0" />
                  <span>You were transferred out of this class</span>
                </p>
              )}
              {isExpelled && (
                <p className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-semibold line-clamp-1 flex items-center gap-1">
                  <XCircle size={11} className="shrink-0" />
                  <span>You have been expelled from this classroom</span>
                </p>
              )}
              {isNone && (
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 font-medium">
                  {sortedEnrollments
                    .slice(0, 3)
                    .map((e) => e.student?.name)
                    .filter(Boolean)
                    .join(", ")}
                  {studentCount > 3 && `, and ${studentCount - 3} others`}
                </p>
              )}
            </div>
          ) : isEnrolled ? (
            <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold py-1 flex items-center gap-1">
              <CheckCircle2 size={11} className="shrink-0" />
              <span>You are currently enrolled in this class</span>
            </p>
          ) : (
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-zinc-500 italic py-0.5">
              No students enrolled yet. Be the first to join!
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-3 sm:pt-4 mt-2 sm:mt-3 border-t border-slate-100 dark:border-zinc-800/80">
        {isEnrolled ? (
          <div className="w-full h-9 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-1.5 sm:gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] sm:text-xs shadow-xs">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Enrolled (Active Member)</span>
          </div>
        ) : isGraduated ? (
          <div className="w-full h-9 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center gap-1.5 sm:gap-2 text-purple-700 dark:text-purple-300 font-bold text-[11px] sm:text-xs shadow-xs">
            <GraduationCap size={14} className="text-purple-600 dark:text-purple-400" />
            <span>Graduated Cohort (Alumni)</span>
          </div>
        ) : isPromoted ? (
          <div className="w-full h-9 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 sm:gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] sm:text-xs shadow-xs">
            <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span>Promoted (Completed Level)</span>
          </div>
        ) : isTransferred ? (
          <div className="w-full h-9 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-1.5 sm:gap-2 text-amber-700 dark:text-amber-300 font-bold text-[11px] sm:text-xs shadow-xs">
            <ArrowRightLeft size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Transferred Out</span>
          </div>
        ) : isExpelled ? (
          <div className="w-full h-9 sm:h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center gap-1.5 sm:gap-2 text-rose-700 dark:text-rose-300 font-bold text-[11px] sm:text-xs shadow-xs">
            <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
            <span>Expelled from Class</span>
          </div>
        ) : isPending ? (
          <div className="w-full h-9 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[11px] sm:text-xs">
            <Clock size={13} />
            <span>Request Pending Approval</span>
          </div>
        ) : isLocked ? (
          <Button
            type="button"
            onClick={() => onLockedClick(cls, lockReason)}
            className="w-full h-9 sm:h-10 rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 font-bold text-[11px] sm:text-xs border border-slate-200 dark:border-zinc-700 shadow-none flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Lock size={13} className="text-amber-500 shrink-0" />
            <span>Class Locked {lockReason ? `(${lockReason})` : ""}</span>
          </Button>
        ) : (
          <Button
            onClick={() => onJoinClick(cls)}
            disabled={isCurrentMutating}
            className="w-full h-9 sm:h-10 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-pink-600/10 flex items-center justify-center gap-1.5 group-hover:shadow-pink-600/20 transition-all cursor-pointer"
          >
            {isCurrentMutating ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Request...</span>
              </>
            ) : (
              <>
                <span>Request to Join</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

