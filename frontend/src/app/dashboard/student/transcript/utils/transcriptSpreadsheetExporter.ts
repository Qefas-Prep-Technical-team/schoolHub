import * as XLSX from "xlsx";
import {
  PublishedResultGroup,
  TranscriptStatsSummary,
  getTermLabel,
  getGradeLetter,
  getGradePoint,
  getRemark,
} from "../types/transcript.types";
import { GradingRule } from "@/utils/gradingSystem";

export interface StudentTranscriptSpreadsheetData {
  studentName: string;
  studentCode: string;
  departmentOrClass: string;
  schoolName: string;
  schoolLocation: string;
  stats: TranscriptStatsSummary;
  filteredResults: PublishedResultGroup[];
  selectedSessionName: string;
  selectedTermLabel: string;
  gradingSystem?: GradingRule[] | null;
}

function escapeCSV(val: string | number | null | undefined): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports complete official academic transcript into Excel (.xlsx) with clean sheet per session or unified master sheet
 */
export function exportOfficialTranscriptToExcel(
  data: StudentTranscriptSpreadsheetData
) {
  const wb = XLSX.utils.book_new();

  // Master Summary Title Rows
  const titleRows = [
    [data.schoolName.toUpperCase()],
    [`OFFICIAL ACADEMIC TRANSCRIPT RECORD`],
    [`Student Name: ${data.studentName} | Student ID: ${data.studentCode}`],
    [`Class / Department: ${data.departmentOrClass} | Issuance Date: ${new Date().toLocaleDateString()}`],
    [`Cumulative CGPA: ${data.stats.cgpa} (${data.stats.cgpaGrade}) | Academic Standing: ${data.stats.academicStanding}`],
    [`Scope: ${data.selectedSessionName} — ${data.selectedTermLabel}`],
    [],
  ];

  const headers = [
    "Session",
    "Term",
    "Course Code",
    "Course / Subject Title",
    "Assignment",
    "Quiz / Test",
    "Continuous Assessment",
    "Examination",
    "Total Score",
    "Grade",
    "Grade Point",
    "Standing / Remark",
  ];

  const rows: Array<Array<string | number>> = [];

  data.filteredResults.forEach((group) => {
    const sessionLabel = group.session?.name || "Session";
    const termLabel = getTermLabel(group.term);

    (group.subjectResults || []).forEach((s) => {
      const subName = s.subject?.name || "Subject";
      const subCode = s.subject?.code || "—";
      const asst = s.scoresRevealed && s.assignmentScore != null ? s.assignmentScore : "—";
      const quiz = s.scoresRevealed && s.quizScore != null ? s.quizScore : "—";
      const ca = s.scoresRevealed && s.caScore != null ? s.caScore : "—";
      const exam = s.scoresRevealed && s.examScore != null ? s.examScore : "—";

      const effectiveTotal =
        s.totalScore ??
        (s.assignmentScore != null ||
        s.quizScore != null ||
        s.caScore != null ||
        s.examScore != null
          ? (s.assignmentScore || 0) +
            (s.quizScore || 0) +
            (s.caScore || 0) +
            (s.examScore || 0)
          : null);

      const total = s.scoresRevealed && effectiveTotal != null ? effectiveTotal : "Pending";
      const grade = s.scoresRevealed
        ? getGradeLetter(effectiveTotal ?? null, data.gradingSystem)
        : "—";
      const gp = s.scoresRevealed
        ? getGradePoint(effectiveTotal ?? null, data.gradingSystem).toFixed(1)
        : "—";
      const remark = s.scoresRevealed
        ? getRemark(effectiveTotal ?? null, data.gradingSystem)
        : "Pending";

      rows.push([
        sessionLabel,
        termLabel,
        subCode,
        subName,
        asst,
        quiz,
        ca,
        exam,
        total,
        grade,
        gp,
        remark,
      ]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);

  ws["!cols"] = [
    { wch: 18 }, // Session
    { wch: 14 }, // Term
    { wch: 14 }, // Code
    { wch: 32 }, // Subject Name
    { wch: 12 }, // Asst
    { wch: 12 }, // Quiz
    { wch: 22 }, // CA
    { wch: 14 }, // Exam
    { wch: 14 }, // Total
    { wch: 10 }, // Grade
    { wch: 12 }, // GP
    { wch: 22 }, // Remark
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Academic_Transcript");

  const safeStudent = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeStudent}_Official_Transcript.xlsx`);
}

/**
 * Exports official academic transcript into clean, standard CSV (.csv) format
 */
export function exportOfficialTranscriptToCSV(
  data: StudentTranscriptSpreadsheetData
) {
  const metaLines = [
    `# Institution: ${escapeCSV(data.schoolName)}`,
    `# Report: Official Academic Transcript`,
    `# Student Name: ${escapeCSV(data.studentName)}`,
    `# Student ID: ${escapeCSV(data.studentCode)}`,
    `# Department / Class: ${escapeCSV(data.departmentOrClass)}`,
    `# Cumulative CGPA: ${escapeCSV(data.stats.cgpa)} (${escapeCSV(data.stats.cgpaGrade)})`,
    `# Academic Standing: ${escapeCSV(data.stats.academicStanding)}`,
    `# Scope: ${escapeCSV(data.selectedSessionName)} - ${escapeCSV(data.selectedTermLabel)}`,
    `# Issued Date: ${new Date().toLocaleDateString()}`,
    "",
  ];

  const headers = [
    "Academic Session",
    "Term",
    "Course Code",
    "Course Title",
    "Assignment",
    "Quiz / Test",
    "Continuous Assessment",
    "Examination",
    "Total Score",
    "Grade",
    "Grade Point",
    "Standing",
  ]
    .map(escapeCSV)
    .join(",");

  const dataLines: string[] = [];

  data.filteredResults.forEach((group) => {
    const sessionLabel = group.session?.name || "Session";
    const termLabel = getTermLabel(group.term);

    (group.subjectResults || []).forEach((s) => {
      const subName = s.subject?.name || "Subject";
      const subCode = s.subject?.code || "—";
      const asst = s.scoresRevealed && s.assignmentScore != null ? s.assignmentScore : "—";
      const quiz = s.scoresRevealed && s.quizScore != null ? s.quizScore : "—";
      const ca = s.scoresRevealed && s.caScore != null ? s.caScore : "—";
      const exam = s.scoresRevealed && s.examScore != null ? s.examScore : "—";

      const effectiveTotal =
        s.totalScore ??
        (s.assignmentScore != null ||
        s.quizScore != null ||
        s.caScore != null ||
        s.examScore != null
          ? (s.assignmentScore || 0) +
            (s.quizScore || 0) +
            (s.caScore || 0) +
            (s.examScore || 0)
          : null);

      const total = s.scoresRevealed && effectiveTotal != null ? effectiveTotal : "Pending";
      const grade = s.scoresRevealed
        ? getGradeLetter(effectiveTotal ?? null, data.gradingSystem)
        : "—";
      const gp = s.scoresRevealed
        ? getGradePoint(effectiveTotal ?? null, data.gradingSystem).toFixed(1)
        : "—";
      const remark = s.scoresRevealed
        ? getRemark(effectiveTotal ?? null, data.gradingSystem)
        : "Pending";

      dataLines.push(
        [
          sessionLabel,
          termLabel,
          subCode,
          subName,
          asst,
          quiz,
          ca,
          exam,
          total,
          grade,
          gp,
          remark,
        ]
          .map(escapeCSV)
          .join(",")
      );
    });
  });

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeStudent = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeStudent}_Official_Transcript.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

