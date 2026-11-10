import * as XLSX from "xlsx";

export interface ParentChildDirectoryRecord {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  schoolName: string;
  attendanceRate: number;
  averageGrade: number;
  letterGrade: string;
  standingRemark: string;
  status: string;
}

export interface ParentChildDirectorySpreadsheetData {
  parentName: string;
  totalChildren: number;
  records: ParentChildDirectoryRecord[];
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
 * Exports parent linked children directory to Excel (.xlsx)
 */
export function exportParentChildrenToExcel(data: ParentChildDirectorySpreadsheetData) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [`LINKED STUDENTS & FAMILY ACADEMIC DIRECTORY`],
    [`Parent / Guardian: ${data.parentName} | Total Wards: ${data.totalChildren}`],
    [`Generated Date: ${new Date().toLocaleDateString()}`],
    [],
  ];

  const headers = [
    "#",
    "Student Name",
    "Student ID / Code",
    "Class Cohort",
    "School Institution",
    "Attendance Rate (%)",
    "Average Score (%)",
    "Evaluated Grade",
    "Standing / Remark",
    "Link Status",
  ];

  const dataRows = data.records.map((r, idx) => [
    idx + 1,
    r.name,
    r.studentCode,
    r.className,
    r.schoolName,
    `${r.attendanceRate}%`,
    `${r.averageGrade}%`,
    r.letterGrade,
    r.standingRemark,
    r.status.toUpperCase(),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 20 },
    { wch: 20 },
    { wch: 28 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 24 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Linked Children");
  const safeName = data.parentName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeName}_Linked_Children_Directory.xlsx`);
}

/**
 * Exports parent linked children directory to CSV (.csv)
 */
export function exportParentChildrenToCSV(data: ParentChildDirectorySpreadsheetData) {
  const metaLines = [
    `# REPORT: LINKED STUDENTS & FAMILY ACADEMIC DIRECTORY`,
    `# PARENT / GUARDIAN: ${escapeCSV(data.parentName)}`,
    `# TOTAL STUDENTS: ${data.totalChildren}`,
    `# GENERATED: ${escapeCSV(new Date().toLocaleDateString())}`,
    "",
  ];

  const headers = [
    "#",
    "Student Name",
    "Student ID",
    "Class Cohort",
    "School Institution",
    "Attendance Rate",
    "Average Score",
    "Grade",
    "Standing",
    "Status",
  ]
    .map(escapeCSV)
    .join(",");

  const dataLines = data.records.map((r, idx) =>
    [
      idx + 1,
      r.name,
      r.studentCode,
      r.className,
      r.schoolName,
      `${r.attendanceRate}%`,
      `${r.averageGrade}%`,
      r.letterGrade,
      r.standingRemark,
      r.status.toUpperCase(),
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = data.parentName.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeName}_Linked_Children_Directory.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

