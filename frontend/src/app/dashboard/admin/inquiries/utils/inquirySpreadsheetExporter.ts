import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

/**
 * Utility for exporting Website Inquiries to Excel (.xlsx) and CSV (.csv).
 */

export function exportInquiriesToExcel(
  data: Array<Record<string, unknown>>,
  fileName: string,
  sheetName: string = 'Inquiries'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    worksheet['!cols'] = keys.map((key) => {
      let maxLen = key.length;
      data.forEach((row) => {
        const valStr = String(row[key] ?? '');
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
    });
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, `${fileName}.xlsx`);
}

export function exportInquiriesToCSV(
  headers: string[],
  rows: Array<Array<string | number>>,
  fileName: string
) {
  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
}

