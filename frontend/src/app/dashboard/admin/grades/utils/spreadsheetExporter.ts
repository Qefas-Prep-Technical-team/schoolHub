import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getGradeEvaluation } from '@/utils/gradingSystem';

export interface TabularStudentResultRow {
  sn: number;
  candidateName: string;
  studentCode: string;
  className: string;
  session: string;
  score: number | string;
  totalMarks: number | string;
  percentage: number;
  grade: string;
  remark: string;
  status: 'PASS' | 'FAIL';
}

/**
 * Normalizes student attempts or grade records into structured rows
 */
export function formatStudentResultsForSpreadsheet(
  items: Array<{
    name?: string;
    studentCode?: string;
    className?: string;
    score?: number;
    totalMarks?: number;
    rawItem?: unknown;
  }>,
  schoolGradingSystem?: unknown,
  fallbackSessionName?: string
): TabularStudentResultRow[] {
  const currentYear = new Date().getFullYear();
  const defaultSession = `${currentYear}/${currentYear + 1}`;

  return items.map((item, idx) => {
    const raw = (item.rawItem || {}) as {
      student?: {
        name?: string;
        studentCode?: string;
        class?: { name?: string };
        classes?: Array<{ class?: { name?: string; section?: string } }>;
      };
      className?: string;
      percentage?: number;
      totalScore?: number;
      totalMarks?: number;
      score?: number;
      maxScore?: number;
      grade?: string;
      remarks?: string;
      session?: { name?: string };
      sessionName?: string;
      academicSession?: { name?: string };
      exam?: { session?: { name?: string }; academicSession?: { name?: string }; sessionName?: string };
    };

    const name = item.name || raw.student?.name || 'Student';
    const code = item.studentCode || raw.student?.studentCode || '—';
    const resolvedClass =
      item.className ||
      raw.className ||
      raw.student?.class?.name ||
      (raw.student?.classes?.[0]?.class?.name ? `${raw.student.classes[0].class.name}${raw.student.classes[0].class.section ? ` (${raw.student.classes[0].class.section})` : ''}` : '') ||
      'All Classes';

    const resolvedSession =
      raw.session?.name ||
      raw.sessionName ||
      raw.academicSession?.name ||
      raw.exam?.session?.name ||
      raw.exam?.academicSession?.name ||
      raw.exam?.sessionName ||
      fallbackSessionName ||
      defaultSession;

    const scoreNum = Number(item.score ?? raw.totalScore ?? raw.score ?? 0);
    const marksNum = Number(item.totalMarks ?? raw.totalMarks ?? raw.maxScore ?? 100);
    const pct = marksNum > 0 ? Math.round((scoreNum / marksNum) * 100) : 0;
    const evalResult = getGradeEvaluation(pct, schoolGradingSystem as any);

    return {
      sn: idx + 1,
      candidateName: name,
      studentCode: code,
      className: resolvedClass,
      session: resolvedSession,
      score: scoreNum,
      totalMarks: marksNum,
      percentage: pct,
      grade: evalResult.grade,
      remark: evalResult.remark || raw.remarks || 'Satisfactory',
      status: pct >= 40 ? 'PASS' : 'FAIL',
    };
  });
}

/**
 * Generates and downloads an Excel workbook (.xlsx)
 */
export function exportToExcel(
  rows: TabularStudentResultRow[],
  filename: string,
  examTitle: string
) {
  const formattedRows = rows.map((r) => ({
    "S/N": r.sn,
    "Candidate Name": r.candidateName,
    "Student ID": r.studentCode,
    "Class": r.className,
    "Academic Session": r.session,
    "Score": r.score,
    "Total Marks": r.totalMarks,
    "Percentage (%)": r.percentage,
    "Grade": r.grade,
    "Remark": r.remark,
    "Status": r.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  const colWidths = [
    { wch: 6 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 14 },
    { wch: 8 },
    { wch: 18 },
    { wch: 10 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results Sheet");

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Generates and downloads a CSV file (.csv)
 */
export function exportToCSV(
  rows: TabularStudentResultRow[],
  filename: string
) {
  const formattedRows = rows.map((r) => ({
    "S/N": r.sn,
    "Candidate Name": `"${r.candidateName.replace(/"/g, '""')}"`,
    "Student ID": `"${r.studentCode}"`,
    "Class": `"${r.className}"`,
    "Academic Session": `"${r.session}"`,
    "Score": r.score,
    "Total Marks": r.totalMarks,
    "Percentage": r.percentage,
    "Grade": r.grade,
    "Remark": `"${r.remark}"`,
    "Status": r.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}
