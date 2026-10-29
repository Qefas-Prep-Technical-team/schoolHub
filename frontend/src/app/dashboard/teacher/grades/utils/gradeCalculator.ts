import { GradeThreshold } from '@/lib/api/hooks/useGradeSettingsStore';
import { getGradeEvaluation, GradingTier } from '@/utils/gradingSystem';

export const calculateGrade = (
  score: number | string,
  maxMarks: number | string,
  scale?: GradeThreshold[] | GradingTier[] | any[] | null
): string => {
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  const numMax = typeof maxMarks === 'string' ? parseFloat(maxMarks) : maxMarks;

  if (isNaN(numScore) || isNaN(numMax) || numMax === 0) return '-';

  const percentage = (numScore / numMax) * 100;

  // If a custom or connected school scale is provided and contains minPercentage, adapt it
  if (Array.isArray(scale) && scale.length > 0) {
    if ('minPercentage' in scale[0]) {
      const matchingThreshold = (scale as GradeThreshold[]).find((t) => percentage >= t.minPercentage);
      if (matchingThreshold) return matchingThreshold.grade;
    } else {
      // Evaluate using institutional getGradeEvaluation (handles custom school gradingSystem array)
      const evaluation = getGradeEvaluation(percentage, scale);
      if (evaluation?.grade) return evaluation.grade;
    }
  }

  // Fallback to institutional standardized default grading system
  return getGradeEvaluation(percentage).grade;
};

export const getPercentage = (
  score: number | string,
  maxMarks: number | string
): number => {
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  const numMax = typeof maxMarks === 'string' ? parseFloat(maxMarks) : maxMarks;

  if (isNaN(numScore) || isNaN(numMax) || numMax === 0) return 0;

  return (numScore / numMax) * 100;
};
