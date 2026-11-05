import prisma, { withRetry } from "../../../config/database";
import { resolveSchoolId } from "./school-access.service";

/**
 * Perform a high-level performance analysis for the entire school
 */
export const getSchoolPerformanceAnalysisService = async (
  schoolId: string,
  _userId: string,
) => {
  const canonicalId = await resolveSchoolId(schoolId);
  if (!canonicalId) return null;

  const [grades, examAttempts] = await Promise.all([
    withRetry(
      () =>
        prisma.grade.findMany({
          where: { schoolId: canonicalId },
          select: {
            score: true,
            maxMarks: true,
            subject: true,
          },
        }),
      "school.getSchoolPerformanceAnalysisService.grades",
    ),
    withRetry(
      () =>
        prisma.examAttempt.findMany({
          where: {
            exam: { schoolId: canonicalId },
            status: "SCORED",
          },
          select: {
            totalScore: true,
            totalMarks: true,
          },
        }),
      "school.getSchoolPerformanceAnalysisService.attempts",
    ),
  ]);

  const totalAssessments = grades.length + examAttempts.length;

  if (totalAssessments === 0) {
    return {
      averageScore: 0,
      totalAssessments: 0,
      subjectBreakdown: [],
      insight:
        "No assessment data yet. Add grades and exam scores to see AI-powered insights.",
      letterGrade: "N/A",
      isPremium: false,
    };
  }

  let sumPercentage = 0;
  grades.forEach((g) => {
    const gMax = g.maxMarks || 100;
    sumPercentage += ((g.score || 0) / gMax) * 100;
  });
  examAttempts.forEach((e) => {
    const eMax = e.totalMarks || 100;
    sumPercentage += ((e.totalScore || 0) / eMax) * 100;
  });

  const averageScore = Math.round(sumPercentage / totalAssessments);

  const subjectMap: Record<string, { total: number; count: number }> = {};
  grades.forEach((g) => {
    if (!subjectMap[g.subject]) subjectMap[g.subject] = { total: 0, count: 0 };
    subjectMap[g.subject].total += (g.score / g.maxMarks) * 100;
    subjectMap[g.subject].count += 1;
  });

  const subjectBreakdown = Object.entries(subjectMap).map(([name, data]) => ({
    name,
    average: Math.round(data.total / data.count),
  }));

  let letterGrade = "F";
  if (averageScore >= 90) letterGrade = "A+";
  else if (averageScore >= 80) letterGrade = "A";
  else if (averageScore >= 70) letterGrade = "B+";
  else if (averageScore >= 60) letterGrade = "B";
  else if (averageScore >= 50) letterGrade = "C";
  else if (averageScore >= 40) letterGrade = "D";

  const strongestSubject = [...subjectBreakdown].sort(
    (a, b) => b.average - a.average,
  )[0];

  let insight = `The institution is maintaining a solid ${letterGrade} standing with an average mastery of ${averageScore}%. `;
  if (strongestSubject) {
    insight += `Academic excellence is most prominent in ${strongestSubject.name}. `;
  }
  if (averageScore < 60) {
    insight +=
      "AI suggests immediate faculty review of current assessment methodologies to boost performance metrics.";
  } else {
    insight +=
      "Current trajectory indicates consistent academic growth across all departments.";
  }

  return {
    averageScore,
    totalAssessments,
    subjectBreakdown,
    insight,
    letterGrade,
    isPremium: false,
  };
};

