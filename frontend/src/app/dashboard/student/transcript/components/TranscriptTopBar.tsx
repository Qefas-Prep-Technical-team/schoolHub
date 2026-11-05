import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Printer,
  Lock,
  ShieldCheck,
  CreditCard,
  Filter,
  Unlock,
  RotateCcw,
  SlidersHorizontal,
  GraduationCap,
  Building2,
} from "lucide-react";
import { StudentTranscriptAccessTier } from "../types/transcript.types";

interface TranscriptTopBarProps {
  activePageView: "all" | "page1" | "page2";
  setActivePageView: (view: "all" | "page1" | "page2") => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handlePrint: () => void;
  handleDownloadPDF: () => void;
  isExporting: boolean;
  requiresPayment: boolean;
  isCurrentViewUnlocked: boolean;
  isGraduated: boolean;
  hasDownloadRemaining: boolean;
  effectiveFee: number;
  isFeeLoading?: boolean;
  selectedSessionId: string;
  setSelectedSessionId: (val: string) => void;
  selectedTermFilter: string;
  setSelectedTermFilter: (val: string) => void;
  availableSessions: Array<{ id: string; name: string }>;
  accessTier: StudentTranscriptAccessTier;
  onOpenClearanceModal: () => void;
}

const AVAILABLE_TERMS = [
  { value: "ALL", label: "All Terms" },
  { value: "FIRST", label: "1st Term" },
  { value: "SECOND", label: "2nd Term" },
  { value: "THIRD", label: "3rd Term" },
];

export function TranscriptTopBar({
  activePageView,
  setActivePageView,
  isSidebarOpen,
  setIsSidebarOpen,
  handlePrint,
  handleDownloadPDF,
  isExporting,
  requiresPayment,
  isCurrentViewUnlocked,
  isGraduated,
  hasDownloadRemaining,
  effectiveFee,
  isFeeLoading,
  selectedSessionId,
  setSelectedSessionId,
  selectedTermFilter,
  setSelectedTermFilter,
  availableSessions,
  accessTier,
  onOpenClearanceModal,
}: TranscriptTopBarProps) {
  const isFilterActive =
    selectedSessionId !== "ALL" || selectedTermFilter !== "ALL";

  return (
    <>
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link
              href="/dashboard/student"
              className="hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-zinc-200">
              Official Transcript
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Academic Transcript
            </h1>
            <HeaderTooltip content="Certified cumulative record of all completed academic sessions, term evaluations, continuous assessments, and cumulative grade point averages (CGPA)." />
            {accessTier === "GRADUATED_ALUMNI" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                <GraduationCap size={12} /> Graduated Alumnus
              </span>
            ) : accessTier === "FREE_TIER_SCHOOL" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-700 dark:text-zinc-300 border border-slate-400/30 text-[11px] font-black uppercase tracking-wider">
                <Building2 size={12} /> Free-Tier Institution
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck size={12} /> Institutional Plan Active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActivePageView("page1")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "page1"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900",
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
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900",
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
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900",
              )}
            >
              All Pages
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 shadow-xs"
            title={
              isSidebarOpen ? "Collapse audit sidebar" : "Expand audit sidebar"
            }
          >
            <SlidersHorizontal size={14} />
            <span className="hidden xl:inline">
              {isSidebarOpen ? "Hide Audit" : "Show Audit"}
            </span>
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
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            {isExporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing PDF...</span>
              </>
            ) : requiresPayment && !isCurrentViewUnlocked ? (
              <>
                <Lock size={14} />
                <span>
                  Clearance Required ({isFeeLoading ? "loading..." : `₦${effectiveFee.toLocaleString()}`})
                </span>
              </>
            ) : isGraduated && !hasDownloadRemaining ? (
              <>
                <Lock size={14} />
                <span>Download Limit Reached (1/1 Used)</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Download Transcript (PDF)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interactive Session & Term Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden transition-all">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-200 mr-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Filter size={15} />
            </div>
            <span>Academic Filter:</span>
          </div>

          <Select
            value={selectedSessionId}
            onValueChange={setSelectedSessionId}
          >
            <SelectTrigger className="w-[260px] h-9 px-3 rounded-xl text-xs font-bold bg-slate-50/80 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
              <SelectValue placeholder="Select session scope" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              <SelectItem value="ALL" className="text-xs font-semibold py-2">
                All Sessions (Full Cumulative)
              </SelectItem>
              {availableSessions.map((s) => (
                <SelectItem
                  key={s.id}
                  value={s.id}
                  className="text-xs font-semibold py-2"
                >
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
            {AVAILABLE_TERMS.map((t) => {
              const isSelected = selectedTermFilter === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedTermFilter(t.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-xs",
                    isSelected
                      ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSessionId("ALL");
                setSelectedTermFilter("ALL");
              }}
              className="h-9 px-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {requiresPayment && !isCurrentViewUnlocked ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                <Lock size={12} />
                {accessTier === "FREE_TIER_SCHOOL"
                  ? "Free-Tier Clearance Required"
                  : accessTier === "GRADUATED_ALUMNI"
                    ? "Alumni Clearance Required"
                    : "Access Clearance Required"}
              </span>
              <Button
                onClick={onOpenClearanceModal}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-600/25 gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <CreditCard size={14} />
                <span>{isFeeLoading ? "Loading clearance fee..." : `Pay Clearance (₦${effectiveFee.toLocaleString()})`}</span>
              </Button>
            </div>
          ) : requiresPayment && isCurrentViewUnlocked ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
              <Unlock size={12} />
              Session Clearance Verified
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={12} />
              Active Institutional Access
            </div>
          )}
        </div>
      </div>
    </>
  );
}

