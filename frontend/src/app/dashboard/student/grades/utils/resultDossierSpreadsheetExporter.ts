import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface ResultDossierExportData {
  title: string;
  category: string;
  student: {
    name: string;
    studentCode?: string;
    class?: string;
  };
  totalScore: number;
  totalMarks: number;
  percentage: number | null;
  overallGrade: string;
  submittedAt?: string | Date;
  performanceInsight?: string;
  subjects: Array<{
    name: string;
    score: number;
    total: number;
    percentage: number;
    grade: string;
    remark: string;
  }>;
}

export function exportResultDossierToExcel(
  data: ResultDossierExportData,
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = data.subjects.map((s, idx) => ({
    '#': idx + 1,
    'Subject Component': s.name,
    'Score Obtained': s.score,
    'Maximum Marks': s.total,
    'Percentage': `${s.percentage}%`,
    'Letter Grade': s.grade,
    'Performance Remark': s.remark,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 26 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Result Dossier');

  const sanitizedStudent = data.student.name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedTitle = data.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedStudent}_${sanitizedTitle}_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportResultDossierToCSV(
  data: ResultDossierExportData,
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Subject Component',
    'Score Obtained',
    'Maximum Marks',
    'Percentage',
    'Letter Grade',
    'Performance Remark',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push(`"Assessment Result Dossier - ${data.title}"`);
  csvContent.push(`"Student: ${data.student.name} | ID: ${data.student.studentCode || 'N/A'} | Class: ${data.student.class || 'Class Cohort'}"`);
  csvContent.push(`"Total Score: ${data.totalScore}/${data.totalMarks} (${data.percentage ?? '—'}%) | Grade Awarded: ${data.overallGrade}"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = data.subjects.map((s, idx) => [
    (idx + 1).toString(),
    `"${(s.name || '').replace(/"/g, '""')}"`,
    s.score.toString(),
    s.total.toString(),
    `"${s.percentage}%"`,
    `"${(s.grade || '—').replace(/"/g, '""')}"`,
    `"${(s.remark || '—').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedStudent = data.student.name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedTitle = data.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_${sanitizedStudent}_${sanitizedTitle}_${dateStr}.csv`);
}

