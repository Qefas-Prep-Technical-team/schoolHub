import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface StudentTranscriptExportData {
  student: {
    name?: string;
    studentCode?: string;
    class?: string;
  };
  school?: any;
  sessionName?: string;
  term?: string;
  gpa?: string | number;
  overallAverage?: number;
  totalScore?: number;
  totalMax?: number;
  subjects: Array<{
    subjectName: string;
    caScore?: number | string;
    examScore?: number | string;
    totalScore: number;
    grade: string;
    remark: string;
  }>;
  aiClassTeacherRemark?: string;
  aiGeneralRemark?: string;
}

export function exportStudentTranscriptToExcel(
  data: StudentTranscriptExportData,
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = data.subjects.map((sub, idx) => ({
    '#': idx + 1,
    'Subject Name': sub.subjectName,
    'Continuous Assessment (40)': sub.caScore ?? '—',
    'Examination (60)': sub.examScore ?? '—',
    'Total Score (100%)': `${sub.totalScore}%`,
    'Letter Grade': sub.grade,
    'Performance Remark': sub.remark,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 24 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Academic Transcript');

  const studentName = data.student.name || 'Student';
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedStudent}_transcript_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportStudentTranscriptToCSV(
  data: StudentTranscriptExportData,
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Subject Name',
    'Continuous Assessment (40)',
    'Examination (60)',
    'Total Score (100%)',
    'Letter Grade',
    'Remark',
  ];

  const studentName = data.student.name || 'Student';
  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push(`"Official Academic Transcript - ${studentName}"`);
  csvContent.push(`"Student ID: ${data.student.studentCode || 'N/A'} | Class: ${data.student.class || 'Class Cohort'}"`);
  csvContent.push(`"Session: ${data.sessionName || 'Current'} | Term: ${data.term || 'All'} | Cumulative GPA: ${data.gpa || '—'} | Average: ${data.overallAverage ?? '—'}%"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = data.subjects.map((sub, idx) => [
    (idx + 1).toString(),
    `"${(sub.subjectName || '').replace(/"/g, '""')}"`,
    `"${sub.caScore ?? '—'}"`,
    `"${sub.examScore ?? '—'}"`,
    `"${sub.totalScore}%"`,
    `"${(sub.grade || '—').replace(/"/g, '""')}"`,
    `"${(sub.remark || '—').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_${sanitizedStudent}_transcript_${dateStr}.csv`);
}

