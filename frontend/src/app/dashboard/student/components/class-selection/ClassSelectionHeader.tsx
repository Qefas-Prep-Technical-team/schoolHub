"use client";

import React from "react";
import {
  Search,
  School as SchoolIcon,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  ArrowRightLeft,
  XCircle,
  Lock,
} from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ClassSelectionHeaderProps {
  schoolName: string;
  studentName: string;
  isStudentGraduated: boolean;
  classStatusCounts: {
    enrolled: number;
    available: number;
    graduated: number;
    promoted: number;
    expelled: number;
    transferred: number;
    locked: number;
  };
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter:
  | "ALL"
  | "AVAILABLE"
  | "ENROLLED"
  | "GRADUATED"
  | "PROMOTED"
  | "EXPELLED"
  | "TRANSFERRED"
  | "LOCKED";
  setStatusFilter: (
    val:
      | "ALL"
      | "AVAILABLE"
      | "ENROLLED"
      | "GRADUATED"
      | "PROMOTED"
      | "EXPELLED"
      | "TRANSFERRED"
      | "LOCKED"
  ) => void;
  selectedLevel: string;
  setSelectedLevel: (val: string) => void;
  availableLevels: string[];
  totalClassesCount: number;
}

export function ClassSelectionHeader({
  schoolName,
  studentName,
  isStudentGraduated,
  classStatusCounts,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedLevel,
  setSelectedLevel,
  availableLevels,
  totalClassesCount,
}: ClassSelectionHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 p-4 sm:p-7 text-white relative shrink-0 w-full min-w-0 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <DialogHeader className="relative z-10 text-left space-y-1.5 sm:space-y-2 pr-7 sm:pr-0">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5">
            <SchoolIcon size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="max-w-[140px] sm:max-w-none truncate">{schoolName}</span>
          </span>
          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-pink-400/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">
            Welcome, {studentName}
          </span>
          {isStudentGraduated && (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-400/30 border border-amber-300/50 text-amber-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <GraduationCap size={12} className="text-amber-200" />
              Alumnus
            </span>
          )}
          {classStatusCounts.enrolled > 0 && (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-300" />
              {classStatusCounts.enrolled} Enrolled
            </span>
          )}
          {classStatusCounts.graduated > 0 && (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <GraduationCap size={12} className="text-purple-300" />
              {classStatusCounts.graduated} Graduated
            </span>
          )}
          {classStatusCounts.locked > 0 && (
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Lock size={11} className="text-amber-300" />
              {classStatusCounts.locked} Locked
            </span>
          )}
        </div>
        <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white pt-1">
          {isStudentGraduated ? "Alma Mater Classrooms" : "Select Your Classroom"}
        </DialogTitle>
        <DialogDescription className="text-pink-100 text-[11px] sm:text-xs md:text-sm font-medium max-w-xl leading-relaxed">
          {isStudentGraduated
            ? `You have graduated from ${schoolName}. You can view the classes and academic streams from your alma mater below.`
            : "Choose from the classes available at your connected school to request enrollment. Review current students, subjects, and teachers before joining."}
        </DialogDescription>
      </DialogHeader>

      {/* Search & Filter Bar */}
      <div className="mt-4 sm:mt-5 space-y-2.5 w-full min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full min-w-0">
          <div className="relative flex-1 min-w-0 w-full">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-200"
              size={16}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes by name, code, subject, or department..."
              className="h-10 sm:h-11 pl-10 rounded-xl bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-pink-200 text-xs sm:text-sm focus-visible:ring-white/30 w-full"
            />
          </div>
        </div>

        {/* Filter Chips: Enrollment Status & Grade Levels */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full min-w-0 max-w-full no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              statusFilter === "ALL"
                ? "bg-white text-pink-700 shadow-sm"
                : "bg-white/15 text-white hover:bg-white/25"
            )}
          >
            All ({totalClassesCount})
          </button>
          {!isStudentGraduated && classStatusCounts.available > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("AVAILABLE")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                statusFilter === "AVAILABLE"
                  ? "bg-white text-pink-700 shadow-sm"
                  : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              Available to Join ({classStatusCounts.available})
            </button>
          )}
          {classStatusCounts.enrolled > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("ENROLLED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                statusFilter === "ENROLLED"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/40"
              )}
            >
              <CheckCircle2 size={12} />
              Enrolled ({classStatusCounts.enrolled})
            </button>
          )}
          {classStatusCounts.graduated > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("GRADUATED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                statusFilter === "GRADUATED"
                  ? "bg-purple-500 text-white shadow-sm"
                  : "bg-purple-500/25 text-purple-100 hover:bg-purple-500/40"
              )}
            >
              <GraduationCap size={12} />
              Graduated ({classStatusCounts.graduated})
            </button>
          )}
          {classStatusCounts.locked > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("LOCKED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                statusFilter === "LOCKED"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-500/25 text-amber-100 hover:bg-amber-500/40"
              )}
            >
              <Lock size={12} />
              Locked ({classStatusCounts.locked})
            </button>
          )}
          {classStatusCounts.promoted > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("PROMOTED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                statusFilter === "PROMOTED"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-indigo-500/25 text-indigo-100 hover:bg-indigo-500/40"
              )}
            >
              <TrendingUp size={12} />
              Promoted ({classStatusCounts.promoted})
            </button>
          )}
          {classStatusCounts.transferred > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("TRANSFERRED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                statusFilter === "TRANSFERRED"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-500/25 text-amber-100 hover:bg-amber-500/40"
              )}
            >
              <ArrowRightLeft size={12} />
              Transferred ({classStatusCounts.transferred})
            </button>
          )}
          {classStatusCounts.expelled > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("EXPELLED")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer",
                statusFilter === "EXPELLED"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-rose-500/25 text-rose-100 hover:bg-rose-500/40"
              )}
            >
              <XCircle size={12} />
              Expelled ({classStatusCounts.expelled})
            </button>
          )}

          {availableLevels.length > 0 && (
            <>
              <div className="h-4 w-px bg-white/20 mx-1 shrink-0" />
              <button
                type="button"
                onClick={() => setSelectedLevel("ALL")}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  selectedLevel === "ALL"
                    ? "bg-white text-pink-700 shadow-sm"
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                All Levels
              </button>
              {availableLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(selectedLevel === lvl ? "ALL" : lvl)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                    selectedLevel === lvl
                      ? "bg-white text-pink-700 shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

