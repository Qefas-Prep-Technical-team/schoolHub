import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { GradeBatchSummary } from '@/app/dashboard/admin/offline-grades/types';
import { computeGradePill } from '@/utils/gradingSystem';

export function exportOfflineGradesToExcel(
  records: GradeBatchSummary[],
  schoolName: string = 'School',
  gradingSystem?: any[],
  filterContext?: { className?: string; category?: string }
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = records.map((r, idx) => {
    let dateRecorded = '-';
    if (r.createdAt || r.updatedAt) {
      try {
        const parsed = new Date(r.createdAt || r.updatedAt);
        if (!isNaN(parsed.getTime())) {
          dateRecorded = format(parsed, 'yyyy-MM-dd');
        }
      } catch { }
    }

    const pct = r.maxMarks > 0 ? Math.round((r.averageScore / r.maxMarks) * 100) : 0;
    const gradePill = computeGradePill(pct, gradingSystem);

    return {
      '#': idx + 1,
      'Date Recorded': dateRecorded,
      'Assessment Title': r.assessmentType || 'Offline Assessment',
      'Subject Curriculum': r.subject || 'General Subject',
      'Class': r.className || 'General Class',
      'Assessment Category': r.category || 'CA',
      'Graded Students': r.gradedStudents || 0,
      'Class Average': Number(r.averageScore.toFixed(1)),
      'Max Score Marks': r.maxMarks || 100,
      'Average Percentage': `${pct}%`,
      'Letter Grade': gradePill.label,
      'Academic Evaluation': gradePill.remark,
      'Status': r.status || 'DRAFT',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 22 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Offline Marksheets');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_offline_grades_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportOfflineGradesToCSV(
  records: GradeBatchSummary[],
  schoolName: string = 'School',
  gradingSystem?: any[],
  schoolMotto?: string | null,
  filterContext?: { className?: string; category?: string }
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Date Recorded',
    'Assessment Title',
    'Subject Curriculum',
    'Class',
    'Assessment Category',
    'Graded Students',
    'Class Average',
    'Max Marks',
    'Percentage',
    'Letter Grade',
    'Evaluation',
    'Status',
  ];

  const csvContent: string[] = [];
  csvContent.push(`"${schoolName.toUpperCase()}"`);
  if (schoolMotto) csvContent.push(`"${schoolMotto}"`);
  csvContent.push('');
  csvContent.push('"Continuous Assessment & Offline Marksheets Register"');
  if (filterContext?.className || filterContext?.category) {
    csvContent.push(`"Class: ${filterContext.className || 'All'} | Category: ${filterContext.category || 'All'}"`);
  }
  csvContent.push(`"Generated on: ${dateStr}"`);
  csvContent.push('');

  const rows = records.map((r, idx) => {
    let dateRecorded = '-';
    if (r.createdAt || r.updatedAt) {
      try {
        const parsed = new Date(r.createdAt || r.updatedAt);
        if (!isNaN(parsed.getTime())) {
          dateRecorded = format(parsed, 'yyyy-MM-dd');
        }
      } catch { }
    }

    const pct = r.maxMarks > 0 ? Math.round((r.averageScore / r.maxMarks) * 100) : 0;
    const gradePill = computeGradePill(pct, gradingSystem);

    return [
      (idx + 1).toString(),
      `"${dateRecorded}"`,
      `"${(r.assessmentType || '').replace(/"/g, '""')}"`,
      `"${(r.subject || '').replace(/"/g, '""')}"`,
      `"${(r.className || '').replace(/"/g, '""')}"`,
      `"${(r.category || 'CA').replace(/"/g, '""')}"`,
      (r.gradedStudents || 0).toString(),
      r.averageScore.toFixed(1),
      (r.maxMarks || 100).toString(),
      `"${pct}%"`,
      `"${gradePill.label}"`,
      `"${(gradePill.remark || '').replace(/"/g, '""')}"`,
      `"${(r.status || 'DRAFT').replace(/"/g, '""')}"`,
    ];
  });

  csvContent.push(headers.join(','));
  rows.forEach((row) => csvContent.push(row.join(',')));

  const csv = csvContent.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  saveAs(blob, `${sanitizedSchool}_offline_grades_${dateStr}.csv`);
}

