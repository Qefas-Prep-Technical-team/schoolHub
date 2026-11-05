import { format } from "date-fns";
import { toast } from "react-toastify";
import { financeService } from "@/lib/api/services/financeService";
import { generatePDF } from "@/utils/pdfGenerator";
import { GradingRule } from "@/utils/gradingSystem";
import {
  PublishedResultGroup,
  SignatureSlotInfo,
  DirectAccessPassState,
  TranscriptStatsSummary,
  AFFECTIVE_TRAITS,
  PSYCHOMOTOR_SKILLS,
  getTermLabel,
  getGradeLetter,
  getGradePoint,
  getRemark,
} from "../types/transcript.types";

interface UseTranscriptActionsParams {
  studentId: string;
  studentProfile: Record<string, unknown> | null | undefined;
  user: Record<string, unknown> | null | undefined;
  schoolId: string;
  schoolName: string;
  schoolMotto: string;
  schoolLocation: string;
  schoolLogoUrl: string | null;
  gradingSystem: GradingRule[] | null | undefined;
  transcriptFee: number;
  isFeeLoading?: boolean;
  isGraduated: boolean;
  filteredResults: PublishedResultGroup[];
  availableSessions: Array<{ id: string; name: string }>;
  selectedSessionId: string;
  selectedTermFilter: string;
  transcriptStats: TranscriptStatsSummary;
  activeEvalGroup: PublishedResultGroup | undefined;
  evalTerm: "FIRST" | "SECOND" | "THIRD";
  serverEvaluation: Record<string, unknown> | null | undefined;
  enrolledClass: string;
  principalSlot: SignatureSlotInfo;
  registrarSlot: SignatureSlotInfo;
  requiresPayment: boolean;
  isCurrentViewUnlocked: boolean;
  hasDownloadRemaining: boolean;
  paymentTargetSessionId: string;
  setPaymentTargetSessionId: (val: string) => void;
  paymentTargetTerm: string;
  setPaymentTargetTerm: (val: string) => void;
  setIsPaymentModalOpen: (val: boolean) => void;
  setIsPayingOnline: (val: boolean) => void;
  setIsExporting: (val: boolean) => void;
  setLocalTranscriptDownloads: React.Dispatch<React.SetStateAction<number>>;
  setCopiedField: (val: string | null) => void;
  directAccessPass: DirectAccessPassState | null;
  setDirectAccessPass: (val: DirectAccessPassState | null) => void;
  setUnlockedClearances: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsEmailingPass: (val: boolean) => void;
  setIsResendingLink: (val: boolean) => void;
  restoreInput: string;
  setRestoreInput: (val: string) => void;
  setIsRestoring: (val: boolean) => void;
  setIsRestoreModalOpen: (val: boolean) => void;
  recentClearancePayments: Array<Record<string, unknown>>;
  refetchAudit: () => void;
  recordDownloadMutation: {
    mutateAsync: (payload: {
      fileName: string;
      fileType: string;
    }) => Promise<unknown>;
  };
}

export function useTranscriptActions(p: UseTranscriptActionsParams) {
  const effectiveFee =
    p.transcriptFee > 0 ? p.transcriptFee : p.isFeeLoading ? 0 : 5000;

  const openPaymentModalForCurrentScope = () => {
    p.setPaymentTargetSessionId(
      p.selectedSessionId !== "ALL"
        ? p.selectedSessionId
        : p.availableSessions[0]?.id || "",
    );
    p.setPaymentTargetTerm(
      p.selectedTermFilter !== "ALL" ? p.selectedTermFilter : "FIRST",
    );
    p.setIsPaymentModalOpen(true);
  };

  const handleDownloadPDF = async () => {
    if (p.requiresPayment && !p.isCurrentViewUnlocked) {
      toast.error(
        `Official transcript clearance required. Please complete payment of ₦${effectiveFee.toLocaleString()} to unlock.`,
      );
      openPaymentModalForCurrentScope();
      return;
    }
    if (p.isGraduated && !p.hasDownloadRemaining) {
      toast.error(
        `You have already downloaded your official copy (1/1 used). To generate an additional copy, please complete a new clearance payment of ₦${effectiveFee.toLocaleString()}.`,
      );
      openPaymentModalForCurrentScope();
      return;
    }
    if (p.filteredResults.length === 0) {
      toast.warning("No published records available for the selected session.");
      return;
    }

    p.setIsExporting(true);
    try {
      const buildTableData = (termGroup: PublishedResultGroup) => {
        return (termGroup.subjectResults || []).map((s) => {
          const subName = s.subject?.name || "Subject";
          const subCode = s.subject?.code || "SUB";
          const asst =
            s.scoresRevealed && s.assignmentScore != null
              ? String(s.assignmentScore)
              : "—";
          const quiz =
            s.scoresRevealed && s.quizScore != null ? String(s.quizScore) : "—";
          const ca =
            s.scoresRevealed && s.caScore != null ? String(s.caScore) : "—";
          const exam =
            s.scoresRevealed && s.examScore != null ? String(s.examScore) : "—";
          const effectiveTotal =
            s.totalScore ??
            (s.assignmentScore != null ||
              s.quizScore != null ||
              s.caScore != null ||
              s.examScore != null
              ? (s.assignmentScore || 0) +
              (s.quizScore || 0) +
              (s.caScore || 0) +
              (s.examScore || 0)
              : null);
          const total =
            s.scoresRevealed && effectiveTotal != null
              ? `${effectiveTotal}%`
              : "Pending";
          const grade = s.scoresRevealed
            ? getGradeLetter(effectiveTotal ?? null, p.gradingSystem)
            : "—";
          const gp = s.scoresRevealed
            ? getGradePoint(effectiveTotal ?? null, p.gradingSystem).toFixed(1)
            : "—";
          const remark = s.scoresRevealed
            ? getRemark(effectiveTotal ?? null, p.gradingSystem)
            : "Pending";
          return [subCode, subName, asst, quiz, ca, exam, total, grade, gp, remark];
        });
      };

      const tableHeaders = [
        ["CODE", "COURSE / SUBJECT", "ASST", "QUIZ", "CA", "EXAM", "TOTAL", "GRADE", "GP", "REMARK"],
      ];
      const studentCode = String(p.studentProfile?.studentCode || "Scholar");
      const studentName = String(p.studentProfile?.name || "Scholar");
      const deptObj = p.studentProfile?.department as
        | { name?: string }
        | undefined;

      await generatePDF({
        title: "OFFICIAL ACADEMIC TRANSCRIPT",
        filename: `${studentCode}_Academic_Transcript.pdf`,
        schoolProfile: {
          name: p.schoolName,
          motto: p.schoolMotto,
          logo: p.schoolLogoUrl || "/schoolhub.png",
          schoolLogo: p.schoolLogoUrl || "/schoolhub.png",
          address: p.schoolLocation,
        },
        metaData: [
          { label: "Student Name", value: studentName },
          { label: "Student Code", value: studentCode },
          { label: "Department", value: deptObj?.name || p.enrolledClass },
          {
            label: "Cumulative CGPA",
            value: `${p.transcriptStats.cgpa} (${p.transcriptStats.cgpaGrade})`,
          },
          { label: "Academic Standing", value: p.transcriptStats.academicStanding },
          {
            label: "Transcript Ref",
            value: `TRX-${studentCode.toUpperCase()}-${new Date().getFullYear()}`,
          },
          { label: "Issued Date", value: format(new Date(), "MMMM d, yyyy") },
        ],
        tableHeaders,
        tableData: buildTableData(p.filteredResults[0]),
        additionalTables: p.filteredResults.slice(1).map((group) => ({
          title: `${group.session?.name || "Session"} — ${getTermLabel(group.term)} (${group.class?.name || "Cohort"})`,
          headers: tableHeaders,
          data: buildTableData(group),
        })),
        orientation: "portrait",
        studentPhotoUrl:
          (p.studentProfile?.profileImage as string | undefined) || undefined,
        behavioralEvaluation: {
          sessionName: p.activeEvalGroup?.session?.name || "Academic Session",
          termLabel: getTermLabel(p.evalTerm),
          className: p.activeEvalGroup?.class?.name || p.enrolledClass,
          affective: AFFECTIVE_TRAITS.map((t) => ({
            trait: t.label,
            score: Number(p.serverEvaluation?.[t.key] ?? 5),
          })),
          psychomotor: PSYCHOMOTOR_SKILLS.map((s) => ({
            trait: s.label,
            score: Number(p.serverEvaluation?.[s.key] ?? 5),
          })),
          teacherRemark:
            String(p.serverEvaluation?.teacherRemark || "").trim() ||
            "Demonstrates commendable academic diligence and consistent respect for institutional principles.",
          principalRemark:
            String(p.serverEvaluation?.principalRemark || "").trim() ||
            "Certified genuine academic achievement and praiseworthy character appraisal.",
          cgpa: p.transcriptStats.cgpa,
          cgpaGrade: p.transcriptStats.cgpaGrade,
        },
        signatures: {
          left: {
            label: p.registrarSlot.roleTitle,
            name: p.registrarSlot.subtitle,
            signatureUrl: p.registrarSlot.signatureUrl,
          },
          right: {
            label: p.principalSlot.roleTitle,
            name: p.principalSlot.subtitle,
            signatureUrl: p.principalSlot.signatureUrl,
          },
        },
      });

      toast.success("Official Multi-Page Transcript PDF exported successfully!");
      await p.recordDownloadMutation.mutateAsync({
        fileName: `${studentCode}_Academic_Transcript.pdf`,
        fileType: "TRANSCRIPT_DOWNLOAD",
      });
      p.setLocalTranscriptDownloads((prev) => prev + 1);
      p.refetchAudit();
    } catch {
      toast.error(
        "Failed to generate PDF. You can also use Print Copy to save as PDF.",
      );
    } finally {
      p.setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (p.requiresPayment && !p.isCurrentViewUnlocked) {
      toast.error(
        `Official transcript clearance required. Please complete payment of ₦${effectiveFee.toLocaleString()} to unlock.`,
      );
      openPaymentModalForCurrentScope();
      return;
    }
    if (p.isGraduated && !p.hasDownloadRemaining) {
      toast.error(
        `You have already downloaded/printed your official copy (1/1 used). To generate an additional copy, please complete a new clearance payment of ₦${effectiveFee.toLocaleString()}.`,
      );
      openPaymentModalForCurrentScope();
      return;
    }
    window.print();
  };

  const handleInitiateOnlinePayment = async () => {
    if (!p.schoolId) {
      toast.error("Institution identification missing");
      return;
    }
    if (!p.paymentTargetSessionId.trim()) {
      toast.error("Please select an academic session before proceeding.");
      return;
    }
    if (!p.paymentTargetTerm.trim()) {
      toast.error("Please select an academic term before proceeding.");
      return;
    }

    try {
      p.setIsPayingOnline(true);
      const res = await financeService.initiateTranscriptPayment(p.schoolId, {
        studentId: p.studentId,
        sessionId: p.paymentTargetSessionId,
        term: p.paymentTargetTerm,
        amount: effectiveFee,
        email: (p.user?.email as string) || undefined,
        name: String(p.studentProfile?.name || p.user?.name || "Student"),
      });

      if (res?.checkoutUrl) {
        toast.info("Connecting to Flutterwave secure checkout...");
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Unable to generate payment checkout link. Please try again.");
        p.setIsPayingOnline(false);
      }
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initiate online payment",
      );
      p.setIsPayingOnline(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      p.setCopiedField(field);
      toast.info(`Copied ${field} to clipboard`);
      setTimeout(() => p.setCopiedField(null), 2000);
    }
  };

  const handleCopyAccessLink = () => {
    const token = p.directAccessPass?.token || "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const link = token
      ? `${origin}/dashboard/student/transcript?pass=${encodeURIComponent(token)}`
      : window.location.href;
    handleCopy(link, "accessLink");
  };

  const handleEmailAccessLink = async () => {
    if (!p.directAccessPass?.token) {
      toast.error("No active 30-day access pass token available.");
      return;
    }
    const targetEmail = String(
      p.studentProfile?.email || p.user?.email || "",
    ).trim();
    if (!targetEmail) {
      toast.error("No email address found for your account.");
      return;
    }
    try {
      p.setIsEmailingPass(true);
      await financeService.emailTranscriptPass({
        studentId: p.studentId,
        schoolId: p.schoolId,
        email: targetEmail,
        token: p.directAccessPass.token,
        reference:
          (p.recentClearancePayments[0]?.reference as string) || undefined,
      });
      toast.success(`30-day direct access link sent to ${targetEmail}!`);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send direct access link",
      );
    } finally {
      p.setIsEmailingPass(false);
    }
  };

  const handleResendLink = async (reference?: string) => {
    const targetEmail = String(
      p.studentProfile?.email || p.user?.email || "",
    ).trim();
    if (!targetEmail) {
      toast.error("No registered email address found for your scholar account.");
      return;
    }
    try {
      p.setIsResendingLink(true);
      await financeService.emailTranscriptPass({
        studentId: p.studentId,
        schoolId: p.schoolId,
        email: targetEmail,
        reference:
          reference ||
          (p.recentClearancePayments[0]?.reference as string) ||
          undefined,
        token: p.directAccessPass?.token || undefined,
      });
      toast.success(
        `Transcript preview & download link sent to ${targetEmail}!`,
      );
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend transcript preview link",
      );
    } finally {
      p.setIsResendingLink(false);
    }
  };

  const handleRestoreAccess = async () => {
    const trimmed = p.restoreInput.trim();
    if (!trimmed) {
      toast.error("Please enter your transaction reference or pass token");
      return;
    }
    try {
      p.setIsRestoring(true);
      let tokenToTest = trimmed;
      if (trimmed.includes("pass=")) {
        try {
          const u = new URL(trimmed);
          tokenToTest = u.searchParams.get("pass") || trimmed;
        } catch {
          // fallback
        }
      }

      const passRes = await financeService
        .verifyTranscriptPass(tokenToTest, p.studentId || undefined)
        .catch(() => null);
      if (
        passRes &&
        passRes.valid &&
        (!passRes.studentId || !p.studentId || passRes.studentId === p.studentId)
      ) {
        p.setDirectAccessPass({
          token: tokenToTest,
          expiresAt: passRes.expiresAt || "",
          sessionId: passRes.sessionId,
          term: passRes.term,
        });
        const targetKey = `${passRes.sessionId || "ALL"}_${passRes.term || "ALL"}`;
        p.setUnlockedClearances((prev) => new Set(prev).add(targetKey));
        if (p.studentId) {
          localStorage.setItem(
            `transcript_access_pass_${p.studentId}`,
            tokenToTest,
          );
        }
        toast.success("30-Day Clearance Pass validated! Official records unlocked.");
        p.setIsRestoreModalOpen(false);
        p.setRestoreInput("");
        return;
      }

      const txRes = await financeService.verifyPayment(trimmed).catch(() => null);
      if (txRes && txRes.success) {
        if (txRes.data?.accessPass) {
          p.setDirectAccessPass(txRes.data.accessPass);
          const targetKey = `${txRes.data.accessPass.sessionId || "ALL"}_${txRes.data.accessPass.term || "ALL"}`;
          p.setUnlockedClearances((prev) => new Set(prev).add(targetKey));
          if (p.studentId) {
            localStorage.setItem(
              `transcript_access_pass_${p.studentId}`,
              txRes.data.accessPass.token,
            );
          }
        }
        p.refetchAudit();
        toast.success("Transcript clearance confirmed! Academic records unlocked.");
        p.setIsRestoreModalOpen(false);
        p.setRestoreInput("");
        return;
      }

      toast.error(
        "Could not verify any clearance record for your account with that code or token.",
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Failed to restore clearance access");
    } finally {
      p.setIsRestoring(false);
    }
  };

  return {
    effectiveFee,
    isFeeLoading: p.isFeeLoading ?? false,
    openPaymentModalForCurrentScope,
    handleDownloadPDF,
    handlePrint,
    handleInitiateOnlinePayment,
    handleCopy,
    handleCopyAccessLink,
    handleEmailAccessLink,
    handleResendLink,
    handleRestoreAccess,
  };
}

