import * as XLSX from "xlsx";
import { ReportCardData } from "../components/types";

function escapeCSV(val: string | number | null | undefined): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports parent child report card to Excel (.xlsx)
 */
export function exportReportCardToExcel(data: ReportCardData) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [data.schoolName.toUpperCase()],
    [`OFFICIAL TERMLY PERFORMANCE REPORT CARD — ${data.term.toUpperCase()}`],
    [`Student Name: ${data.studentName} | Student ID: ${data.studentId}`],
    [`Class: ${data.currentClass || "Class Cohort"} | Academic Session: ${data.session}`],
    [`Overall Average: ${data.averageScore}% | Overall Grade: ${data.overallGrade} | Standing: ${data.standing}`],
    [`Generated Date: ${new Date().toLocaleDateString()}`],
    [],
  ];

  const headers = [
    "#",
    "Subject Name",
    "Continuous Assessment (40)",
    "Terminal Exam (60)",
    "Total Score (100)",
    "Letter Grade",
    "Teacher Remark",
  ];

  const dataRows = data.subjects.map((s, idx) => [
    idx + 1,
    s.name,
    s.caScore,
    s.examScore,
    s.totalScore,
    s.grade,
    s.remark,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 26 },
    { wch: 24 },
    { wch: 20 },
    { wch: 16 },
    { wch: 36 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Report Card");
  const safeName = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeName}_${data.term.replace(/\s+/g, "_")}_ReportCard.xlsx`);
}

/**
 * Exports parent child report card to CSV (.csv)
 */
export function exportReportCardToCSV(data: ReportCardData) {
  const metaLines = [
    `# SCHOOL: ${escapeCSV(data.schoolName)}`,
    `# REPORT: OFFICIAL TERMLY PERFORMANCE REPORT CARD — ${escapeCSV(data.term)}`,
    `# STUDENT: ${escapeCSV(data.studentName)} (${escapeCSV(data.studentId)})`,
    `# CLASS: ${escapeCSV(data.currentClass || "Class Cohort")} | SESSION: ${escapeCSV(data.session)}`,
    `# OVERALL: ${data.averageScore}% | GRADE: ${escapeCSV(data.overallGrade)} | STANDING: ${escapeCSV(data.standing)}`,
    `# GENERATED: ${escapeCSV(new Date().toLocaleDateString())}`,
    "",
  ];

  const headers = [
    "#",
    "Subject Name",
    "CA Score",
    "Exam Score",
    "Total Score",
    "Grade",
    "Teacher Remark",
  ]
    .map(escapeCSV)
    .join(",");

  const dataLines = data.subjects.map((s, idx) =>
    [
      idx + 1,
      s.name,
      s.caScore,
      s.examScore,
      s.totalScore,
      s.grade,
      s.remark,
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeName}_${data.term.replace(/\s+/g, "_")}_ReportCard.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

