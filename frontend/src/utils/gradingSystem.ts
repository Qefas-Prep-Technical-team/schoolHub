/**
 * Institutional Standardized Grading System Utility
 * 
 * Provides grading threshold evaluation against either:
 * 1. The custom grading system configured by the school administrator in the School Profile
 * 2. The default 9-grade standardized academic matrix:
 *    - A+  (90% - 100%) : EXCELLENT
 *    - A   (70% - 89%)  : VERY GOOD
 *    - B+  (65% - 69%)  : GOOD
 *    - B   (60% - 64%)  : CREDIT
 *    - C+  (55% - 59%)  : CREDIT
 *    - C   (50% - 54%)  : PASS
 *    - D   (40% - 49%)  : FAIR
 *    - F   (30% - 39%)  : WEAK
 *    - F9  (0%  - 30%)  : FAIL
 */

export interface GradingTier {
  grade: string;
  min: number;
  max: number;
  remark?: string;
  color?: string;
  bg?: string;
}

export const DEFAULT_GRADING_SYSTEM: GradingTier[] = [
  {
    grade: 'A+',
    min: 90,
    max: 100,
    remark: 'EXCELLENT',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30',
  },
  {
    grade: 'A',
    min: 70,
    max: 89,
    remark: 'VERY GOOD',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
  {
    grade: 'B+',
    min: 65,
    max: 69,
    remark: 'GOOD',
    color: 'text-teal-700 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-500/20 border-teal-200 dark:border-teal-500/30',
  },
  {
    grade: 'B',
    min: 60,
    max: 64,
    remark: 'CREDIT',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30',
  },
  {
    grade: 'C+',
    min: 55,
    max: 59,
    remark: 'CREDIT',
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30',
  },
  {
    grade: 'C',
    min: 50,
    max: 54,
    remark: 'PASS',
    color: 'text-cyan-700 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/30',
  },
  {
    grade: 'D',
    min: 40,
    max: 49,
    remark: 'FAIR',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30',
  },
  {
    grade: 'F',
    min: 30,
    max: 39,
    remark: 'WEAK',
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-500/20 border-orange-200 dark:border-orange-500/30',
  },
  {
    grade: 'F9',
    min: 0,
    max: 30,
    remark: 'FAIL',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30',
  },
];

/**
 * Returns color classes and styling tokens for any grade label.
 */
export function getGradeColorAndBg(grade: string): { color: string; bg: string } {
  const g = grade.toUpperCase().trim();
  if (g.includes('A+') || g === 'A1') {
    return {
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30',
    };
  }
  if (g.startsWith('A')) {
    return {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    };
  }
  if (g.includes('B+')) {
    return {
      color: 'text-teal-700 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-500/20 border-teal-200 dark:border-teal-500/30',
    };
  }
  if (g.startsWith('B')) {
    return {
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30',
    };
  }
  if (g.includes('C+')) {
    return {
      color: 'text-indigo-700 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/30',
    };
  }
  if (g.startsWith('C')) {
    return {
      color: 'text-cyan-700 dark:text-cyan-400',
      bg: 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/30',
    };
  }
  if (g.startsWith('D')) {
    return {
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30',
    };
  }
  if (g === 'F' || g.startsWith('E')) {
    return {
      color: 'text-orange-700 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-500/20 border-orange-200 dark:border-orange-500/30',
    };
  }
  return {
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30',
  };
}

/**
 * Returns a human-friendly academic remark for a grade.
 */
export function getGradeDefaultRemark(grade: string, percentage: number): string {
  const g = grade.toUpperCase().trim();
  if (g.includes('A+')) return 'EXCELLENT';
  if (g.startsWith('A')) return 'VERY GOOD';
  if (g.includes('B+')) return 'GOOD';
  if (g.startsWith('B')) return 'CREDIT';
  if (g.includes('C+')) return 'CREDIT';
  if (g.startsWith('C')) return 'PASS';
  if (g.startsWith('D')) return 'FAIR';
  if (g === 'F') return 'WEAK';
  if (g.includes('F9') || g.startsWith('F')) return 'FAIL';

  if (percentage >= 70) return 'EXCELLENT';
  if (percentage >= 60) return 'GOOD';
  if (percentage >= 50) return 'CREDIT';
  if (percentage >= 40) return 'PASS';
  return 'FAIL';
}

/**
 * Normalizes and sorts grading tiers from highest threshold to lowest.
 */
export function getEffectiveGradingSystem(customGradingSystem?: any[] | null): GradingTier[] {
  if (Array.isArray(customGradingSystem) && customGradingSystem.length > 0) {
    const valid = customGradingSystem
      .filter((t: any) => t && (t.grade !== undefined || t.min !== undefined || t.max !== undefined))
      .map((t: any) => {
        const grade = String(t.grade || '').trim().toUpperCase();
        const val1 = Number(t.min ?? 0);
        const val2 = Number(t.max ?? 0);
        // Safely extract minimum and maximum regardless of order entered
        const min = Math.min(val1, val2);
        const max = Math.max(val1, val2);
        const styling = getGradeColorAndBg(grade);
        return {
          grade,
          min,
          max,
          remark: t.remark || getGradeDefaultRemark(grade, min),
          color: t.color || styling.color,
          bg: t.bg || styling.bg,
        };
      });

    if (valid.length > 0) {
      // Sort descending by min (highest minimum percentage first, e.g. 90, 70, 65, 60...)
      return valid.sort((a, b) => b.min - a.min);
    }
  }

  return DEFAULT_GRADING_SYSTEM;
}

/**
 * Evaluates a score percentage against the school's configured grading system
 * or the default 9-grade system.
 */
export function getGradeEvaluation(
  percentage: number,
  customGradingSystem?: any[] | null
): {
  grade: string;
  remark: string;
  color: string;
  bg: string;
  min: number;
  max: number;
} {
  const safePercent = isNaN(percentage) ? 0 : Math.round(percentage);
  const tiers = getEffectiveGradingSystem(customGradingSystem);

  // Find the highest threshold whose min is <= percentage
  // Since tiers are sorted descending by min, the first match is the exact tier
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    // If it's the lowest tier (usually min = 0), or percentage is >= tier.min
    if (safePercent >= tier.min) {
      const styling = getGradeColorAndBg(tier.grade);
      return {
        grade: tier.grade,
        remark: tier.remark || getGradeDefaultRemark(tier.grade, safePercent),
        color: tier.color || styling.color,
        bg: tier.bg || styling.bg,
        min: tier.min,
        max: tier.max,
      };
    }
  }

  // Fallback to the lowest tier
  const lowest = tiers[tiers.length - 1] || DEFAULT_GRADING_SYSTEM[DEFAULT_GRADING_SYSTEM.length - 1];
  const styling = getGradeColorAndBg(lowest.grade);
  return {
    grade: lowest.grade,
    remark: lowest.remark || 'FAIL',
    color: lowest.color || styling.color,
    bg: lowest.bg || styling.bg,
    min: lowest.min,
    max: lowest.max,
  };
}

/**
 * Convenience helper for UI badges and pills
 */
export function computeGradePill(
  percentage: number,
  customGradingSystem?: any[] | null
): {
  label: string;
  remark: string;
  bg: string;
  color: string;
} {
  const result = getGradeEvaluation(percentage, customGradingSystem);
  return {
    label: result.grade,
    remark: result.remark,
    bg: `${result.bg} ${result.color}`,
    color: result.color,
  };
}
