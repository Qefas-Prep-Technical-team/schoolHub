import * as XLSX from "xlsx";

export interface ParentOfflineGradeRecord {
  subject: string;
  category: string;
  scoreDisplay: string;
  percentage: number | null;
  grade: string;
  standing: string;
  dateStr: string;
  remarks: string;
}

export interface ParentOfflineGradeSpreadsheetData {
  studentName: string;
  studentCode: string;
  className: string;
  schoolName: string;
  termSession: string;
  averagePercentage: number;
  records: ParentOfflineGradeRecord[];
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
 * Exports parent child offline assessments to Excel (.xlsx)
 */
export function exportParentOfflineGradesToExcel(data: ParentOfflineGradeSpreadsheetData) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [data.schoolName.toUpperCase()],
    [`STUDENT CONTINUOUS ASSESSMENT & OFFLINE RESULTS DOSSIER`],
    [`Student Name: ${data.studentName}${data.studentCode && data.studentCode !== 'N/A' && !data.studentCode.includes('-') ? ` | Student Code: ${data.studentCode}` : ''}`],
    [`Class / Grade: ${data.className} | Term / Session: ${data.termSession}`],
    [`Evaluated Average: ${data.averagePercentage}% | Records: ${data.records.length}`],
    [`Generated Date: ${new Date().toLocaleDateString()}`],
    [],
  ];

  const headers = [
    "#",
    "Subject Course",
    "Assessment Type",
    "Score / Max Marks",
    "Percentage (%)",
    "Evaluated Grade",
    "Standing / Remark",
    "Date Recorded",
    "Teacher Remarks",
  ];

  const dataRows = data.records.map((r, idx) => [
    idx + 1,
    r.subject,
    r.category,
    r.scoreDisplay,
    r.percentage != null ? `${r.percentage}%` : "—",
    r.grade,
    r.standing,
    r.dateStr,
    r.remarks || "—",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Offline Grades");
  const safeName = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeName}_Offline_Grades.xlsx`);
}

/**
 * Exports parent child offline assessments to CSV (.csv)
 */
export function exportParentOfflineGradesToCSV(data: ParentOfflineGradeSpreadsheetData) {
  const metaLines = [
    `# SCHOOL: ${escapeCSV(data.schoolName)}`,
    `# REPORT: STUDENT CONTINUOUS ASSESSMENT & OFFLINE RESULTS DOSSIER`,
    `# STUDENT: ${escapeCSV(data.studentName)}${data.studentCode && data.studentCode !== 'N/A' && !data.studentCode.includes('-') ? ` (${escapeCSV(data.studentCode)})` : ''}`,
    `# CLASS: ${escapeCSV(data.className)} | TERM: ${escapeCSV(data.termSession)}`,
    `# CA AVERAGE: ${data.averagePercentage}% | TOTAL: ${data.records.length} records`,
    `# GENERATED: ${escapeCSV(new Date().toLocaleDateString())}`,
    "",
  ];

  const headers = [
    "#",
    "Subject Course",
    "Assessment Type",
    "Score / Max Marks",
    "Percentage",
    "Grade",
    "Standing",
    "Date",
    "Teacher Remarks",
  ]
    .map(escapeCSV)
    .join(",");

  const dataLines = data.records.map((r, idx) =>
    [
      idx + 1,
      r.subject,
      r.category,
      r.scoreDisplay,
      r.percentage != null ? `${r.percentage}%` : "—",
      r.grade,
      r.standing,
      r.dateStr,
      r.remarks || "—",
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
  link.setAttribute("download", `${safeName}_Offline_Grades.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

