import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface ParentExamExportItem {
  id: string;
  examId?: string;
  title: string;
  subject: string;
  teacher?: string;
  date: string;
  score?: number;
  totalScore?: number;
  percentage?: number;
  grade?: string;
  status: "completed" | "upcoming" | "missed";
  assessmentType: string;
}

export interface ParentExamsExportData {
  student: {
    name: string;
    studentCode?: string;
    className?: string;
    section?: string;
    parentName?: string;
  };
  school?: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  summary: {
    termAverage: number;
    letterGrade: string;
    attendanceRate: number;
    totalExams: number;
    completedExams: number;
  };
  exams: ParentExamExportItem[];
}

/**
 * Clean data for CSV values
 */
function sanitizeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export parent exam assessment dossier to Excel (.xlsx)
 */
export function exportParentExamsToExcel(data: ParentExamsExportData): void {
  const wb = XLSX.utils.book_new();

  // 1. Overview sheet
  const overviewRows = [
    ["OFFICIAL STUDENT ACADEMIC ASSESSMENT DOSSIER"],
    ["Generated via Qefas Hub Academic Management Platform"],
    [""],
    ["INSTITUTION DETAILS"],
    ["School Name", data.school?.name || "Connected School"],
    ["Address", data.school?.address || "N/A"],
    ["Contact Email", data.school?.email || "N/A"],
    ["Contact Phone", data.school?.phone || "N/A"],
    [""],
    ["STUDENT PROFILE"],
    ["Student Name", data.student.name],
    ["Student Code", data.student.studentCode || "N/A"],
    ["Class Cohort", `${data.student.className || "Classroom"} ${data.student.section ? `(${data.student.section})` : ""}`.trim()],
    ["Parent / Guardian", data.student.parentName || "Parent Guardian"],
    ["Generated On", format(new Date(), "dd MMMM yyyy, hh:mm a")],
    [""],
    ["TERM PERFORMANCE SUMMARY"],
    ["Term Cumulative Average", `${data.summary.termAverage}%`],
    ["Overall Letter Grade", data.summary.letterGrade],
    ["Attendance Rate", `${data.summary.attendanceRate}%`],
    ["Total Tracked Assessments", data.summary.totalExams],
    ["Evaluated & Graded Papers", data.summary.completedExams],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  wsOverview["!cols"] = [{ wch: 30 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsOverview, "Performance Overview");

  // 2. Exam and Continuous Assessment Breakdown Sheet
  const examHeaders = [
    "Assessment Title",
    "Subject",
    "Category / Type",
    "Date",
    "Score",
    "Max Marks",
    "Percentage",
    "Letter Grade",
    "Status",
    "Subject Faculty",
  ];

  const examRows = (data.exams || []).map((e) => {
    const pct = e.percentage !== undefined
      ? `${e.percentage}%`
      : e.score !== undefined && e.totalScore && e.totalScore > 0
        ? `${Math.round((e.score / e.totalScore) * 100)}%`
        : "N/A";

    return [
      e.title,
      e.subject,
      e.assessmentType,
      e.date,
      e.score !== undefined ? e.score : "N/A",
      e.totalScore !== undefined ? e.totalScore : "N/A",
      pct,
      e.grade || "N/A",
      e.status.toUpperCase(),
      e.teacher || "Subject Faculty",
    ];
  });

  const wsExams = XLSX.utils.aoa_to_sheet([examHeaders, ...examRows]);
  wsExams["!cols"] = [
    { wch: 30 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsExams, "Assessment Breakdown");

  const sanitizedStudent = data.student.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${sanitizedStudent}_Academic_Dossier_${format(new Date(), "yyyyMMdd")}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export parent exam assessment dossier to CSV (.csv)
 */
export function exportParentExamsToCSV(data: ParentExamsExportData): void {
  const lines: string[] = [];

  lines.push(sanitizeCSV("OFFICIAL STUDENT ACADEMIC ASSESSMENT DOSSIER"));
  lines.push(sanitizeCSV(`Institution: ${data.school?.name || "Connected School"}`));
  lines.push(sanitizeCSV(`Student: ${data.student.name} (${data.student.studentCode || "N/A"})`));
  lines.push(sanitizeCSV(`Class Cohort: ${data.student.className || "Classroom"} ${data.student.section ? `(${data.student.section})` : ""}`));
  lines.push(sanitizeCSV(`Cumulative Average: ${data.summary.termAverage}% | Grade: ${data.summary.letterGrade}`));
  lines.push(sanitizeCSV(`Exported: ${format(new Date(), "yyyy-MM-dd HH:mm")}`));
  lines.push("");

  const headers = [
    "Assessment Title",
    "Subject",
    "Category",
    "Date",
    "Score",
    "Max Marks",
    "Percentage",
    "Grade",
    "Status",
    "Faculty",
  ];
  lines.push(headers.map(sanitizeCSV).join(","));

  (data.exams || []).forEach((e) => {
    const pct = e.percentage !== undefined
      ? `${e.percentage}%`
      : e.score !== undefined && e.totalScore && e.totalScore > 0
        ? `${Math.round((e.score / e.totalScore) * 100)}%`
        : "N/A";

    const row = [
      e.title,
      e.subject,
      e.assessmentType,
      e.date,
      e.score !== undefined ? String(e.score) : "N/A",
      e.totalScore !== undefined ? String(e.totalScore) : "N/A",
      pct,
      e.grade || "N/A",
      e.status.toUpperCase(),
      e.teacher || "Subject Faculty",
    ];
    lines.push(row.map(sanitizeCSV).join(","));
  });

  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitizedStudent = data.student.name.replace(/[^a-zA-Z0-9_-]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${sanitizedStudent}_Academic_Dossier_${format(new Date(), "yyyyMMdd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

