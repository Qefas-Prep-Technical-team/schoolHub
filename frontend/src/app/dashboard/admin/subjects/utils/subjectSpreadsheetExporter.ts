import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface SubjectExportItem {
  id: string;
  name: string;
  code?: string;
  departmentName?: string;
  teachersCount?: number;
  classesCount?: number;
  scope?: string;
}

export function exportSubjectsToExcel(
  subjects: SubjectExportItem[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = subjects.map((sub, idx) => ({
    '#': idx + 1,
    'Subject Name': sub.name || 'Untitled Subject',
    'Subject Code': sub.code || 'N/A',
    'Department': sub.departmentName || 'General',
    'Assigned Teachers': sub.teachersCount || 0,
    'Enrolled Classes': sub.classesCount || 0,
    'Institutional Scope': sub.scope === 'SCHOOL' ? 'School-wide' : 'Private',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Subjects Catalog');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_subjects_export_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
}

export function exportSubjectsToCSV(
  subjects: SubjectExportItem[],
  schoolName: string = 'School'
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = ['#', 'Subject Name', 'Subject Code', 'Department', 'Assigned Teachers', 'Enrolled Classes', 'Scope'];

  const rows = subjects.map((sub, idx) => [
    (idx + 1).toString(),
    `"${(sub.name || 'Untitled Subject').replace(/"/g, '""')}"`,
    `"${(sub.code || 'N/A').replace(/"/g, '""')}"`,
    `"${(sub.departmentName || 'General').replace(/"/g, '""')}"`,
    (sub.teachersCount || 0).toString(),
    (sub.classesCount || 0).toString(),
    sub.scope === 'SCHOOL' ? 'School-wide' : 'Private',
  ]);

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  csvContent.push(`"Official Academic Subjects Registry"`);
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');
  csvContent.push(headers.join(','));

  rows.forEach((r) => {
    csvContent.push(r.join(','));
  });

  const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_subjects_export_${dateStr}.csv`);
}

