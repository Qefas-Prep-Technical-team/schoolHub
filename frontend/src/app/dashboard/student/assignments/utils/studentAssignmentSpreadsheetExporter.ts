import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Assignment } from '../components/types';

export function exportStudentAssignmentsToExcel(
  assignments: Assignment[],
  studentName: string = 'Student',
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = assignments.map((a, idx) => ({
    '#': idx + 1,
    'Assignment Title': a.title || 'Untitled Task',
    'Subject': a.subject || 'General',
    'Instructor': a.instructor || 'Class Teacher',
    'Status': (a.status || 'pending').toUpperCase(),
    'Score / Grade': a.grade || '—',
    'Total Points': a.totalMarks || 100,
    'Due Date': a.dueDate ? format(new Date(a.dueDate), 'yyyy-MM-dd HH:mm') : 'N/A',
    'Submission Date': a.submissionDate ? format(new Date(a.submissionDate), 'yyyy-MM-dd') : 'Pending',
    'Department': (a as any).department || 'Whole Class',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 22 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Assignments');

  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedStudent}_assignments_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportStudentAssignmentsToCSV(
  assignments: Assignment[],
  studentName: string = 'Student',
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Assignment Title',
    'Subject',
    'Instructor',
    'Status',
    'Score / Grade',
    'Total Points',
    'Due Date',
    'Submission Date',
    'Department',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push(`"Student Coursework & Assignment Portfolio - ${studentName}"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = assignments.map((a, idx) => [
    (idx + 1).toString(),
    `"${(a.title || '').replace(/"/g, '""')}"`,
    `"${(a.subject || 'General').replace(/"/g, '""')}"`,
    `"${(a.instructor || 'Class Teacher').replace(/"/g, '""')}"`,
    `"${(a.status || 'pending').toUpperCase()}"`,
    `"${(a.grade || '—').replace(/"/g, '""')}"`,
    (a.totalMarks || 100).toString(),
    `"${a.dueDate ? format(new Date(a.dueDate), 'yyyy-MM-dd HH:mm') : 'N/A'}"`,
    `"${a.submissionDate ? format(new Date(a.submissionDate), 'yyyy-MM-dd') : 'Pending'}"`,
    `"${((a as any).department || 'Whole Class').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_${sanitizedStudent}_assignments_${dateStr}.csv`);
}

