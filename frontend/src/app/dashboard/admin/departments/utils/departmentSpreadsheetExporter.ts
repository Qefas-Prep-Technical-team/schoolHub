import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { Department } from '../services/departmentService';

export function exportDepartmentsToExcel(
  departments: Department[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = departments.map((dept, idx) => ({
    '#': idx + 1,
    'Department Name': dept.name || 'Untitled Department',
    'Department Code': dept.code || 'N/A',
    'Subjects Count': dept.subjects?.length || 0,
    'Enrolled Classes': dept._count?.classes || 0,
    'Total Students': dept._count?.students || 0,
    'Exams Count': dept._count?.exams || 0,
    'Institutional Scope': dept.scope === 'SCHOOL' ? 'School-wide' : 'Personal',
    'Status': dept.isArchived ? 'Archived' : 'Active',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Departments Catalog');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_departments_export_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportDepartmentsToCSV(
  departments: Department[],
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Department Name',
    'Department Code',
    'Subjects Count',
    'Enrolled Classes',
    'Total Students',
    'Scope',
    'Status',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Departments Academic Report"');
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = departments.map((dept, idx) => [
    (idx + 1).toString(),
    `"${(dept.name || '').replace(/"/g, '""')}"`,
    `"${(dept.code || '').replace(/"/g, '""')}"`,
    (dept.subjects?.length || 0).toString(),
    (dept._count?.classes || 0).toString(),
    (dept._count?.students || 0).toString(),
    dept.scope === 'SCHOOL' ? 'School-wide' : 'Personal',
    dept.isArchived ? 'Archived' : 'Active',
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_departments_export_${dateStr}.csv`);
}

