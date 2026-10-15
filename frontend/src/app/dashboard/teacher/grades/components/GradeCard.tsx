'use client';

import React from 'react';
import { GradeStatus, StudentGrade } from "./types";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Send,
  Loader2,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface GradeCardProps {
  grade: StudentGrade;
  onEdit: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
  onDelete: () => void;
  onViewDetails: () => void;
}

const GradeCard: React.FC<GradeCardProps> = ({
  grade,
  onEdit,
  onPublish,
  isPublishing,
  onDelete,
  onViewDetails
}) => {
  const getStatusStyles = (status: GradeStatus) => {
    switch (status) {
      case 'Graded':
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case 'Pending':
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case 'Missing':
        return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
    }
  };

  const initials = grade.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      onClick={onViewDetails}
      className="group cursor-pointer rounded-2xl sm:rounded-3xl border border-emerald-100 dark:border-emerald-800/40 bg-white dark:bg-emerald-950/20 backdrop-blur-md p-4 sm:p-5 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between gap-3.5"
    >
      {/* Top Header: Scholar Avatar & Info + Grade Badge & Actions Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-black shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-emerald-500/20">
            {grade.profilePicture ? (
              <img src={grade.profilePicture} alt={grade.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {grade.name}
            </h4>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {grade.studentCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Big Letter Grade Pill */}
          <div className={cn(
            "inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl text-base sm:text-lg font-black shadow-sm",
            grade.grade.startsWith('A') ? "bg-emerald-500 text-white shadow-emerald-500/20" :
            grade.grade.startsWith('B') ? "bg-blue-500 text-white shadow-blue-500/20" :
            grade.grade.startsWith('C') ? "bg-amber-500 text-white shadow-amber-500/20" :
            "bg-red-500 text-white shadow-red-500/20"
          )}>
            {grade.grade}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:ring-emerald-500 cursor-pointer"
                title="More Actions"
              >
                <MoreVertical size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-52 p-2 shadow-2xl bg-white dark:bg-slate-900 z-50">
              <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit size={14} /> Edit Grade
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                <Eye size={14} /> View Details
              </DropdownMenuItem>
              {grade.status !== 'Graded' && (
                <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer text-emerald-600 dark:text-emerald-400 gap-2" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onPublish(); }} disabled={isPublishing}>
                  {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} 
                  {isPublishing ? 'Publishing...' : 'Publish Now'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer text-rose-600 gap-2" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 size={14} /> Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Middle Row: Subject Paper & Assessment Category */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold truncate max-w-full">
          <BookOpen size={14} className="text-emerald-500 shrink-0" />
          <span className="truncate">{grade.subjectPaper}</span>
        </div>
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          {grade.assessmentType}
        </span>
      </div>

      {/* Performance Row: Score Metric + Percentage + Status Badge */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
            {grade.score}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-400">
            ({grade.totalScore})
          </span>
        </div>

        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border",
          getStatusStyles(grade.status)
        )}>
          <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_8px_rgba(currentColor,0.5)]" />
          {grade.status}
        </div>
      </div>

      {/* Quick Action Touch Buttons for Mobile */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all cursor-pointer active:scale-95"
        >
          <Edit size={14} />
          <span>Edit Grade</span>
        </button>
        <button
          type="button"
          onClick={onViewDetails}
          className="flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all cursor-pointer active:scale-95"
        >
          <Eye size={14} />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default GradeCard;
