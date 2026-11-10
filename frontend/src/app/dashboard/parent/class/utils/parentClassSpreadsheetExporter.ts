import * as XLSX from "xlsx";

export interface ParentClassSubjectRecord {
  code: string;
  name: string;
  teacher: string;
  department: string;
  creditUnits: number;
}

export interface ParentClassDossierData {
  className: string;
  section?: string;
  session?: string;
  term?: string;
  classCode?: string;
  schoolName: string;
  leadTeacher: string;
  studentName: string;
  studentCode: string;
  totalStudents: number;
  attendanceRate: number;
  averageGrade: number;
  letterGrade: string;
  standingRemark: string;
  subjects: ParentClassSubjectRecord[];
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
 * Exports classroom cohort overview to Excel (.xlsx)
 */
export function exportParentClassToExcel(data: ParentClassDossierData) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [data.schoolName.toUpperCase()],
    [`CLASSROOM COHORT & ACADEMIC CURRICULUM DOSSIER — ${data.className.toUpperCase()} ${data.section ? `(SECTION ${data.section})` : ""}`],
    [`Student: ${data.studentName} | Student ID: ${data.studentCode}`],
    [`Academic Session: ${data.session || "N/A"} | Term: ${data.term || "N/A"} | Class Code: ${data.classCode || "N/A"}`],
    [`Lead Teacher: ${data.leadTeacher} | Total Enrolled Cohort: ${data.totalStudents} Students`],
    [`Attendance Consistency: ${data.attendanceRate}% | Class Average Score: ${data.averageGrade}% (Grade ${data.letterGrade} - ${data.standingRemark})`],
    [`Generated Date: ${new Date().toLocaleDateString()}`],
    [],
  ];

  const headers = [
    "#",
    "Subject Code",
    "Course Title",
    "Assigned Instructor / Faculty",
    "Department Division",
    "Credit Units / Weight",
  ];

  const dataRows = data.subjects.map((s, idx) => [
    idx + 1,
    s.code,
    s.name,
    s.teacher,
    s.department,
    s.creditUnits,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...dataRows]);

  ws["!cols"] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 30 },
    { wch: 28 },
    { wch: 22 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Class Overview");
  const safeClass = data.className.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeClass}_Classroom_Dossier.xlsx`);
}

/**
 * Exports classroom cohort overview to CSV (.csv)
 */
export function exportParentClassToCSV(data: ParentClassDossierData) {
  const metaLines = [
    `# SCHOOL: ${escapeCSV(data.schoolName)}`,
    `# REPORT: CLASSROOM COHORT & ACADEMIC CURRICULUM DOSSIER`,
    `# CLASS: ${escapeCSV(data.className)} ${data.section ? `(SECTION ${escapeCSV(data.section)})` : ""}`,
    `# STUDENT: ${escapeCSV(data.studentName)} (${escapeCSV(data.studentCode)})`,
    `# SESSION: ${escapeCSV(data.session || "N/A")} | TERM: ${escapeCSV(data.term || "N/A")} | CODE: ${escapeCSV(data.classCode || "N/A")}`,
    `# LEAD TEACHER: ${escapeCSV(data.leadTeacher)} | ENROLLED: ${data.totalStudents} students`,
    `# ATTENDANCE: ${data.attendanceRate}% | AVERAGE: ${data.averageGrade}% (${escapeCSV(data.letterGrade)} - ${escapeCSV(data.standingRemark)})`,
    `# GENERATED: ${escapeCSV(new Date().toLocaleDateString())}`,
    "",
  ];

  const headers = [
    "#",
    "Subject Code",
    "Course Title",
    "Instructor",
    "Department",
    "Credit Units",
  ]
    .map(escapeCSV)
    .join(",");

  const dataLines = data.subjects.map((s, idx) =>
    [
      idx + 1,
      s.code,
      s.name,
      s.teacher,
      s.department,
      s.creditUnits,
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeClass = data.className.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeClass}_Classroom_Dossier.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

