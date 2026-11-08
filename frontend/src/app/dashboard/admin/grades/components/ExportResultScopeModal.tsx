"use client";

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { ExportFormatSelector, ExportFileFormat } from './export/ExportFormatSelector';
import { ExportScopeSelector, ExportScopeMode } from './export/ExportScopeSelector';
import { ExportStudentPicker, ExportStudentOption } from './export/ExportStudentPicker';
import { ExportQuotaBanner } from './export/ExportQuotaBanner';
import { ConnectedSchoolSignatureFetcher } from '@/components/signature/ConnectedSchoolSignatureFetcher';
import { executeExportWorkflow } from './export/exportWorkflowHandler';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { isSchoolOnPayingPlan } from '@/utils/subscriptionPlanCheck';
import {
  getMonthlyExportUsage,
  FREE_TIER_MONTHLY_EXPORT_LIMIT,
} from '@/utils/exportQuotaManager';

export type { ExportScopeMode, ExportStudentOption, ExportFileFormat };

export interface ExportResultScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (
    mode: ExportScopeMode,
    selectedList: ExportStudentOption[],
    format?: ExportFileFormat,
    isPaying?: boolean
  ) => Promise<void>;
  isExporting: boolean;
  students: ExportStudentOption[];
  currentStudentId?: string;
  title?: string;
  description?: string;
  primaryColor?: string;
  school?: unknown;
  examTitle?: string;
  className?: string;
  sessionName?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}

export const ExportResultScopeModal: React.FC<ExportResultScopeModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
  students,
  currentStudentId,
  title = "Export Assessment Results",
  description = "Select the export format and packaging options for official academic records.",
  school,
  examTitle,
  className,
  sessionName,
  role,
}) => {
  const { user } = useAuthStore();
  const schoolObj = (school || {}) as {
    id?: string;
    schoolId?: string;
    name?: string;
    plan?: string | null;
    subscriptionStatus?: string | null;
    isTrialActive?: boolean;
    subscriptionEnd?: string | Date | null;
    gradingSystem?: unknown;
  };
  const schoolId = schoolObj.id || schoolObj.schoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolObj) || (user?.plan && user.plan.toUpperCase() !== 'FREE')
  );

  const quotaContextId = schoolId || user?.id || 'default_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));

  React.useEffect(() => {
    if (isOpen) {
      setQuota(getMonthlyExportUsage(quotaContextId));
    }
  }, [isOpen, quotaContextId]);

  const [selectedFormat, setSelectedFormat] = useState<ExportFileFormat>('pdf');
  const [scopeMode, setScopeMode] = useState<ExportScopeMode>('combined_pdf');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentStudentId ? [currentStudentId] : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (currentStudentId) {
      setSelectedIds([currentStudentId]);
      if (isPaying) setScopeMode('custom');
    }
  }, [currentStudentId, isPaying]);

  React.useEffect(() => {
    if (!isPaying) {
      setSelectedFormat('pdf');
      setScopeMode('combined_pdf');
    }
  }, [isPaying]);

  const handleFormatChange = (fmt: ExportFileFormat) => {
    if (!isPaying && fmt !== 'pdf') {
      toast.info('Spreadsheet exports (.xlsx, .csv) are available exclusively on institutional paid plans.');
      return;
    }
    setSelectedFormat(fmt);
    if (fmt !== 'pdf' && scopeMode === 'all_zip') {
      setScopeMode('combined_pdf');
    }
  };

  const handleScopeChange = (mode: ExportScopeMode) => {
    if (!isPaying && mode !== 'combined_pdf') {
      toast.info('Individual archives (.zip) and custom selections are reserved for premium tiers.');
      return;
    }
    setScopeMode(mode);
  };

  const handleToggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const exportItems = useMemo(() => {
    if (scopeMode === 'custom') {
      return students.filter((s) => selectedIds.includes(s.id));
    }
    return students;
  }, [students, scopeMode, selectedIds]);

  const handleExportClick = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(`You have reached the monthly limit of ${FREE_TIER_MONTHLY_EXPORT_LIMIT} free exports for this month. Upgrade to unlimited premium exports.`);
      return;
    }

    if (scopeMode === 'custom' && selectedIds.length === 0) {
      toast.warning('Please select at least one student to export.');
      return;
    }

    if (exportItems.length === 0) {
      toast.warning('No student results available to export.');
      return;
    }

    setIsProcessing(true);
    try {
      await executeExportWorkflow({
        selectedFormat,
        scopeMode,
        exportItems,
        examTitle,
        title,
        sessionName,
        gradingSystem: schoolObj.gradingSystem,
        schoolId,
        schoolName: (schoolObj as any).name || (schoolObj as any).schoolName,
        className,
        userName: user?.name,
        userRole: role || user?.role || 'ADMIN',
        isPaying,
        quotaContextId,
        onExport,
        onSuccess: () => {
          if (!isPaying) setQuota(getMonthlyExportUsage(quotaContextId));
          toast.success(`Export completed successfully (${selectedFormat.toUpperCase()}).`);
          onClose();
        },
      });
    } catch (err: unknown) {
      console.error('Export error:', err);
      toast.error('An error occurred during export.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = isExporting || isProcessing;
  const isFreeExhausted = !isPaying && quota.remaining <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description} {className ? `• Class: ${className}` : ''} ({students.length} candidates)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={quota.limit}
            remaining={quota.remaining}
            userRole={role || user?.role || undefined}
          />

          <ExportFormatSelector
            selectedFormat={selectedFormat}
            onSelectFormat={handleFormatChange}
            disabled={loading}
            isPaying={isPaying}
          />

          <ExportScopeSelector
            scopeMode={scopeMode}
            onSelectScope={handleScopeChange}
            format={selectedFormat}
            totalStudents={students.length}
            disabled={loading}
            isPaying={isPaying}
          />

          {scopeMode === 'custom' && isPaying && (
            <ExportStudentPicker
              students={students}
              selectedIds={selectedIds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleStudent={handleToggleStudent}
              onSelectAll={() => setSelectedIds(students.map((s) => s.id))}
              onClearAll={() => setSelectedIds([])}
              disabled={loading}
            />
          )}

          {selectedFormat === 'pdf' && schoolId && isPaying && (
            <div className="pt-1">
              <ConnectedSchoolSignatureFetcher
                schoolId={schoolId}
                schoolProfile={schoolObj as any}
                variant="card"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="sm:w-auto w-full text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading || isFreeExhausted || (scopeMode === 'custom' && selectedIds.length === 0)}
            onClick={handleExportClick}
            className="sm:w-auto w-full text-xs font-semibold gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating {selectedFormat.toUpperCase()}...
              </>
            ) : isFreeExhausted ? (
              "Monthly Quota Exceeded (10/10)"
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Export {exportItems.length} {exportItems.length === 1 ? 'Record' : 'Records'} ({selectedFormat.toUpperCase()})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportResultScopeModal;
