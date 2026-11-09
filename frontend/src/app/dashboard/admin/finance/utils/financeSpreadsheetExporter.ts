import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { FinanceTransaction } from '@/lib/api/services/financeService';

export function exportFinanceTransactionsToExcel(
  transactions: FinanceTransaction[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = transactions.map((t, idx) => ({
    '#': idx + 1,
    'Execution Date': t.createdAt ? format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A',
    'Student / Payer': t.student?.name || t.parent?.fullName || 'Institutional Payer',
    'Student Code': t.student?.studentCode || 'N/A',
    'Classification': t.paymentType || 'School Fee',
    'Payment Channel': t.channel || 'Online Gateway',
    'Amount (NGN)': Number(t.amount || 0),
    'Gateway Status': t.status || 'UNKNOWN',
    'Reference Hash': t.paymentReference || t.reference || t.id,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 32 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Finance Ledger');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_finance_ledger_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportFinanceTransactionsToCSV(
  transactions: FinanceTransaction[],
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Execution Date',
    'Student / Payer',
    'Student Code',
    'Classification',
    'Channel',
    'Amount (NGN)',
    'Status',
    'Reference Hash',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Official Institutional Finance Ledger"');
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = transactions.map((t, idx) => [
    (idx + 1).toString(),
    `"${t.createdAt ? format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A'}"`,
    `"${(t.student?.name || t.parent?.fullName || 'Institutional Payer').replace(/"/g, '""')}"`,
    `"${(t.student?.studentCode || 'N/A').replace(/"/g, '""')}"`,
    `"${(t.paymentType || 'School Fee').replace(/"/g, '""')}"`,
    `"${(t.channel || 'Online Gateway').replace(/"/g, '""')}"`,
    (t.amount || 0).toString(),
    `"${(t.status || 'UNKNOWN').replace(/"/g, '""')}"`,
    `"${(t.paymentReference || t.reference || t.id).replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_finance_ledger_${dateStr}.csv`);
}

