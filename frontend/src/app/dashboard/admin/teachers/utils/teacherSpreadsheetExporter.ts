import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface TeacherExportRow {
  sn: number;
  name: string;
  email: string;
  teacherCode: string;
  subjects: string;
  classes: string;
  status: string;
}

export interface AttendanceExportRow {
  sn: number;
  name: string;
  teacherCode: string;
  dateOrSummary: string;
  presentOrStatus: string | number;
  absentOrTimeIn?: string | number;
  lateOrTimeOut?: string | number;
  excusedOrRemarks?: string | number;
  totalDays?: number;
}

/**
 * Downloads a structured Excel workbook (.xlsx)
 */
export function exportTeachersToExcel(
  data: Record<string, unknown>[],
  fileName: string,
  sheetName: string = 'Teachers'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, `${fileName}.xlsx`);
}

/**
 * Downloads a universal CSV file (.csv)
 */
export function exportTeachersToCSV(
  headers: string[],
  rows: (string | number)[][],
  fileName: string
) {
  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
}

