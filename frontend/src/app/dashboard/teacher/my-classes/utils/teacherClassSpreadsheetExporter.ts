import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Class } from '../components/type';

export function exportTeacherClassesToExcel(
  classes: Class[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = classes.map((cls, idx) => ({
    '#': idx + 1,
    'Class Name': cls.name || 'Untitled Class',
    'Level / Grade': cls.level || 'N/A',
    'Subject': cls.subject || 'All Subjects',
    'Enrolled Students': cls.studentCount || 0,
    'Session Attendance': `${cls.attendance ?? 0}%`,
    'Active Assignments': cls.assignments || 0,
    'Active Exams': cls.exams || 0,
    'Academic Year': cls.academicYear || 'Current',
    'Term': cls.term || 'Current',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Teacher Classes');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_classes_export_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportTeacherClassesToCSV(
  classes: Class[],
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Class Name',
    'Level',
    'Subject',
    'Students',
    'Attendance',
    'Assignments',
    'Exams',
    'Academic Year',
    'Term',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Teacher Assigned Classrooms & Cohort Modules"');
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = classes.map((cls, idx) => [
    (idx + 1).toString(),
    `"${(cls.name || '').replace(/"/g, '""')}"`,
    `"${(cls.level || 'N/A').replace(/"/g, '""')}"`,
    `"${(cls.subject || 'All Subjects').replace(/"/g, '""')}"`,
    (cls.studentCount || 0).toString(),
    `"${cls.attendance ?? 0}%"`,
    (cls.assignments || 0).toString(),
    (cls.exams || 0).toString(),
    `"${(cls.academicYear || 'Current').replace(/"/g, '""')}"`,
    `"${(cls.term || 'Current').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_classes_export_${dateStr}.csv`);
}

