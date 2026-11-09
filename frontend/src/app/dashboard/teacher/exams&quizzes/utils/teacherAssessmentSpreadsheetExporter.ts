import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface AssessmentExportItem {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  type?: string;
  _tabType?: string;
  subject?: { name: string; id?: string };
  subjectExamPapers?: any[];
  class?: { name: string; id?: string };
  classId?: string;
  totalMarks?: number;
  durationMinutes?: number;
  passMark?: number;
  status: string;
  createdAt?: string | Date;
  startDate?: string | Date;
  updatedAt?: string | Date;
  teacherId?: string;
}

export function exportTeacherAssessmentsToExcel(
  assessments: AssessmentExportItem[],
  schoolName: string = 'School',
  categoryLabel: string = 'Assessments'
) {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), 'yyyy-MM-dd');

  const rows = assessments.map((item, idx) => {
    let dateFormatted = '-';
    const rawDate = item.createdAt || item.startDate || item.updatedAt;
    if (rawDate) {
      try {
        const parsed = new Date(rawDate as string | Date);
        if (!isNaN(parsed.getTime())) {
          dateFormatted = format(parsed, 'yyyy-MM-dd');
        }
      } catch { }
    }

    const title = item.title || item.name || 'Untitled Assessment';
    const cat = item.category || (item._tabType ? item._tabType.toUpperCase() : item.type ? item.type.toUpperCase() : 'ASSESSMENT');
    const subjectName = item.subject?.name || item.subjectExamPapers?.[0]?.subjectPaper?.subject?.name || '-';
    const className = item.class?.name || '-';
    const marks = item.totalMarks !== undefined ? item.totalMarks : '-';
    const duration = item.durationMinutes ? `${item.durationMinutes} mins` : '-';
    const status = (item.status || 'DRAFT').toUpperCase();

    return {
      '#': idx + 1,
      'Date Created': dateFormatted,
      'Assessment Title': title,
      'Category': cat,
      'Subject': subjectName,
      'Class': className,
      'Total Marks': marks,
      'Duration': duration,
      'Status': status,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 32 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Assessments Directory');

  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedCategory = categoryLabel.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedCategory}_${dateStr}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  saveAs(blob, filename);
}

export function exportTeacherAssessmentsToCSV(
  assessments: AssessmentExportItem[],
  schoolName: string = 'School',
  categoryLabel: string = 'Assessments',
  schoolMotto?: string | null
) {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const headers = [
    '#',
    'Date Created',
    'Assessment Title',
    'Category',
    'Subject',
    'Class',
    'Total Marks',
    'Duration',
    'Status'
  ];

  const rows = assessments.map((item, idx) => {
    let dateFormatted = '-';
    const rawDate = item.createdAt || item.startDate || item.updatedAt;
    if (rawDate) {
      try {
        const parsed = new Date(rawDate as string | Date);
        if (!isNaN(parsed.getTime())) {
          dateFormatted = format(parsed, 'yyyy-MM-dd');
        }
      } catch { }
    }

    const title = (item.title || item.name || 'Untitled Assessment').replace(/"/g, '""');
    const cat = item.category || (item._tabType ? item._tabType.toUpperCase() : item.type ? item.type.toUpperCase() : 'ASSESSMENT');
    const subjectName = (item.subject?.name || item.subjectExamPapers?.[0]?.subjectPaper?.subject?.name || '-').replace(/"/g, '""');
    const className = (item.class?.name || '-').replace(/"/g, '""');
    const marks = item.totalMarks !== undefined ? item.totalMarks : '-';
    const duration = item.durationMinutes ? `${item.durationMinutes} mins` : '-';
    const status = (item.status || 'DRAFT').toUpperCase();

    return [
      idx + 1,
      `"${dateFormatted}"`,
      `"${title}"`,
      `"${cat}"`,
      `"${subjectName}"`,
      `"${className}"`,
      `"${marks}"`,
      `"${duration}"`,
      `"${status}"`
    ].join(',');
  });

  const bannerLines = [
    `"${schoolName.replace(/"/g, '""')}"`,
    ...(schoolMotto ? [`"${schoolMotto.replace(/"/g, '""')}"`] : []),
    `"Category Scope: ${categoryLabel.replace(/"/g, '""')}"`,
    `"Exported Date: ${dateStr}"`,
    ''
  ];

  const csvContent = [...bannerLines, headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const sanitizedCategory = categoryLabel.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${sanitizedSchool}_${sanitizedCategory}_${dateStr}.csv`;
  saveAs(blob, filename);
}

