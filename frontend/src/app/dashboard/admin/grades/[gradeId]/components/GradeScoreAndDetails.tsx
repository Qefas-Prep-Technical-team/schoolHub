"use client";

import React from 'react';
import {
  FileText,
  BookOpen,
  Tag,
  Star,
  School,
  Calendar,
  Layers,
  User,
  Clock,
  Quote,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface GradeScoreAndDetailsProps {
  grade: any;
  assessmentLabel: string;
  isPublished: boolean;
  score: number;
  maxMarks: number;
  percent: number;
  isPassed: boolean;
  letterGrade: {
    letter: string;
    label: string;
    color: string;
  };
  primaryColor: string;
}

export function GradeScoreAndDetails({
  grade,
  assessmentLabel,
  isPublished,
  score,
  maxMarks,
  percent,
  isPassed,
  letterGrade,
  primaryColor,
}: GradeScoreAndDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Score Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: letterGrade.color }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {assessmentLabel}
              </span>
              <span className={cn(
                "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1",
                isPublished 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
              )}>
                <span className={cn("size-1.5 rounded-full", isPublished ? "bg-emerald-500" : "bg-amber-400")} />
                {isPublished ? "Published" : "Draft Status"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {grade.subject}
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {grade.class?.name ? `Class: ${grade.class.name}${grade.class.section ? `-${grade.class.section}` : ""}` : "General Assessment"}
            </p>
          </div>

          {/* Big Letter Grade Chip */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div 
              className="size-16 sm:size-20 rounded-2xl flex flex-col items-center justify-center font-black shadow-md border"
              style={{ 
                backgroundColor: `${letterGrade.color}15`, 
                borderColor: `${letterGrade.color}40`,
                color: letterGrade.color 
              }}
            >
              <span className="text-2xl sm:text-3xl leading-none">{letterGrade.letter}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold mt-0.5">{letterGrade.label}</span>
            </div>
          </div>
        </div>

        {/* Score Metric & Progress Bar */}
        <div className="pt-6 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                Recorded Score
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {score}
                </span>
                <span className="text-lg font-bold text-slate-400">
                  / {maxMarks}
                </span>
                <span className="ml-3 text-sm font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: `${letterGrade.color}20`, color: letterGrade.color }}>
                  {percent}%
                </span>
              </div>
            </div>

            <div className={cn(
              "px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold",
              isPassed 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            )}>
              {isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              <span>{isPassed ? "Passed Requirements" : "Below Passing Mark"}</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, Math.max(0, percent))}%`,
                  backgroundColor: letterGrade.color 
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <span>0 Min</span>
              <span>Pass: 50%</span>
              <span>{maxMarks} Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Details Grid Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <FileText size={18} style={{ color: primaryColor }} />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Academic & Grading Metadata
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailTile 
            icon={BookOpen} 
            label="Subject" 
            value={grade.subject || "Not Specified"} 
            color={primaryColor}
          />
          <DetailTile 
            icon={Tag} 
            label="Assessment Type" 
            value={assessmentLabel} 
            color={primaryColor}
          />
          <DetailTile 
            icon={Star} 
            label="Weight Multiplier" 
            value={grade.weight ? `${grade.weight}x` : "1.0x"} 
            color={primaryColor}
          />
          <DetailTile 
            icon={School} 
            label="Class Cohort" 
            value={grade.class?.name ? `${grade.class.name}${grade.class.section ? ` (${grade.class.section})` : ""}` : "Not Assigned"} 
            color={primaryColor}
          />
          <DetailTile 
            icon={Calendar} 
            label="Term" 
            value={grade.term || grade.exam?.term || "Current Term"} 
            color={primaryColor}
          />
          <DetailTile 
            icon={Layers} 
            label="Session" 
            value={grade.session?.name || grade.exam?.session?.name || "Current Session"} 
            color={primaryColor}
          />
          {grade.exam?.title && (
            <DetailTile 
              icon={FileText} 
              label="Linked Exam" 
              value={grade.exam.title} 
              color={primaryColor}
            />
          )}
          {grade.subjectPaper?.title && (
            <DetailTile 
              icon={Layers} 
              label="Subject Paper" 
              value={grade.subjectPaper.title} 
              color={primaryColor}
            />
          )}
          <DetailTile 
            icon={User} 
            label="Recorded By" 
            value={grade.teacher?.name || "School Administrator"} 
            color={primaryColor}
          />
          <DetailTile 
            icon={Clock} 
            label="Date Logged" 
            value={grade.createdAt ? format(new Date(grade.createdAt), "MMM d, yyyy · h:mm a") : "—"} 
            color={primaryColor}
          />
        </div>
      </div>

      {/* Teacher Remarks Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Quote size={18} style={{ color: primaryColor }} />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Teacher Remarks & Feedback
          </h3>
        </div>

        {grade.remarks ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 relative">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic">
              "{grade.remarks}"
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
              — Logged by {grade.teacher?.name || "Instructor"}
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs font-semibold">
            No teacher remarks or narrative comments were added for this assessment.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailTile({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string; 
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
      <div 
        className="size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

