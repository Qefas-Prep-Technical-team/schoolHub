import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface TeacherStudentExportItem {
  id: string | number;
  name: string;
  studentCode?: string;
  email?: string;
  gender?: string;
  status?: string;
  grade?: string;
  classId?: string;
  performance?: string;
  attendance?: number;
  lastExam?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function exportTeacherStudentsToExcel(
  students: TeacherStudentExportItem[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = students.map((s, idx) => ({
    '#': idx + 1,
    'Student Name': s.name || 'Untitled Student',
    'Student Code': s.studentCode || 'N/A',
    'Email Address': s.email || 'N/A',
    'Class / Grade': s.grade || 'N/A',
    'Performance Standing': s.performance || 'N/A',
    'Attendance Rate': `${s.attendance ?? 0}%`,
    'Last Assessment': s.lastExam || 'N/A',
    'Status': s.status || 'Active',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 24 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Students Roster');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_students_roster_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportTeacherStudentsToCSV(
  students: TeacherStudentExportItem[],
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Student Name',
    'Student Code',
    'Email Address',
    'Class / Grade',
    'Performance',
    'Attendance',
    'Last Exam',
    'Status',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Teacher Class Roster & Student Directory"');
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = students.map((s, idx) => [
    (idx + 1).toString(),
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.studentCode || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.email || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.grade || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.performance || 'N/A').replace(/"/g, '""')}"`,
    `"${s.attendance ?? 0}%"`,
    `"${(s.lastExam || 'N/A').replace(/"/g, '""')}"`,
    `"${(s.status || 'Active').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_students_roster_${dateStr}.csv`);
}

