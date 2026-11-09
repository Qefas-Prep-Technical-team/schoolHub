import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { StudentGrade } from '../components/types';

export function exportTeacherGradesToExcel(
  grades: StudentGrade[],
  schoolName: string = 'School',
  sessionName?: string,
  className?: string
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = grades.map((g, idx) => {
    let dateGotten = '-';
    if (g.createdAt || g.updatedAt) {
      try {
        const rawDate = g.createdAt || g.updatedAt;
        const parsed = new Date(rawDate as string | Date);
        if (!isNaN(parsed.getTime())) {
          dateGotten = format(parsed, 'yyyy-MM-dd');
        }
      } catch { }
    }

    return {
      '#': idx + 1,
      'Date Recorded': dateGotten,
      'Student Name': g.name || 'Untitled Student',
      'Student Code': g.studentCode || 'N/A',
      'Subject / Component': g.subjectPaper || 'Continuous Assessment',
      'Assessment Category': g.assessmentType || 'General CA',
      'Raw Score': g.score || 0,
      'Total Marks / Max': g.totalScore || 100,
      'Letter Grade': g.grade || 'N/A',
      'Status': g.status || 'Draft',
      'Teacher Remarks': g.remarks || 'Satisfactory',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 24 },
    { wch: 20 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Grade Assessment Pad');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_grade_pad_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportTeacherGradesToCSV(
  grades: StudentGrade[],
  schoolName: string = 'School',
  sessionName?: string,
  className?: string,
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Date Recorded',
    'Student Name',
    'Student ID',
    'Subject / Paper',
    'Assessment Type',
    'Score',
    'Percentage / Max',
    'Grade',
    'Status',
    'Remarks',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Continuous Assessment & Teacher Grade Pad"');
  if (sessionName || className) {
    csvContent.push(`"Session: ${sessionName || 'All'} | Class: ${className || 'All'}"`);
  }
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = grades.map((g, idx) => {
    let dateGotten = '-';
    if (g.createdAt || g.updatedAt) {
      try {
        const rawDate = g.createdAt || g.updatedAt;
        const parsed = new Date(rawDate as string | Date);
        if (!isNaN(parsed.getTime())) {
          dateGotten = format(parsed, 'yyyy-MM-dd');
        }
      } catch { }
    }

    return [
      (idx + 1).toString(),
      `"${dateGotten}"`,
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${(g.studentCode || 'N/A').replace(/"/g, '""')}"`,
      `"${(g.subjectPaper || 'Continuous Assessment').replace(/"/g, '""')}"`,
      `"${(g.assessmentType || 'General CA').replace(/"/g, '""')}"`,
      (g.score || 0).toString(),
      `"${g.totalScore || 100}"`,
      `"${(g.grade || 'N/A').replace(/"/g, '""')}"`,
      `"${(g.status || 'Draft').replace(/"/g, '""')}"`,
      `"${(g.remarks || 'Satisfactory').replace(/"/g, '""')}"`,
    ];
  });

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_grade_pad_${dateStr}.csv`);
}
