import { GradeThreshold } from '@/lib/api/hooks/useGradeSettingsStore';

export const calculateGrade = (
  score: number | string,
  maxMarks: number | string,
  scale: GradeThreshold[]
): string => {
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  const numMax = typeof maxMarks === 'string' ? parseFloat(maxMarks) : maxMarks;

  if (isNaN(numScore) || isNaN(numMax) || numMax === 0) return '-';

  const percentage = (numScore / numMax) * 100;

  // Find the highest threshold that is less than or equal to the percentage
  const matchingThreshold = scale.find((t) => percentage >= t.minPercentage);

  return matchingThreshold ? matchingThreshold.grade : 'F';
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
