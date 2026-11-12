import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { financeService } from "@/lib/api/services/financeService";
import {
  PublishedResultGroup,
  DirectAccessPassState,
  getTermLabel,
} from "../types/transcript.types";

interface UseTranscriptClearanceParams {
  studentId: string;
  transcriptFee: number;
  isGraduated: boolean;
  isSchoolPaidPlan: boolean;
  results: PublishedResultGroup[];
  selectedSessionId: string;
  selectedTermFilter: string;
  auditData: Record<string, unknown> | null | undefined;
  refetchAudit: () => void;
}

export function useTranscriptClearance(params: UseTranscriptClearanceParams) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    studentId,
    transcriptFee,
    isGraduated,
    isSchoolPaidPlan,
    results,
    selectedSessionId,
    selectedTermFilter,
    auditData,
    refetchAudit,
  } = params;

  const [isExporting, setIsExporting] = useState(false);
  const [localTranscriptDownloads, setLocalTranscriptDownloads] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [unlockedClearances, setUnlockedClearances] = useState<Set<string>>(
    new Set(),
  );
  const [paymentTargetSessionId, setPaymentTargetSessionId] = useState("");
  const [paymentTargetTerm, setPaymentTargetTerm] = useState("");
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [directAccessPass, setDirectAccessPass] =
    useState<DirectAccessPassState | null>(null);
  const [isEmailingPass, setIsEmailingPass] = useState(false);
  const [isResendingLink, setIsResendingLink] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  // Verify ?pass=... or Flutterwave/Paystack callback on mount/redirect, or auto-restore saved 30-day pass from localStorage
  useEffect(() => {
    const txRef = searchParams.get("tx_ref") || searchParams.get("reference") || searchParams.get("trxref");
    const transactionId = searchParams.get("transaction_id");
    const flwStatus = searchParams.get("status");
    const passParam = searchParams.get("pass");

    if (passParam) {
      financeService
        .verifyTranscriptPass(passParam, studentId || undefined)
        .then((res) => {
          if (
            res &&
            res.valid &&
            (!res.studentId || !studentId || res.studentId === studentId)
          ) {
            setDirectAccessPass({
              token: passParam,
              expiresAt: res.expiresAt || "",
              sessionId: res.sessionId,
              term: res.term,
            });
            const targetKey = `${res.sessionId || "ALL"}_${res.term || "ALL"}`;
            setUnlockedClearances((prev) => new Set(prev).add(targetKey));
            if (studentId) {
              localStorage.setItem(
                `transcript_access_pass_${studentId}`,
                passParam,
              );
            }
            toast.success(
              "Official 30-Day Clearance Pass validated! Your certified transcript is unlocked.",
            );
          } else {
            toast.error(
              res?.error ||
              "This 30-day access pass is invalid or belongs to a different scholar.",
            );
          }
        })
        .catch(() => {
          toast.error("Could not validate this 30-day transcript access pass.");
        });
    } else if (!txRef && studentId && typeof window !== "undefined") {
      // Auto-restore persisted 30-day pass from localStorage on normal page visits/reloads
      const storedPass = localStorage.getItem(`transcript_access_pass_${studentId}`);
      if (storedPass) {
        financeService
          .verifyTranscriptPass(storedPass, studentId)
          .then((res) => {
            if (
              res &&
              res.valid &&
              (!res.studentId || res.studentId === studentId)
            ) {
              setDirectAccessPass({
                token: storedPass,
                expiresAt: res.expiresAt || "",
                sessionId: res.sessionId,
                term: res.term,
              });
              const targetKey = `${res.sessionId || "ALL"}_${res.term || "ALL"}`;
              setUnlockedClearances((prev) => new Set(prev).add(targetKey));
            } else {
              localStorage.removeItem(`transcript_access_pass_${studentId}`);
            }
          })
          .catch(() => {
            // Leave storedPass intact on transient network failure
          });
      }
    }

    if (!txRef) return;
    if (flwStatus === "cancelled" || flwStatus === "failed") {
      toast.error(
        "Clearance payment was cancelled or failed. You may retry at any time.",
      );
      router.replace("/dashboard/student/transcript");
      return;
    }

    let isMounted = true;
    const verifyTransaction = async () => {
      try {
        toast.info(
          "Verifying your transcript clearance payment...",
          { autoClose: 3500 },
        );
        const res = await financeService.verifyPayment(
          txRef,
          transactionId || undefined,
        );
        if (!isMounted) return;
        if (res?.success) {
          toast.success(
            "Transcript clearance confirmed! 30-day direct access pass generated.",
          );
          if (res.data?.accessPass) {
            setDirectAccessPass(res.data.accessPass);
            const targetKey = `${res.data.accessPass.sessionId || "ALL"}_${res.data.accessPass.term || "ALL"}`;
            setUnlockedClearances((prev) => new Set(prev).add(targetKey));
            if (studentId) {
              localStorage.setItem(
                `transcript_access_pass_${studentId}`,
                res.data.accessPass.token,
              );
            }
          }
          refetchAudit();
          if (res.data?.accessPass?.token) {
            router.replace(
              `/dashboard/student/transcript?pass=${encodeURIComponent(res.data.accessPass.token)}`,
            );
            return;
          }
          router.replace("/dashboard/student/transcript");
        } else {
          toast.error(
            "Could not verify clearance payment automatically. Please refresh or contact support.",
          );
          router.replace("/dashboard/student/transcript");
        }
      } catch {
        if (!isMounted) return;
        refetchAudit();
        router.replace("/dashboard/student/transcript");
      }
    };
    verifyTransaction();
    return () => {
      isMounted = false;
    };
  }, [searchParams, router, refetchAudit, studentId]);

  const auditPayments = useMemo(() => {
    const paymentStats = auditData?.paymentStats as
      | { payments?: Array<Record<string, unknown>> }
      | undefined;
    return paymentStats?.payments || [];
  }, [auditData]);

  const paidTranscriptCount = useMemo(() => {
    const list = auditPayments.filter(
      (p) =>
        (p.status === "SUCCESS" || p.status === "PAID") &&
        (p.paymentType === "TRANSCRIPT" ||
          p.term === "All Terms" ||
          String(p.session).includes("Session")),
    );
    // Avoid double-counting the same payment when both auditPayments (server) and unlockedClearances (client state) reflect it
    if (list.length > 0) {
      return list.length;
    }
    return unlockedClearances.size > 0 ? unlockedClearances.size : 0;
  }, [auditPayments, unlockedClearances]);

  const totalTranscriptDownloads = useMemo(() => {
    const downloadStats = auditData?.downloadStats as
      | { recentDownloads?: Array<Record<string, unknown>> }
      | undefined;
    const serverCount = (downloadStats?.recentDownloads || []).filter(
      (d) =>
        String(d.fileName || "")
          .toLowerCase()
          .includes("transcript") || d.fileType === "TRANSCRIPT_DOWNLOAD",
    ).length;
    return Math.max(serverCount, localTranscriptDownloads);
  }, [auditData, localTranscriptDownloads]);

  const hasDownloadRemaining = useMemo(() => {
    if (!isGraduated) return true;
    return (
      paidTranscriptCount > 0 && totalTranscriptDownloads < paidTranscriptCount
    );
  }, [isGraduated, paidTranscriptCount, totalTranscriptDownloads]);

  // Tier rules:
  // 1. Graduated students ALWAYS require clearance payment per term/session.
  // 2. Schools on Free Tier (!isSchoolPaidPlan) do not have complimentary platform access; requires clearance.
  // 3. Active students in a Paid Plan school only require payment if school set transcriptFee > 0.
  const requiresPayment = useMemo(() => {
    if (isGraduated) return true;
    if (!isSchoolPaidPlan) return true;
    return transcriptFee > 0;
  }, [isGraduated, isSchoolPaidPlan, transcriptFee]);

  const isTermUnlocked = useCallback(
    (sId: string, termVal: string): boolean => {
      if (!requiresPayment) return true;
      if (!directAccessPass) return false;
      if (directAccessPass.expiresAt) {
        const expiry = new Date(directAccessPass.expiresAt).getTime();
        if (Date.now() > expiry) return false;
      }
      const passSession = directAccessPass.sessionId || "ALL";
      const passTerm = directAccessPass.term || "ALL";
      const matchingResultGroup = results.find(
        (r) => r.sessionId === sId || r.session?.id === sId || r.session?.name === sId,
      );
      const targetSessionName = matchingResultGroup?.session?.name || "";
      const targetSessionUuid = matchingResultGroup?.sessionId || matchingResultGroup?.session?.id || "";

      const sessionMatches =
        passSession === "ALL" ||
        passSession === "All Sessions" ||
        passSession === sId ||
        (Boolean(targetSessionName) && passSession === targetSessionName) ||
        (Boolean(targetSessionUuid) && passSession === targetSessionUuid);

      const termMatches =
        passTerm === "ALL" ||
        passTerm === "All Terms" ||
        passTerm === termVal ||
        passTerm === getTermLabel(termVal);
      return sessionMatches && termMatches;
    },
    [requiresPayment, directAccessPass, results],
  );

  const recentClearancePayments = useMemo(() => {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return auditPayments.filter((p) => {
      if (p.status !== "SUCCESS" && p.status !== "PAID") return false;
      const isTranscript =
        p.paymentType === "TRANSCRIPT" ||
        p.term === "All Terms" ||
        String(p.session).includes("Session");
      if (!isTranscript) return false;
      const paidTime = p.paidAt
        ? new Date(String(p.paidAt)).getTime()
        : p.createdAt
          ? new Date(String(p.createdAt)).getTime()
          : 0;
      return now - paidTime <= thirtyDaysMs;
    });
  }, [auditPayments]);

  const isCurrentViewUnlocked = useMemo(() => {
    if (!requiresPayment) return true;
    if (results.length === 0) return false;
    if (selectedSessionId !== "ALL" && selectedTermFilter !== "ALL") {
      return isTermUnlocked(selectedSessionId, selectedTermFilter);
    }
    if (selectedSessionId !== "ALL") {
      const sessionTerms = results
        .filter((r) => r.sessionId === selectedSessionId)
        .map((r) => r.term);
      return (
        sessionTerms.length > 0 &&
        sessionTerms.every((t) => isTermUnlocked(selectedSessionId, t))
      );
    }
    if (selectedTermFilter !== "ALL") {
      const termMatches = results.filter((r) => r.term === selectedTermFilter);
      return (
        termMatches.length > 0 &&
        termMatches.every((r) =>
          isTermUnlocked(r.sessionId || "current-session", selectedTermFilter),
        )
      );
    }
    return (
      results.length > 0 &&
      results.every((r) =>
        isTermUnlocked(r.sessionId || "current-session", r.term),
      )
    );
  }, [
    requiresPayment,
    selectedSessionId,
    selectedTermFilter,
    results,
    isTermUnlocked,
  ]);

  const hasAnyUnlockedTerm = useMemo(() => {
    if (!requiresPayment) return true;
    if (results.length === 0) return false;
    return results.some((r) =>
      isTermUnlocked(r.sessionId || "current-session", r.term),
    );
  }, [requiresPayment, results, isTermUnlocked]);

  return {
    isExporting,
    setIsExporting,
    localTranscriptDownloads,
    setLocalTranscriptDownloads,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    unlockedClearances,
    setUnlockedClearances,
    paymentTargetSessionId,
    setPaymentTargetSessionId,
    paymentTargetTerm,
    setPaymentTargetTerm,
    isPayingOnline,
    setIsPayingOnline,
    copiedField,
    setCopiedField,
    directAccessPass,
    setDirectAccessPass,
    isEmailingPass,
    setIsEmailingPass,
    isResendingLink,
    setIsResendingLink,
    isRestoreModalOpen,
    setIsRestoreModalOpen,
    restoreInput,
    setRestoreInput,
    isRestoring,
    setIsRestoring,
    paidTranscriptCount,
    totalTranscriptDownloads,
    hasDownloadRemaining,
    requiresPayment,
    isTermUnlocked,
    recentClearancePayments,
    isCurrentViewUnlocked,
    hasAnyUnlockedTerm,
  };
}
