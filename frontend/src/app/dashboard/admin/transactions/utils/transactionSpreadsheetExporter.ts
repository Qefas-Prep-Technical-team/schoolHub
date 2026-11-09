import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { TransactionItem } from '../components/TransactionsSectionedTable';

export function exportBillingTransactionsToExcel(
  transactions: TransactionItem[],
  schoolName: string = 'School'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = transactions.map((t, idx) => ({
    '#': idx + 1,
    'Invoice / Reference': t.reference || String(t.id),
    'Date & Time': t.createdAt || t.date ? format(new Date(t.createdAt || t.date || ''), 'yyyy-MM-dd HH:mm') : 'N/A',
    'Subscription Plan': t.plan || 'N/A',
    'Billing Cycle': t.billingCycle || 'Monthly',
    'Amount (NGN)': Number(t.amount || 0),
    'Payment Method': t.paymentMethod || 'Direct Card / Gateway',
    'Gateway Status': t.status || 'UNKNOWN',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Billing Audit Ledger');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_billing_transactions_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportBillingTransactionsToCSV(
  transactions: TransactionItem[],
  schoolName: string = 'School',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Invoice / Reference',
    'Date',
    'Subscription Plan',
    'Billing Cycle',
    'Amount (NGN)',
    'Payment Method',
    'Status',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Official Billing & Subscription Audit Ledger"');
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = transactions.map((t, idx) => [
    (idx + 1).toString(),
    `"${(t.reference || String(t.id)).replace(/"/g, '""')}"`,
    `"${t.createdAt || t.date ? format(new Date(t.createdAt || t.date || ''), 'yyyy-MM-dd HH:mm') : 'N/A'}"`,
    `"${(t.plan || 'N/A').replace(/"/g, '""')}"`,
    `"${(t.billingCycle || 'Monthly').replace(/"/g, '""')}"`,
    (t.amount || 0).toString(),
    `"${(t.paymentMethod || 'Direct Card / Gateway').replace(/"/g, '""')}"`,
    `"${(t.status || 'UNKNOWN').replace(/"/g, '""')}"`,
  ]);

  csvContent.push(headers.join(','));
  rows.forEach((r) => csvContent.push(r.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_billing_transactions_${dateStr}.csv`);
}

