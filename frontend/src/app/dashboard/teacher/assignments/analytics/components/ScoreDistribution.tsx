'use client';

import { DistributionData } from "./types";
import { getEffectiveGradingSystem, computeGradePill, type GradingTier } from "@/utils/gradingSystem";

interface ScoreDistributionProps {
  data: DistributionData[];
  gradingSystem?: GradingTier[] | null;
}

export default function ScoreDistribution({ data, gradingSystem }: ScoreDistributionProps) {
  const effectiveScale = getEffectiveGradingSystem(gradingSystem);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-[#19202b] lg:col-span-2">
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-medium text-gray-900 dark:text-white">
            Score Distribution
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            {effectiveScale.length}-Tier School Scale
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {data.reduce((sum, item) => sum + item.count, 0)} students graded
        </p>
      </div>

      <div className="grid h-64 grid-flow-col auto-cols-fr gap-3 items-end justify-items-center px-2">
        {data.map((item, index) => {
          const midScore = typeof item.averageScore === 'number' ? item.averageScore : 75;
          const pill = computeGradePill(midScore, gradingSystem);
          const isHighlighted = midScore >= 70;

          return (
            <div key={index} className="flex flex-col items-center gap-1.5 w-full">
              {item.grade && (
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${pill.bg} ${pill.color}`}
                  title={item.remark || pill.remark}
                >
                  {item.grade}
                </span>
              )}
              <div
                className={`w-full rounded transition-all ${isHighlighted
                    ? 'bg-primary'
                    : 'bg-primary/30 dark:bg-primary/40'
                  }`}
                style={{ height: `${Math.max(8, item.percentage)}%` }}
              />
              <p className="text-gray-500 dark:text-gray-400 text-[11px] font-medium whitespace-nowrap">
                {item.range}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {item.count} {item.count === 1 ? 'student' : 'students'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
