'use client';

import React from 'react';
import { GraduationCap, Info } from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_GRADING_SYSTEM } from '@/utils/gradingSystem';
import { SchoolProfileData, SchoolProfileGradeBoundary } from './SchoolProfileHero';

interface SchoolProfileAcademicColumnProps {
  school?: SchoolProfileData | null;
}

export default function SchoolProfileAcademicColumn({
  school,
}: SchoolProfileAcademicColumnProps) {
  const hasCustom = Boolean(
    school?.gradingSystem && school.gradingSystem.length > 0,
  );
  const activeSystem: SchoolProfileGradeBoundary[] = hasCustom
    ? (school?.gradingSystem as SchoolProfileGradeBoundary[])
    : DEFAULT_GRADING_SYSTEM;

  return (
    <div className="space-y-6">
      {/* Academic Levels */}
      {school?.levels && school.levels.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                Academic Levels
              </h2>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                    >
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl"
                  >
                    Displays the overarching grade frameworks applied across
                    your school (e.g., Junior Secondary, Senior Secondary).
                    These dictate class formations.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge
              variant="secondary"
              className="rounded-xl px-2 py-0.5 text-[10px] font-semibold"
            >
              {school.levels.length} Configured
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Custom academic levels configured for class assignments across this
            institution.
          </p>
          <div className="flex flex-wrap gap-2">
            {school.levels.map((level: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
              >
                <GraduationCap size={14} className="text-slate-400" />
                {level}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Grading System Display */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">
              Grading System Configuration
            </h2>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  >
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl"
                >
                  Defines the standardized assessment thresholds applied to
                  student scores institution-wide. It ensures consistent
                  evaluation matrices.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-xl px-2 py-0.5 text-[10px] font-semibold"
            >
              {activeSystem.length} Grades
            </Badge>
            {!hasCustom && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                Default
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Standardized academic grade boundaries applied across assessments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeSystem.map((sys: SchoolProfileGradeBoundary, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30"
            >
              <span className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                {sys.grade}
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>
                  {Math.min(Number(sys.min ?? 0), Number(sys.max ?? 0))}%
                </span>
                <span className="text-slate-300 dark:text-slate-600">-</span>
                <span>
                  {Math.max(Number(sys.min ?? 0), Number(sys.max ?? 0))}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

