"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { isSchoolOnPayingPlan } from '@/utils/subscriptionPlanCheck';
import {
  getMonthlyExportUsage,
  incrementMonthlyExportUsage,
  FREE_TIER_MONTHLY_EXPORT_LIMIT,
} from '@/utils/exportQuotaManager';
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';

export interface RoleResultExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPdf: (isPaying: boolean) => Promise<void>;
  isExporting: boolean;
  resultTitle: string;
  studentName: string;
  className?: string;
  sessionName?: string;
  term?: string;
  school?: unknown;
  role: 'STUDENT' | 'PARENT' | 'TEACHER';
}

/**
 * Universal Reusable Export Modal for Student, Parent, and Teacher roles.
 * Enforces:
 * - Free/Non-paying tier: Single result PDF without verified leadership signatures, 10 downloads/month cap.
 * - Premium tier: Institutional report card with verified digital signatures and unlimited downloads.
 */
export const RoleResultExportModal: React.FC<RoleResultExportModalProps> = ({
  isOpen,
  onClose,
  onExportPdf,
  isExporting,
  resultTitle,
  studentName,
  className,
  sessionName,
  term,
  school,
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
  };
  const schoolId = schoolObj.id || schoolObj.schoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolObj) || (user?.plan && user.plan.toUpperCase() !== 'FREE')
  );
  const quotaContextId = schoolId || user?.id || 'role_context';
  const [quota, setQuota] = useState(() => getMonthlyExportUsage(quotaContextId));
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setQuota(getMonthlyExportUsage(quotaContextId));
    }
  }, [isOpen, quotaContextId]);

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(`Monthly free limit of ${FREE_TIER_MONTHLY_EXPORT_LIMIT} downloads reached. Please contact administration to upgrade.`);
      return;
    }

    setIsProcessing(true);
    try {
      await onExportPdf(isPaying);

      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
        setQuota(getMonthlyExportUsage(quotaContextId));
      }

      if (schoolId) {
        dispatchExportLeadershipNotification({
          schoolId,
          actorName: user?.name || studentName || 'Learner',
          actorRole: role,
          resourceTitle: resultTitle,
          recordCount: 1,
          format: 'PDF',
        }).catch((err) => console.warn('Leadership audit notification deferred:', err));
      }

      toast.success('Result PDF downloaded successfully.');
      onClose();
    } catch (err: unknown) {
      console.error('Role result export error:', err);
      toast.error('Failed to download report.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = isExporting || isProcessing;
  const isFreeExhausted = !isPaying && quota.remaining <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            Download Academic Report Card
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {resultTitle} • {studentName} {className ? `(${className})` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quota Strip */}
          {isPaying ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Verified Institutional Endorsement: Official signature included on download.</span>
            </div>
          ) : (
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${isFreeExhausted
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  {isFreeExhausted ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <FileText className="w-4 h-4 text-primary" />}
                  Free Monthly Downloads: {quota.used}/{quota.limit} used
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">{quota.remaining} left</span>
              </div>
              <p className="text-[11px] opacity-80">
                Non-paying schools can download up to 10 standard report sheets per month. Official digital signatures are omitted on free accounts.
              </p>
            </div>
          )}

          {/* Document Summary Card */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Student Name</span>
              <span className="font-bold text-foreground">{studentName}</span>
            </div>
            {className && (
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Class</span>
                <span className="font-bold text-foreground">{className}</span>
              </div>
            )}
            {sessionName && (
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Academic Session</span>
                <span className="font-bold text-foreground">{sessionName}</span>
              </div>
            )}
            {term && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Academic Term</span>
                <span className="font-bold text-foreground">{term}</span>
              </div>
            )}
          </div>
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
            disabled={loading || isFreeExhausted}
            onClick={handleExport}
            className="sm:w-auto w-full text-xs font-semibold gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Preparing PDF...
              </>
            ) : isFreeExhausted ? (
              "Monthly Quota Exceeded (10/10)"
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download PDF Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
