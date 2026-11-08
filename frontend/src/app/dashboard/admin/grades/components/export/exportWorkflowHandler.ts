"use client";

import {
  formatStudentResultsForSpreadsheet,
  exportToExcel,
  exportToCSV,
} from '../../utils/spreadsheetExporter';
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';
import { incrementMonthlyExportUsage } from '@/utils/exportQuotaManager';
import type { ExportStudentOption, ExportScopeMode, ExportFileFormat } from '../ExportResultScopeModal';

export interface ExecuteExportParams {
  selectedFormat: ExportFileFormat;
  scopeMode: ExportScopeMode;
  exportItems: ExportStudentOption[];
  examTitle?: string;
  title?: string;
  sessionName?: string;
  gradingSystem?: unknown;
  schoolId?: string;
  schoolName?: string;
  className?: string;
  userName?: string;
  userRole?: string;
  isPaying: boolean;
  quotaContextId: string;
  onExport: (
    mode: ExportScopeMode,
    selectedList: ExportStudentOption[],
    format?: ExportFileFormat,
    isPaying?: boolean
  ) => Promise<void>;
  onSuccess: () => void;
}

export async function executeExportWorkflow(params: ExecuteExportParams) {
  const {
    selectedFormat,
    scopeMode,
    exportItems,
    examTitle,
    title,
    sessionName,
    gradingSystem,
    schoolId,
    schoolName,
    className,
    userName,
    userRole,
    isPaying,
    quotaContextId,
    onExport,
    onSuccess,
  } = params;

  const cleanSchool = (schoolName || 'School').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  const cleanTitle = (examTitle || title || 'Assessment').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();

  // Naming convention: School - Assessment - (Individual Candidate or Class Name)
  let targetEntity = '';
  if (scopeMode === 'custom' && exportItems.length === 1) {
    targetEntity = (exportItems[0].name || 'Candidate').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  } else {
    targetEntity = (className || exportItems[0]?.className || 'Class Results').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim();
  }

  const baseFilename = `${cleanSchool} - ${cleanTitle} - ${targetEntity}`;

  if (selectedFormat === 'excel') {
    const rows = formatStudentResultsForSpreadsheet(exportItems, gradingSystem, sessionName);
    exportToExcel(rows, baseFilename, cleanTitle);
  } else if (selectedFormat === 'csv') {
    const rows = formatStudentResultsForSpreadsheet(exportItems, gradingSystem, sessionName);
    exportToCSV(rows, baseFilename);
  } else {
    // PDF delegation
    await onExport(scopeMode, exportItems, selectedFormat, isPaying);
  }

  // Count usage for free tier users
  if (!isPaying) {
    incrementMonthlyExportUsage(quotaContextId);
  }

  // Dispatch leadership notification
  if (schoolId) {
    dispatchExportLeadershipNotification({
      schoolId,
      actorName: userName || 'Administrator',
      actorRole: userRole || 'ADMIN',
      resourceTitle: examTitle || title || 'Assessment',
      recordCount: exportItems.length,
      format: selectedFormat.toUpperCase() as 'PDF' | 'EXCEL' | 'CSV',
    }).catch((err) => console.warn('Leadership notification dispatch error:', err));
  }

  onSuccess();
}
