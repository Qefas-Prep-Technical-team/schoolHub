import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ClassItem } from '../components/ClassTable';

export function exportStudentClassesToExcel(
  classes: ClassItem[],
  studentName: string = 'Student',
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = classes.map((cls, idx) => ({
    '#': idx + 1,
    'Class Cohort': cls.title || 'Untitled Class',
    'Primary Subject': cls.subject || 'General',
    'Curriculum Subjects': cls.subjects?.join(', ') || cls.description || 'Core registered subject',
    'Instructor': cls.teacher || 'Assigned Instructor',
    'Room / Section': cls.room || 'General Room',
    'Days': cls.days?.join(', ') || 'N/A',
    'Department Scoped': cls.hasDeptFilter ? 'Yes' : 'No',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 22 },
    { wch: 36 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Enrolled Classes');

  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedStudent}_my_classes_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportStudentClassesToCSV(
  classes: ClassItem[],
  studentName: string = 'Student',
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Class Cohort',
    'Primary Subject',
    'Curriculum Subjects',
    'Instructor',
    'Room / Section',
    'Days',
    'Department Scoped',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push(`"Official Student Enrolled Classes Roster - ${studentName}"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = classes.map((cls, idx) => [
    (idx + 1).toString(),
    `"${(cls.title || '').replace(/"/g, '""')}"`,
    `"${(cls.subject || '').replace(/"/g, '""')}"`,
    `"${(cls.subjects?.join(', ') || cls.description || '').replace(/"/g, '""')}"`,
    `"${(cls.teacher || '').replace(/"/g, '""')}"`,
    `"${(cls.room || '').replace(/"/g, '""')}"`,
    `"${(cls.days?.join(', ') || '').replace(/"/g, '""')}"`,
    cls.hasDeptFilter ? '"Yes"' : '"No"',
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_${sanitizedStudent}_my_classes_${dateStr}.csv`);
}

