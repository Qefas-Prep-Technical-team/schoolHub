import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Assignment } from '../components/AssignmentsTable';

export function exportClassAssessmentsToExcel(
  assessments: Assignment[],
  className: string = 'Class',
  studentName: string = 'Student',
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = assessments.map((item, idx) => ({
    '#': idx + 1,
    'Assessment Title': item.title || 'Untitled Assessment',
    'Category': item.type || 'Assessment',
    'Due Date / Recorded Date': item.dueDate || 'N/A',
    'Status': item.status?.toUpperCase() || 'UPCOMING',
    'Score / Grade': item.grade || '—',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 34 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Class Assessments');

  const sanitizedClass = className.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedClass}_${sanitizedStudent}_assessments_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportClassAssessmentsToCSV(
  assessments: Assignment[],
  className: string = 'Class',
  studentName: string = 'Student',
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = ['#', 'Assessment Title', 'Category', 'Due Date', 'Status', 'Score / Grade'];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push(`"Class Assessment Performance Sheet - ${className}"`);
  csvContent.push(`"Student: ${studentName}"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = assessments.map((item, idx) => [
    (idx + 1).toString(),
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${(item.type || 'Assessment').replace(/"/g, '""')}"`,
    `"${(item.dueDate || 'N/A').replace(/"/g, '""')}"`,
    `"${(item.status || 'upcoming').toUpperCase()}"`,
    `"${(item.grade || '—').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedClass = className.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedClass}_${sanitizedStudent}_assessments_${dateStr}.csv`);
}

