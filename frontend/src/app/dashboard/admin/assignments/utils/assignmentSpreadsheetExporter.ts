import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface AssignmentExportItem {
  id: string;
  title: string;
  subjectName?: string;
  className?: string;
  dueDate?: string;
  progressPercentage?: number;
  totalStudents?: number;
  submittedCount?: number;
  status: string;
}

export function exportAssignmentsToExcel(
  assignments: AssignmentExportItem[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = assignments.map((a, idx) => ({
    '#': idx + 1,
    'Assignment Title': a.title || 'Untitled',
    'Subject': a.subjectName || 'General',
    'Target Class': a.className || 'All Classes',
    'Submission Deadline': a.dueDate ? format(new Date(a.dueDate), 'yyyy-MM-dd') : 'No Deadline',
    'Submissions Progress': `${a.submittedCount || 0}/${a.totalStudents || 0} (${a.progressPercentage || 0}%)`,
    'Status': (a.status || 'DRAFT').toUpperCase(),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Assignments Directory');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_assignments_export_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
}

export function exportAssignmentsToCSV(
  assignments: AssignmentExportItem[],
  schoolName: string = 'School'
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = ['#', 'Assignment Title', 'Subject', 'Target Class', 'Deadline', 'Progress', 'Status'];

  const rows = assignments.map((a, idx) => [
    (idx + 1).toString(),
    `"${(a.title || 'Untitled').replace(/"/g, '""')}"`,
    `"${(a.subjectName || 'General').replace(/"/g, '""')}"`,
    `"${(a.className || 'All Classes').replace(/"/g, '""')}"`,
    a.dueDate ? format(new Date(a.dueDate), 'yyyy-MM-dd') : 'No Deadline',
    `"${a.submittedCount || 0}/${a.totalStudents || 0} (${a.progressPercentage || 0}%)"`,
    (a.status || 'DRAFT').toUpperCase(),
  ]);

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  csvContent.push(`"Academic Assignments Registry"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');
  csvContent.push(headers.join(','));

  rows.forEach((r) => {
    csvContent.push(r.join(','));
  });

  const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_assignments_export_${dateStr}.csv`);
}

