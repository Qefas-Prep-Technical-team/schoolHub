import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateGrade(
  scores: number[],
  maxScores: number[]
): { grade: string; percentage: number } {
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const totalMaxScore = maxScores.reduce((a, b) => a + b, 0);
  const percentage = (totalScore / totalMaxScore) * 100;

  let grade = 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';

  return { grade, percentage };
}