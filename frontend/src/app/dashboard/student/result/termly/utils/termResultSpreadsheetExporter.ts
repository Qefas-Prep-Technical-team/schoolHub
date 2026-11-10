import * as XLSX from "xlsx";

export interface TermResultSpreadsheetRecord {
  courseCode: string;
  subjectTitle: string;
  assignmentScore: number | string;
  quizScore: number | string;
  caScore: number | string;
  examScore: number | string;
  totalScore: number | string;
  grade: string;
  status: string;
}

export interface TermResultSpreadsheetData {
  studentName: string;
  studentCode: string;
  className: string;
  sessionName: string;
  termName: string;
  revealedCount: number;
  totalCount: number;
  averageScore?: number | null;
  records: TermResultSpreadsheetRecord[];
}

/**
 * Cleanly escapes a string cell for CSV compliance.
 */
function escapeCSV(val: string | number | null | undefined): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports single term result sheet to Excel (.xlsx) with styled institutional headers
 */
export function exportTermResultToExcel(
  data: TermResultSpreadsheetData,
  schoolName: string = "School Portal"
) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [schoolName.toUpperCase()],
    [`OFFICIAL ACADEMIC STATEMENT OF RESULTS — ${data.termName.toUpperCase()} (${data.sessionName})`],
    [`Student Name: ${data.studentName} | Student ID: ${data.studentCode}`],
    [`Class / Grade: ${data.className} | Term Average: ${data.averageScore != null ? `${data.averageScore.toFixed(1)}%` : "N/A"}`],
    [`Subjects Released: ${data.revealedCount} of ${data.totalCount} | Generated: ${new Date().toLocaleDateString()}`],
    [], // Spacer
  ];

  const headers = [
    "#",
    "Course Code",
    "Subject Title",
    "Assignment",
    "Quiz / Test",
    "Continuous Assessment",
    "Examination",
    "Total Score",
    "Grade",
    "Standing / Remark",
  ];

  const rows = data.records.map((r, idx) => [
    idx + 1,
    r.courseCode || "—",
    r.subjectTitle,
    r.assignmentScore,
    r.quizScore,
    r.caScore,
    r.examScore,
    r.totalScore,
    r.grade,
    r.status,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);

  ws["!cols"] = [
    { wch: 5 },  // #
    { wch: 14 }, // Course Code
    { wch: 32 }, // Subject Title
    { wch: 14 }, // Assignment
    { wch: 14 }, // Quiz
    { wch: 22 }, // CA
    { wch: 14 }, // Exam
    { wch: 14 }, // Total
    { wch: 10 }, // Grade
    { wch: 20 }, // Standing
  ];

  const sheetName = `${data.termName.substring(0, 10)}_Result`.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeStudent = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeTerm = data.termName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeStudent}_${safeTerm}_Result_Sheet.xlsx`);
}

/**
 * Exports single term result sheet to CSV (.csv) format
 */
export function exportTermResultToCSV(
  data: TermResultSpreadsheetData,
  schoolName: string = "School Portal"
) {
  const metaLines = [
    `# Institution: ${escapeCSV(schoolName)}`,
    `# Report: Official Statement of Results - ${escapeCSV(data.termName)} (${escapeCSV(data.sessionName)})`,
    `# Student Name: ${escapeCSV(data.studentName)}`,
    `# Student ID: ${escapeCSV(data.studentCode)}`,
    `# Class: ${escapeCSV(data.className)}`,
    `# Term Average: ${data.averageScore != null ? `${data.averageScore.toFixed(1)}%` : "N/A"}`,
    `# Generated: ${new Date().toLocaleDateString()}`,
    "",
  ];

  const headers = [
    "S/N",
    "Course Code",
    "Subject Title",
    "Assignment",
    "Quiz / Test",
    "CA",
    "Exam",
    "Total Score",
    "Grade",
    "Standing",
  ].map(escapeCSV).join(",");

  const dataLines = data.records.map((r, idx) =>
    [
      idx + 1,
      r.courseCode || "—",
      r.subjectTitle,
      r.assignmentScore,
      r.quizScore,
      r.caScore,
      r.examScore,
      r.totalScore,
      r.grade,
      r.status,
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeStudent = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeTerm = data.termName.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeStudent}_${safeTerm}_Result_Sheet.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface TermListSpreadsheetRow {
  sessionName: string;
  className: string;
  termLabel: string;
  totalSubjects: number;
  revealedSubjects: number;
  releaseStatus: string;
}

/**
 * Exports summary of all enrolled published terms for student
 */
export function exportTermListToExcel(
  studentName: string,
  records: TermListSpreadsheetRow[],
  schoolName: string = "School Portal"
) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [schoolName.toUpperCase()],
    [`PUBLISHED ACADEMIC TERMS DIRECTORY — ${studentName.toUpperCase()}`],
    [`Generated: ${new Date().toLocaleDateString()} | Total Enrolled Terms: ${records.length}`],
    [],
  ];

  const headers = [
    "#",
    "Academic Session",
    "Class Cohort",
    "Term",
    "Evaluated Subjects",
    "Released Count",
    "Status",
  ];

  const rows = records.map((r, idx) => [
    idx + 1,
    r.sessionName,
    r.className,
    r.termLabel,
    r.totalSubjects,
    r.revealedSubjects,
    r.releaseStatus,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);
  ws["!cols"] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 24 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Published_Terms");
  const safeStudent = studentName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeStudent}_Published_Terms_Directory.xlsx`);
}

export function exportTermListToCSV(
  studentName: string,
  records: TermListSpreadsheetRow[],
  schoolName: string = "School Portal"
) {
  const metaLines = [
    `# Institution: ${escapeCSV(schoolName)}`,
    `# Report: Published Academic Terms Directory`,
    `# Student: ${escapeCSV(studentName)}`,
    `# Generated: ${new Date().toLocaleDateString()}`,
    "",
  ];

  const headers = [
    "S/N",
    "Academic Session",
    "Class Cohort",
    "Term",
    "Evaluated Subjects",
    "Released Count",
    "Status",
  ].map(escapeCSV).join(",");

  const dataLines = records.map((r, idx) =>
    [
      idx + 1,
      r.sessionName,
      r.className,
      r.termLabel,
      r.totalSubjects,
      r.revealedSubjects,
      r.releaseStatus,
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeStudent = studentName.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeStudent}_Published_Terms_Directory.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

