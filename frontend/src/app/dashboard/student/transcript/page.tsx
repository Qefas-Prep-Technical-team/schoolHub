"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  useStudentProfile,
  useTermlyEvaluation,
  useStudentDownloadAudit,
  useRecordStudentDownload,
} from "@/lib/api/hooks/useStudent";
import { useMyPublishedResults } from "@/lib/api/hooks/useRecords";
import { useSchoolProfile, useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useSchoolAdmins } from "@/lib/api/hooks/useAdmin";
import { useSignaturesByUserIds, useActiveSignature } from "@/lib/api/hooks/useSignature";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { financeService } from "@/lib/api/services/financeService";
import { generatePDF } from "@/utils/pdfGenerator";
import { getGradeEvaluation, DEFAULT_GRADING_SYSTEM } from "@/utils/gradingSystem";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Download,
  Printer,
  School,
  Lock,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Building2,
  Copy,
  Check,
  Landmark,
  Filter,
  Unlock,
  Heart,
  MapPin,
  User,
  Quote,
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  RefreshCw,
  FileCheck,
  Wallet,
  Users,
  CheckCheck,
  ExternalLink,
} from "lucide-react";

interface SubjectResultItem {
  id?: string;
  scoresRevealed?: boolean;
  totalScore?: number | null;
  caScore?: number | null;
  examScore?: number | null;
  assignmentScore?: number | null;
  quizScore?: number | null;
  grade?: string | null;
  subject?: {
    id?: string;
    name?: string;
    code?: string;
  };
}

interface PublishedResultGroup {
  sessionId: string;
  term: string;
  subjectCount: number;
  revealedCount: number;
  class?: {
    id?: string;
    name?: string;
  };
  session?: {
    id?: string;
    name?: string;
  };
  subjectResults?: SubjectResultItem[];
}

function getTermLabel(term: string): string {
  const map: Record<string, string> = {
    FIRST: "1st Term",
    SECOND: "2nd Term",
    THIRD: "3rd Term",
  };
  return map[term] || term;
}

function getGradeLetter(total: number | null, customGradingSystem?: any[] | null): string {
  if (total == null) return "—";
  return getGradeEvaluation(total, customGradingSystem).grade;
}

function getGradePoint(total: number | null, customGradingSystem?: any[] | null): number {
  if (total == null || isNaN(total)) return 0;
  const evaluation = getGradeEvaluation(total, customGradingSystem);
  const grade = evaluation.grade.toUpperCase().trim();

  if (grade === "A+" || grade === "A1") return 5.0;
  if (grade === "A" || grade === "B2") return 4.5;
  if (grade === "B+" || grade === "B3") return 4.0;
  if (grade === "B" || grade === "C4") return 3.5;
  if (grade === "C+" || grade === "C5") return 3.0;
  if (grade === "C" || grade === "C6") return 2.5;
  if (grade === "D" || grade === "D7") return 1.5;
  if (grade === "E" || grade === "E8") return 1.0;
  if (grade === "F") return 0.5;
  if (grade === "F9") return 0.0;

  if (total >= 90) return 5.0;
  if (total >= 70) return 4.5;
  if (total >= 65) return 4.0;
  if (total >= 60) return 3.5;
  if (total >= 55) return 3.0;
  if (total >= 50) return 2.5;
  if (total >= 40) return 1.5;
  if (total >= 30) return 0.5;
  return 0.0;
}

function getRemark(total: number | null, customGradingSystem?: any[] | null): string {
  if (total == null) return "Pending";
  return getGradeEvaluation(total, customGradingSystem).remark;
}

function getGradeBadgeClass(grade: string): string {
  const g = grade.toUpperCase().trim();
  if (g.includes("A+") || g === "A1")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (g.startsWith("A"))
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  if (g.includes("B+"))
    return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800";
  if (g.startsWith("B"))
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  if (g.includes("C+"))
    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
  if (g.startsWith("C"))
    return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
  if (g.startsWith("D"))
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  if (g === "F" || g.startsWith("E"))
    return "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800";
  return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
}

function getCgpaGrade(cgpaNum: number, averageScore: number): string {
  if (averageScore >= 85 || cgpaNum >= 4.5) return "A";
  if (averageScore >= 75 || cgpaNum >= 3.75) return "A-";
  if (averageScore >= 70 || cgpaNum >= 3.5) return "B+";
  if (averageScore >= 65 || cgpaNum >= 3.0) return "B";
  if (averageScore >= 60 || cgpaNum >= 2.5) return "B-";
  if (averageScore >= 55 || cgpaNum >= 2.0) return "C+";
  if (averageScore >= 50 || cgpaNum >= 1.5) return "C";
  if (averageScore >= 45 || cgpaNum >= 1.0) return "D";
  return "F";
}

const AFFECTIVE_TRAITS = [
  { key: "attentiveness", label: "Attentiveness & Focus", desc: "Sustained attention in academic activities" },
  { key: "honesty", label: "Honesty & Integrity", desc: "Truthfulness in conduct and assignments" },
  { key: "neatness", label: "Neatness & Presentation", desc: "Personal grooming, books and workspace" },
  { key: "politeness", label: "Politeness & Courtesy", desc: "Respectful demeanor towards peers and staff" },
  { key: "punctuality", label: "Punctuality & Regularity", desc: "Timely arrival for classes and assemblies" },
  { key: "selfControl", label: "Self-Control & Temperament", desc: "Calmness and composure in social situations" },
  { key: "obedience", label: "Obedience & Compliance", desc: "Adherence to institutional rules and directives" },
  { key: "reliability", label: "Reliability & Dependability", desc: "Trustworthiness in carrying out assigned duties" },
  { key: "responsibility", label: "Sense of Responsibility", desc: "Accountability for personal actions and assets" },
  { key: "relationship", label: "Peer & Staff Relations", desc: "Harmonious interaction with school community" },
] as const;

const PSYCHOMOTOR_SKILLS = [
  { key: "handwriting", label: "Handwriting & Scripting", desc: "Legibility, neatness and style of handwriting" },
  { key: "handlingTools", label: "Handling Tools & Apparatus", desc: "Safe handling of laboratory and workshop equipment" },
  { key: "drawingPainting", label: "Drawing, Painting & Crafts", desc: "Creativity, artistic representation and design" },
  { key: "publicSpeaking", label: "Public Speaking & Oratory", desc: "Confidence, tone and poise in presentations" },
  { key: "speechFluency", label: "Speech Fluency & Diction", desc: "Clarity, articulation and vocabulary in communication" },
  { key: "sportsGames", label: "Sports, Games & Athletics", desc: "Physical dexterity, team play and sportsmanship" },
] as const;

export default function StudentTranscriptPage() {
  const { user } = useAuthStore();
  const { data: studentProfile, isLoading: isProfileLoading } = useStudentProfile();
  const { data: rawPublishedResults, isLoading: isResultsLoading } = useMyPublishedResults();
  const [isExporting, setIsExporting] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [activePageView, setActivePageView] = useState<"all" | "page1" | "page2">("all");
  const [selectedEvaluationIdx, setSelectedEvaluationIdx] = useState<number>(0);
  const printRef = useRef<HTMLDivElement>(null);

  const results = (rawPublishedResults as PublishedResultGroup[] | undefined) || [];

  // ── 1. School Profile & Affiliation ───────────────────────────────────────
  const isSchoolConnected = Boolean(
    studentProfile?.schoolId ||
    studentProfile?.school?.id ||
    (user?.schools && user.schools.length > 0)
  );

  const school = studentProfile?.school;
  const schoolId =
    studentProfile?.schoolId ||
    school?.id ||
    (user?.schools?.[0] as Record<string, unknown>)?.schoolId as string ||
    (user?.schools?.[0] as Record<string, unknown>)?.id as string;
  const { data: schoolProfile } = useSchoolProfile(schoolId || "");
  const schoolName = schoolProfile?.name || school?.name || "Institution";
  const schoolMotto =
    schoolProfile?.motto ||
    (school as Record<string, unknown>)?.motto as string ||
    "Empowering minds for a better tomorrow.";
  const schoolLocation =
    schoolProfile?.address ||
    (school as Record<string, unknown>)?.address as string ||
    "Official Institutional Record";
  const schoolLogoUrl =
    !logoLoadError && (schoolProfile?.logo || (school as Record<string, unknown>)?.logo as string)
      ? schoolProfile?.logo || (school as Record<string, unknown>)?.logo as string
      : null;
  const gradingSystem = schoolProfile?.gradingSystem || (school as Record<string, unknown>)?.gradingSystem as unknown;

  // ── School Settings & Configured Clearance Fee ────────────────────────────
  const { data: schoolSettings } = useSchoolSettings(schoolId || "");
  const transcriptFee = Number((schoolSettings as any)?.transcriptFee ?? (schoolProfile as any)?.settings?.transcriptFee ?? 5000);

  // ── Download Audit & Security Telemetry ────────────────────────────────────
  const studentId = studentProfile?.id || (user as any)?.id || "";
  const {
    data: auditData,
    isLoading: isAuditLoading,
    refetch: refetchAudit,
  } = useStudentDownloadAudit(studentId);
  const recordDownloadMutation = useRecordStudentDownload(studentId);
  const [localTranscriptDownloads, setLocalTranscriptDownloads] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── School Leadership & Endorsement Signatures ──────────────────────────
  const { data: schoolAdminsResponse } = useSchoolAdmins(schoolId || "");
  const schoolAdmins: Array<{ id: string; name: string; role?: string; adminRole?: string }> = useMemo(() => {
    const list: Array<{ id: string; name: string; role?: string; adminRole?: string }> = [];
    const seen = new Set<string>();

    const profileAdmins = (schoolProfile as any)?.admins || (school as any)?.admins || [];
    if (Array.isArray(profileAdmins)) {
      profileAdmins.forEach((sa: any) => {
        const uid = sa.adminId || sa.admin?.id || sa.id;
        if (uid && !seen.has(uid)) {
          seen.add(uid);
          list.push({
            id: uid,
            name: sa.admin?.name || sa.name || "School Administrator",
            role: sa.role || sa.admin?.role,
            adminRole: sa.role || sa.admin?.role,
          });
        }
      });
    }

    (schoolAdminsResponse?.data || []).forEach((a: any) => {
      if (a.id && !seen.has(a.id)) {
        seen.add(a.id);
        list.push(a);
      }
    });

    return list;
  }, [schoolProfile, school, schoolAdminsResponse]);

  const approvalInfo = useMemo(() => {
    for (const g of results) {
      const app = (g as any)?.approval || (g as any)?.paperLinks?.approval;
      if (app && app.status === "APPROVED") return app;
      for (const s of g.subjectResults || []) {
        const sApp = (s as any)?.approval || (s as any)?.paperLinks?.approval;
        if (sApp && sApp.status === "APPROVED") return sApp;
      }
    }
    return null;
  }, [results]);

  const candidateUserIds = useMemo(() => {
    const ids = new Set<string>();
    ids.add("admin-system");
    schoolAdmins.forEach((a) => {
      if (a.id) ids.add(String(a.id));
    });
    if (approvalInfo?.approvedById) ids.add(approvalInfo.approvedById);
    if (approvalInfo?.requestedById) ids.add(approvalInfo.requestedById);
    return Array.from(ids);
  }, [schoolAdmins, approvalInfo]);

  const { data: signaturesMap = {} } = useSignaturesByUserIds(candidateUserIds);
  const { data: systemAdminSignature } = useActiveSignature("admin-system");

  const { principalSlot, registrarSlot } = useMemo(() => {
    const getSigForId = (id?: string) => {
      if (!id) return null;
      const sig = signaturesMap[id];
      if (sig && (sig.signedUrl || (sig as any).dataUrl) && sig.isActive !== false) {
        return sig;
      }
      return null;
    };

    const getAnyAvailableSignature = () => {
      if (systemAdminSignature && (systemAdminSignature.signedUrl || (systemAdminSignature as any).dataUrl) && systemAdminSignature.isActive !== false) {
        return systemAdminSignature;
      }
      for (const sig of Object.values(signaturesMap)) {
        if (sig && (sig.signedUrl || (sig as any).dataUrl) && sig.isActive !== false) {
          return sig;
        }
      }
      return null;
    };

    const isPrincipal = (r: string) => r === "PRINCIPAL" || (r.includes("PRINCIPAL") && !r.includes("VICE"));
    const isVicePrincipal = (r: string) => r === "VICE_PRINCIPAL" || r.includes("VICE");
    const isOwner = (r: string) => r === "SCHOOL_OWNER" || r.includes("OWNER") || r.includes("PROPRIETOR");

    const principals = schoolAdmins.filter((a) => isPrincipal(String(a.adminRole || a.role || "").toUpperCase()));
    const vps = schoolAdmins.filter((a) => isVicePrincipal(String(a.adminRole || a.role || "").toUpperCase()));
    const owners = schoolAdmins.filter((a) => isOwner(String(a.adminRole || a.role || "").toUpperCase()));
    const registrars = schoolAdmins.filter((a) => String(a.adminRole || a.role || "").toUpperCase().includes("REGISTRAR"));

    const principalWithSig = principals.find((a) => !!getSigForId(a.id));
    const vpWithSig = vps.find((a) => !!getSigForId(a.id));
    const ownerWithSig = owners.find((a) => !!getSigForId(a.id));

    const chosenHead = principalWithSig || vpWithSig || ownerWithSig || principals[0] || vps[0] || owners[0] || {
      id: "head",
      name: "Principal / Head of Institution",
      adminRole: "PRINCIPAL",
    };

    const anyAvailableSig = getAnyAvailableSignature();

    const chosenSig = getSigForId(chosenHead.id);
    let headSigUrl = chosenSig?.signedUrl || anyAvailableSig?.signedUrl || undefined;
    if (!headSigUrl && approvalInfo?.signature) {
      headSigUrl = String(approvalInfo.signature).replace(/\s*\([^)]*\)$/, "").trim();
    }
    if (!headSigUrl) {
      headSigUrl = chosenHead.name || "Principal / Head of Institution";
    }

    const isHeadImg = !!(
      headSigUrl &&
      (headSigUrl.startsWith("data:") ||
        headSigUrl.startsWith("blob:") ||
        headSigUrl.startsWith("http") ||
        headSigUrl.startsWith("/"))
    );

    const roleUpper = String(chosenHead.adminRole || chosenHead.role || "").toUpperCase();
    const headTitle = isPrincipal(roleUpper)
      ? "Principal / Head of Institution"
      : isVicePrincipal(roleUpper)
      ? "Vice Principal / Academic Director"
      : isOwner(roleUpper)
      ? "School Owner / Proprietor"
      : "Principal / Head of Institution";

    const registrarWithSig = registrars.find((a) => !!getSigForId(a.id));
    const chosenReg = registrarWithSig || registrars[0] || { id: "reg", name: "Office of the Registrar" };
    const regSig = getSigForId(chosenReg.id);
    let regSigUrl = regSig?.signedUrl || (chosenSig ? anyAvailableSig?.signedUrl : undefined);
    const isRegImg = !!(
      regSigUrl &&
      (regSigUrl.startsWith("data:") ||
        regSigUrl.startsWith("blob:") ||
        regSigUrl.startsWith("http") ||
        regSigUrl.startsWith("/"))
    );

    return {
      principalSlot: {
        roleTitle: headTitle,
        subtitle: `${chosenHead.name} • ${schoolName}`,
        signatureUrl: headSigUrl,
        adminName: chosenHead.name,
        isImage: isHeadImg,
      },
      registrarSlot: {
        roleTitle: "Registrar / Academic Director",
        subtitle: `${chosenReg.name} • Office of Academic Records`,
        signatureUrl: regSigUrl,
        adminName: chosenReg.name,
        isImage: isRegImg,
      },
    };
  }, [schoolAdmins, signaturesMap, systemAdminSignature, approvalInfo, schoolName]);

  // ── Session & Term Filter States ──────────────────────────────────────────
  const [selectedSessionId, setSelectedSessionId] = useState<string>("ALL");
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("ALL");

  // ── Access Clearance & Paywall States ─────────────────────────────────────
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [unlockedSessions, setUnlockedSessions] = useState<Set<string>>(new Set());
  const [paymentTargetSessionId, setPaymentTargetSessionId] = useState<string>("ALL");
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ── Check Graduation Status & School Subscription ─────────────────────────
  const isGraduated = useMemo(() => {
    const sStatus = String((studentProfile as unknown as Record<string, unknown>)?.status || (user as unknown as Record<string, unknown>)?.status || "").toUpperCase();
    const gStatus = String((studentProfile as unknown as Record<string, unknown>)?.graduationStatus || "").toUpperCase();
    return sStatus === "GRADUATED" || sStatus === "ALUMNI" || gStatus === "GRADUATED";
  }, [studentProfile, user]);

  const isSchoolPaidPlan = useMemo(() => {
    const plan = String(schoolProfile?.plan || (school as any)?.plan || "").toUpperCase();
    const subStatus = String(schoolProfile?.subscriptionStatus || (school as any)?.subscriptionStatus || "").toUpperCase();
    const isTrial = Boolean(schoolProfile?.isTrialActive || (school as any)?.isTrialActive);
    return isTrial || subStatus === "ACTIVE" || (plan !== "FREE" && plan !== "");
  }, [schoolProfile, school]);

  // Clearance payments count:
  const paidTranscriptCount = useMemo(() => {
    const list = (auditData?.paymentStats?.payments || []).filter(
      (p) =>
        (p.status === "SUCCESS" || p.status === "PAID") &&
        (p.paymentType === "TRANSCRIPT" || p.term === "All Terms" || String(p.session).includes("Session"))
    );
    return list.length + (unlockedSessions.has("ALL") ? 1 : 0);
  }, [auditData, unlockedSessions]);

  const hasPaidTranscript = paidTranscriptCount > 0;

  // Transcript downloads count:
  const totalTranscriptDownloads = useMemo(() => {
    const serverCount = (auditData?.downloadStats?.recentDownloads || []).filter(
      (d) =>
        d.fileName?.toLowerCase().includes("transcript") ||
        (d as any).fileType === "TRANSCRIPT_DOWNLOAD"
    ).length;
    return Math.max(serverCount, localTranscriptDownloads);
  }, [auditData, localTranscriptDownloads]);

  // Single-use download rule: Graduated students can only download ONCE after they pay
  const hasDownloadRemaining = useMemo(() => {
    if (!isGraduated) return true;
    return hasPaidTranscript && totalTranscriptDownloads < paidTranscriptCount;
  }, [isGraduated, hasPaidTranscript, totalTranscriptDownloads, paidTranscriptCount]);

  // Preview Gating: Graduated student can only see the transcript if they have paid
  const isPreviewUnlocked = useMemo(() => {
    if (isGraduated) {
      return hasPaidTranscript;
    }
    return isSchoolPaidPlan;
  }, [isGraduated, hasPaidTranscript, isSchoolPaidPlan]);

  const requiresPayment = isGraduated;
  const isCurrentViewUnlocked = isPreviewUnlocked;

  // ── Group Results by Academic Session ─────────────────────────────────────
  const availableSessions = useMemo(() => {
    const map = new Map<string, string>();
    results.forEach((g) => {
      const sId = g.sessionId || "current-session";
      const sName = g.session?.name || "Current Session";
      if (!map.has(sId)) map.set(sId, sName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [results]);

  const availableTerms = useMemo(
    () => [
      { value: "ALL", label: "All Terms" },
      { value: "FIRST", label: "1st Term" },
      { value: "SECOND", label: "2nd Term" },
      { value: "THIRD", label: "3rd Term" },
    ],
    []
  );

  const isFilterActive = selectedSessionId !== "ALL" || selectedTermFilter !== "ALL";

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (selectedSessionId !== "ALL" && r.sessionId !== selectedSessionId) {
        return false;
      }
      if (selectedTermFilter !== "ALL" && r.term !== selectedTermFilter) {
        return false;
      }
      return true;
    });
  }, [results, selectedSessionId, selectedTermFilter]);

  const filteredGroupedBySession = useMemo(() => {
    const sessionMap = new Map<string, { sessionName: string; terms: PublishedResultGroup[] }>();

    filteredResults.forEach((group) => {
      const sessionId = group.sessionId || "current-session";
      const sessionName = group.session?.name || "Current Session";

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, { sessionName, terms: [] });
      }
      sessionMap.get(sessionId)!.terms.push(group);
    });

    return Array.from(sessionMap.entries()).map(([sessionId, data]) => ({
      sessionId,
      sessionName: data.sessionName,
      terms: data.terms,
    }));
  }, [filteredResults]);

  const selectedSessionName =
    selectedSessionId === "ALL"
      ? "All Sessions"
      : availableSessions.find((s) => s.id === selectedSessionId)?.name || "Selected Session";
  const selectedTermLabel =
    selectedTermFilter === "ALL" ? "All Terms" : getTermLabel(selectedTermFilter);

  // ── Cumulative Academic Statistics (Matching Admin Preview) ───────────────
  const transcriptStats = useMemo(() => {
    let totalMarksSum = 0;
    let scoredSubjectCount = 0;
    let totalPointsSum = 0;
    let totalSubjectsOverall = 0;

    filteredResults.forEach((group) => {
      const subjects = group.subjectResults || [];
      subjects.forEach((s) => {
        totalSubjectsOverall++;
        const effectiveTotal = s.totalScore ?? (
          (s.assignmentScore != null || s.quizScore != null || s.caScore != null || s.examScore != null)
            ? ((s.assignmentScore || 0) + (s.quizScore || 0) + (s.caScore || 0) + (s.examScore || 0))
            : null
        );
        if (s.scoresRevealed && effectiveTotal != null) {
          totalMarksSum += effectiveTotal;
          totalPointsSum += getGradePoint(effectiveTotal, gradingSystem);
          scoredSubjectCount++;
        }
      });
    });

    const cgpa = scoredSubjectCount > 0 ? (totalPointsSum / scoredSubjectCount).toFixed(2) : "0.00";
    const cumulativeAverage = scoredSubjectCount > 0 ? Math.round(totalMarksSum / scoredSubjectCount) : 0;

    let academicStanding = "Good";
    const numericCGPA = parseFloat(cgpa);
    if (numericCGPA >= 4.5 || cumulativeAverage >= 75) academicStanding = "First Class Honors / Excellent";
    else if (numericCGPA >= 3.5 || cumulativeAverage >= 65) academicStanding = "Second Class Upper / Very Good";
    else if (numericCGPA >= 2.5 || cumulativeAverage >= 50) academicStanding = "Second Class Lower / Good";
    else if (numericCGPA >= 1.5 || cumulativeAverage >= 40) academicStanding = "Third Class / Pass";
    else academicStanding = "Academic Warning / Needs Improvement";

    const cgpaGrade = getCgpaGrade(numericCGPA, cumulativeAverage);

    return {
      cgpa,
      cgpaGrade,
      cumulativeAverage,
      totalSubjectsOverall,
      scoredSubjectCount,
      academicStanding,
      totalSessions: new Set(filteredResults.map((r) => r.sessionId)).size,
      totalTerms: filteredResults.length,
    };
  }, [filteredResults, gradingSystem]);

  // ── Page 2 Behavioral Evaluation & Conduct ────────────────────────────────
  const evalCandidates = filteredResults.length > 0 ? filteredResults : results;
  const safeEvalIdx = selectedEvaluationIdx < evalCandidates.length ? selectedEvaluationIdx : 0;
  const activeEvalGroup = evalCandidates[safeEvalIdx] || results[0];
  const evalSessionId = activeEvalGroup?.sessionId || "";
  const evalTerm = (activeEvalGroup?.term as "FIRST" | "SECOND" | "THIRD") || "FIRST";
  const evalClassId = activeEvalGroup?.class?.id || (studentProfile as any)?.classes?.[0]?.class?.id || "";
  const { data: serverEvaluation } = useTermlyEvaluation(studentId, evalClassId, evalSessionId, evalTerm);

  const enrolledClass =
    (studentProfile as any)?.classes?.[0]?.class?.name
      ? `${(studentProfile as any).classes[0].class.name} ${(studentProfile as any).classes[0].class.section || ""}`.trim()
      : "Active Enrolled";

  // ── PDF Export Handler (Multi-page with Behavioral Evaluation) ─────────────
  const handleDownloadPDF = async () => {
    if (isGraduated && !hasPaidTranscript) {
      toast.error(`Official transcript clearance required. Please complete payment of ₦${transcriptFee.toLocaleString()} to unlock.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
      setIsPaymentModalOpen(true);
      return;
    }

    if (isGraduated && !hasDownloadRemaining) {
      toast.error(`You have already downloaded your official copy (1/1 used). To generate an additional copy, please complete a new clearance payment of ₦${transcriptFee.toLocaleString()}.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
      setIsPaymentModalOpen(true);
      return;
    }

    if (filteredResults.length === 0) {
      toast.warning("No published records available for the selected session.");
      return;
    }

    setIsExporting(true);
    try {
      const buildTableData = (termGroup: PublishedResultGroup) => {
        const rows: any[][] = [];
        const subjects = termGroup.subjectResults || [];

        subjects.forEach((s) => {
          const subName = s.subject?.name || "Subject";
          const subCode = s.subject?.code || "SUB";
          const asst = s.scoresRevealed && s.assignmentScore != null ? String(s.assignmentScore) : "—";
          const quiz = s.scoresRevealed && s.quizScore != null ? String(s.quizScore) : "—";
          const ca = s.scoresRevealed && s.caScore != null ? String(s.caScore) : "—";
          const exam = s.scoresRevealed && s.examScore != null ? String(s.examScore) : "—";
          const effectiveTotal = s.totalScore ?? (
            (s.assignmentScore != null || s.quizScore != null || s.caScore != null || s.examScore != null)
              ? ((s.assignmentScore || 0) + (s.quizScore || 0) + (s.caScore || 0) + (s.examScore || 0))
              : null
          );
          const total = s.scoresRevealed && effectiveTotal != null ? `${effectiveTotal}%` : "Pending";
          const grade = s.scoresRevealed ? getGradeLetter(effectiveTotal ?? null, gradingSystem) : "—";
          const gp = s.scoresRevealed ? getGradePoint(effectiveTotal ?? null, gradingSystem).toFixed(1) : "—";
          const remark = s.scoresRevealed ? getRemark(effectiveTotal ?? null, gradingSystem) : "Pending";

          rows.push([subCode, subName, asst, quiz, ca, exam, total, grade, gp, remark]);
        });

        return rows;
      };

      const tableHeaders = [
        ["CODE", "COURSE / SUBJECT", "ASST", "QUIZ", "CA", "EXAM", "TOTAL", "GRADE", "GP", "REMARK"]
      ];

      const firstGroup = filteredResults[0];
      const initialTableData = buildTableData(firstGroup);

      const additionalTables = filteredResults.slice(1).map((group) => ({
        title: `${group.session?.name || "Session"} — ${getTermLabel(group.term)} (${group.class?.name || "Cohort"})`,
        headers: tableHeaders,
        data: buildTableData(group),
      }));

      const behavioralEvaluationPayload = {
        sessionName: activeEvalGroup?.session?.name || "Academic Session",
        termLabel: getTermLabel(evalTerm),
        className: activeEvalGroup?.class?.name || enrolledClass,
        affective: AFFECTIVE_TRAITS.map((t) => ({
          trait: t.label,
          score: (serverEvaluation as any)?.[t.key] ?? 5,
        })),
        psychomotor: PSYCHOMOTOR_SKILLS.map((s) => ({
          trait: s.label,
          score: (serverEvaluation as any)?.[s.key] ?? 5,
        })),
        teacherRemark:
          serverEvaluation?.teacherRemark?.trim() ||
          "Demonstrates commendable academic diligence and consistent respect for institutional principles.",
        principalRemark:
          serverEvaluation?.principalRemark?.trim() ||
          "Certified genuine academic achievement and praiseworthy character appraisal.",
        cgpa: transcriptStats.cgpa,
        cgpaGrade: transcriptStats.cgpaGrade,
      };

      await generatePDF({
        title: "OFFICIAL ACADEMIC TRANSCRIPT",
        filename: `${studentProfile?.studentCode || "Scholar"}_Academic_Transcript.pdf`,
        schoolProfile: {
          name: schoolName,
          motto: schoolMotto,
          logo: schoolLogoUrl || "/schoolhub.png",
          schoolLogo: schoolLogoUrl || "/schoolhub.png",
          address: schoolLocation,
        },
        metaData: [
          { label: "Student Name", value: studentProfile?.name || "Scholar" },
          { label: "Student Code", value: studentProfile?.studentCode || "N/A" },
          { label: "Department", value: studentProfile?.department?.name || enrolledClass },
          { label: "Cumulative CGPA", value: `${transcriptStats.cgpa} (${transcriptStats.cgpaGrade})` },
          { label: "Academic Standing", value: transcriptStats.academicStanding },
          ...(selectedSessionId !== "ALL" ? [{ label: "Session Scope", value: selectedSessionName }] : []),
          ...(selectedTermFilter !== "ALL" ? [{ label: "Term Scope", value: selectedTermLabel }] : []),
          { label: "Transcript Ref", value: `TRX-${studentProfile?.studentCode?.toUpperCase() || "SCH"}-${new Date().getFullYear()}` },
          { label: "Issued Date", value: format(new Date(), "MMMM d, yyyy") },
        ],
        tableHeaders,
        tableData: initialTableData,
        additionalTables,
        orientation: "portrait",
        studentPhotoUrl: studentProfile?.profileImage || undefined,
        behavioralEvaluation: behavioralEvaluationPayload,
        signatures: {
          left: {
            label: registrarSlot.roleTitle,
            name: registrarSlot.subtitle,
            signatureUrl: registrarSlot.signatureUrl,
          },
          right: {
            label: principalSlot.roleTitle,
            name: principalSlot.subtitle,
            signatureUrl: principalSlot.signatureUrl,
          },
        },
      });

      toast.success("Official Multi-Page Transcript PDF exported successfully!");

      // Record download telemetry
      await recordDownloadMutation.mutateAsync({
        fileName: `${studentProfile?.studentCode || "Scholar"}_Academic_Transcript.pdf`,
        fileType: "TRANSCRIPT_DOWNLOAD",
      });
      setLocalTranscriptDownloads((prev) => prev + 1);
      refetchAudit();
    } catch (err) {
      console.error("Failed to generate PDF transcript:", err);
      toast.error("Failed to generate PDF. You can also use Print Copy to save as PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (isGraduated && !hasPaidTranscript) {
      toast.error(`Official transcript clearance required. Please complete payment of ₦${transcriptFee.toLocaleString()} to unlock.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
      setIsPaymentModalOpen(true);
      return;
    }
    if (isGraduated && !hasDownloadRemaining) {
      toast.error(`You have already downloaded/printed your official copy (1/1 used). To generate an additional copy, please complete a new clearance payment of ₦${transcriptFee.toLocaleString()}.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
      setIsPaymentModalOpen(true);
      return;
    }
    window.print();
  };

  // ── Payment Handlers ──────────────────────────────────────────────────────
  const handleInitiateOnlinePayment = async () => {
    if (!schoolId) {
      toast.error("Institution identification missing");
      return;
    }

    try {
      setIsPayingOnline(true);
      const res = await financeService.initiateTranscriptPayment(schoolId, {
        studentId,
        sessionId: paymentTargetSessionId === "ALL" ? undefined : paymentTargetSessionId,
        amount: transcriptFee,
        email: user?.email,
        name: studentProfile?.name || user?.name || "Student",
      });

      toast.success("Payment session initialized with Flutterwave");

      setUnlockedSessions((prev) => {
        const next = new Set(prev);
        next.add(paymentTargetSessionId);
        return next;
      });

      if (res?.checkoutUrl) {
        window.open(res.checkoutUrl, "_blank");
      }
      setIsPaymentModalOpen(false);
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to initiate online payment");
    } finally {
      setIsPayingOnline(false);
    }
  };

  const handleManualTransferConfirmed = () => {
    setUnlockedSessions((prev) => {
      const next = new Set(prev);
      next.add(paymentTargetSessionId);
      return next;
    });
    setIsPaymentModalOpen(false);
    toast.success("Transfer acknowledged! Official transcript unlocked for review.");
  };

  const handleCopy = (text: string, field: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.info(`Copied ${field} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (isProfileLoading || isResultsLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  // ── Gated State: Student Not Connected to a School ────────────────────────
  if (!isSchoolConnected) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 sm:p-12 text-center shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 shadow-inner">
            <Lock size={36} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white dark:ring-zinc-950">
              <School size={14} />
            </div>
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={14} />
              School Affiliation Required
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Official Academic Transcript Locked
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
              Academic transcripts are officially certified institutional records. Only students actively connected to an accredited school can view, generate, and export cumulative academic transcripts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/dashboard/student/linking" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                <span>Connect to Your School</span>
                <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/dashboard/student" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto px-6 h-11 rounded-xl font-bold text-sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared Reusable Letterhead (Matching Admin Transcript) ────────────────
  const renderOfficialLetterhead = (pageTitle: string, pageSubtitle: string) => (
    <div className="border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2 shadow-sm shrink-0 overflow-hidden">
            {schoolLogoUrl ? (
              <img
                src={schoolLogoUrl}
                alt={schoolName}
                onError={() => setLogoLoadError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <School size={40} className="text-blue-600 dark:text-blue-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={12} />
              Official Certified Institutional Record
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {schoolName}
            </h2>
            <p className="text-xs italic text-blue-600 dark:text-blue-400 font-serif font-medium">
              &quot;{schoolMotto}&quot;
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                <span>{schoolLocation}</span>
              </span>
              <span>•</span>
              <span>{pageSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Student Passport Portrait Picture Opposite School Crest */}
        <div className="self-center sm:self-start shrink-0">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-sm relative flex items-center justify-center">
            {studentProfile?.profileImage ? (
              <img
                src={studentProfile.profileImage}
                alt={studentProfile.name || "Student Photo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900">
                <User size={32} className="text-slate-400 dark:text-zinc-500" />
                <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-slate-500 dark:text-zinc-400">
                  Scholar
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── Shared Reusable Student Profile & Document Reference Banner ────────────
  const renderStudentProfileBanner = (refPrefix: string = "Academic Transcript") => (
    <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs w-full">
        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Scholar Full Name
          </p>
          <p className="text-slate-900 dark:text-white font-black text-sm truncate">
            {studentProfile?.name || "Scholar Record"}
          </p>
        </div>

        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Student ID / Code
          </p>
          <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm truncate">
            {studentProfile?.studentCode || "N/A"}
          </p>
        </div>

        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Department / Cohort
          </p>
          <p className="text-slate-900 dark:text-white font-bold text-sm truncate">
            {studentProfile?.department?.name || enrolledClass}
          </p>
        </div>

        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Enrollment Status
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1 truncate">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>Active Enrolled</span>
          </p>
        </div>

        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px] truncate">
            {refPrefix} Ref No.
          </p>
          <p className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
            TRX-{studentProfile?.studentCode?.toUpperCase() || "SCH"}-{new Date().getFullYear()}
          </p>
        </div>

        <div className="space-y-1 min-w-0">
          <p className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
            Issued Date
          </p>
          <p className="text-slate-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm truncate">
            {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>
    </div>
  );

  // ── Shared Reusable Endorsement Signatures Block ───────────────────────────
  const renderEndorsementSignatures = () => (
    <div className="pt-8 border-t-2 border-slate-200 dark:border-zinc-800 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center sm:text-left">
        {/* Signature 1: Left Slot (Registrar) */}
        <div className="space-y-3">
          <div className="h-24 sm:h-28 flex items-end justify-center sm:justify-start pb-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 w-full transition-all relative">
            {registrarSlot.signatureUrl ? (
              <div className="relative w-full flex items-end justify-center sm:justify-start">
                {registrarSlot.isImage ? (
                  <img
                    src={registrarSlot.signatureUrl}
                    alt={registrarSlot.roleTitle}
                    className="h-20 sm:h-24 max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-xs dark:invert dark:brightness-125 select-none"
                  />
                ) : (
                  <span className="font-['Caveat',cursive] italic text-2xl sm:text-3xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 select-none pb-1 transform -rotate-1 inline-block drop-shadow-xs">
                    {registrarSlot.signatureUrl}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center sm:justify-start h-full text-slate-400 font-['Caveat',cursive] text-2xl">
                {registrarSlot.adminName || "Registrar"}
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {registrarSlot.roleTitle}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {registrarSlot.subtitle}
            </p>
          </div>
        </div>

        {/* Center Official Electronic Seal */}
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400 dark:border-blue-600 flex items-center justify-center text-center p-2 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter shadow-xs">
            Official Electronic Seal
          </div>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            Certified Verified Copy
          </p>
        </div>

        {/* Signature 2: Right Slot (Principal / Head of Institution) */}
        <div className="space-y-3 text-center sm:text-right">
          <div className="h-24 sm:h-28 flex items-end justify-center sm:justify-end pb-1 border-b-2 border-dashed border-slate-300 dark:border-zinc-700 w-full transition-all relative">
            {principalSlot.signatureUrl ? (
              <div className="relative w-full flex items-end justify-center sm:justify-end">
                {principalSlot.isImage ? (
                  <img
                    src={principalSlot.signatureUrl}
                    alt={principalSlot.roleTitle}
                    className="h-20 sm:h-24 max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-xs dark:invert dark:brightness-125 select-none"
                  />
                ) : (
                  <span className="font-['Caveat',cursive] italic text-3xl sm:text-4xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 select-none pb-1 transform -rotate-2 inline-block drop-shadow-xs">
                    {principalSlot.signatureUrl}
                  </span>
                )}
              </div>
            ) : (
              <div className="relative w-full flex items-end justify-center sm:justify-end">
                <span className="font-['Caveat',cursive] italic text-3xl sm:text-4xl font-bold tracking-wide text-slate-800 dark:text-zinc-100 select-none pb-1 transform -rotate-2 inline-block drop-shadow-xs">
                  {principalSlot.adminName || "Authorized Signature"}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {principalSlot.roleTitle}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
              {principalSlot.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-400 dark:text-zinc-500 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
        This certified academic credential was generated electronically via Qefas Hub Academic Management System. Any alteration, erasure, or unauthorized duplication invalidates this document.
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 font-sans">
      {/* ── Top Header & Actions Bar ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard/student" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-zinc-200">Official Transcript</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Academic Transcript
            </h1>
            <HeaderTooltip content="Certified cumulative record of all completed academic sessions, term evaluations, continuous assessments, and cumulative grade point averages (CGPA)." />
          </div>
        </div>

        {/* Page Switcher Tabs, Sidebar Toggle, Print & PDF Export Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Multi-Page Switcher Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setActivePageView("page1")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "page1"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              )}
            >
              Page 1: Academic
            </button>
            <button
              onClick={() => setActivePageView("page2")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "page2"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              )}
            >
              Page 2: Conduct & Remarks
            </button>
            <button
              onClick={() => setActivePageView("all")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all text-xs",
                activePageView === "all"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              )}
            >
              All Pages
            </button>
          </div>

          {/* Toggle Sidebar Button */}
          <Button
            variant="outline"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-10 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 shadow-xs"
            title={isSidebarOpen ? "Collapse audit sidebar" : "Expand audit sidebar"}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden xl:inline">{isSidebarOpen ? "Hide Audit" : "Show Audit"}</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 shadow-xs"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print Copy</span>
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            {isExporting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Preparing PDF...</span>
              </>
            ) : isGraduated && !hasPaidTranscript ? (
              <>
                <Lock size={14} />
                <span>Clearance Required (₦{transcriptFee.toLocaleString()})</span>
              </>
            ) : isGraduated && !hasDownloadRemaining ? (
              <>
                <Lock size={14} />
                <span>Download Limit Reached (1/1 Used)</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Download Transcript (PDF)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Interactive Session & Term Filter Bar ──────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden transition-all">
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-200 mr-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Filter size={15} />
            </div>
            <span>Academic Filter:</span>
          </div>

          {/* Academic Session Selector Dropdown */}
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-[260px] h-9 px-3 rounded-xl text-xs font-bold bg-slate-50/80 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
              <SelectValue placeholder="Select session scope" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              <SelectItem value="ALL" className="text-xs font-semibold py-2">
                All Sessions (Full Cumulative)
              </SelectItem>
              {availableSessions.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs font-semibold py-2">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Term Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
            {availableTerms.map((t) => {
              const isSelected = selectedTermFilter === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedTermFilter(t.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all text-xs",
                    isSelected
                      ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSessionId("ALL");
                setSelectedTermFilter("ALL");
              }}
              className="h-9 px-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Clearance Status & Payment Action */}
        <div className="flex items-center gap-3">
          {requiresPayment && !isCurrentViewUnlocked ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                <Lock size={12} />
                Access Clearance Required
              </span>
              <Button
                onClick={() => {
                  setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
                  setIsPaymentModalOpen(true);
                }}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-600/25 gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <CreditCard size={14} />
                <span>Pay Clearance (₦{transcriptFee.toLocaleString()})</span>
              </Button>
            </div>
          ) : requiresPayment && isCurrentViewUnlocked ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
              <Unlock size={12} />
              Session Clearance Verified
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider">
              <ShieldCheck size={12} />
              Active Institutional Access
            </div>
          )}
        </div>
      </div>

      {/* ── 2-Column Responsive Layout: Official Document + Audit Sidebar ─── */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column: Official Transcript Document */}
        <div ref={printRef} className="flex-1 min-w-0 w-full space-y-10">
          {/* =================================================================== */}
          {/* ── PAGE 1: OFFICIAL ACADEMIC TRANSCRIPT ─────────────────────────── */}
          {/* =================================================================== */}
        <div
          className={cn(
            "rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0",
            activePageView === "page2" ? "hidden print:block" : "block"
          )}
        >
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
            <GraduationCap className="w-96 h-96 mx-auto text-slate-900 dark:text-white" />
          </div>

          {/* Official Letterhead */}
          {renderOfficialLetterhead("Academic Transcript", "Office of the Registrar & Academic Council")}

          {/* Student Biographical Profile Strip with Ref No. & Issue Date */}
          {renderStudentProfileBanner("Academic Transcript")}

          {/* Cumulative Performance 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 space-y-1">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} />
                Cumulative CGPA
              </span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {transcriptStats.cgpa}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  ({transcriptStats.cgpaGrade})
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
              </div>
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5 truncate">
                {transcriptStats.academicStanding}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Cumulative Average
              </span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {transcriptStats.cumulativeAverage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                Over {transcriptStats.scoredSubjectCount} verified scores
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" />
                Total Subjects
              </span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {transcriptStats.totalSubjectsOverall}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                Registered in transcript
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-500" />
                Completed Terms
              </span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {transcriptStats.totalTerms}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ({transcriptStats.totalSessions} Sessions)
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Certified terminal score sheets
              </p>
            </div>
          </div>

          {/* Paywall Clearance Banner or Course Breakdown */}
          {requiresPayment && !isCurrentViewUnlocked ? (
            <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-10 text-center space-y-4 print:hidden animate-in fade-in duration-300 my-6">
              <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={30} />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Official Transcript Access Clearance Required
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {isGraduated
                    ? `As a graduated scholar of ${schoolName}, previewing and downloading certified official transcript records requires an archival clearance fee of ₦${transcriptFee.toLocaleString()}.`
                    : `Your institution requires portal session clearance of ₦${transcriptFee.toLocaleString()} to preview and verify academic records.`}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => {
                    setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
                    setIsPaymentModalOpen(true);
                  }}
                  className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <CreditCard size={16} />
                  <span>Pay Clearance & Unlock Records (₦{transcriptFee.toLocaleString()})</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Session-by-Session & Term-by-Term Course Breakdown */}
              <div className="space-y-8 pt-2">
            {filteredResults.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <FileText size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {results.length === 0
                    ? "No Certified Score Records Found"
                    : "No Records Match Filter Criteria"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  {results.length === 0 ? (
                    <>
                      No published score sheets have been certified for{" "}
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{studentProfile?.name}</span> yet.
                    </>
                  ) : (
                    <>
                      No certified results found for {selectedSessionName} ({selectedTermLabel}). Try adjusting or resetting your filter.
                    </>
                  )}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  {isFilterActive && (
                    <Button
                      onClick={() => {
                        setSelectedSessionId("ALL");
                        setSelectedTermFilter("ALL");
                      }}
                      className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Reset Filters</span>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              filteredGroupedBySession.map(({ sessionId, sessionName, terms }) => (
                <div key={sessionId} className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-zinc-700">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <Calendar size={18} className="text-blue-600" />
                      <span>{sessionName}</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                      {terms.length} {terms.length === 1 ? "Term Record" : "Term Records"}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {terms.map((termGroup, termIdx) => {
                      const subjects = termGroup.subjectResults || [];
                      const termLabel = getTermLabel(termGroup.term);
                      const revealedCount = termGroup.revealedCount || 0;
                      const totalSubjects = termGroup.subjectCount || subjects.length;

                      let termMarksSum = 0;
                      let termPointsSum = 0;
                      let termScoredCount = 0;
                      subjects.forEach((s) => {
                        const effectiveTotal = s.totalScore ?? (
                          (s.assignmentScore != null || s.quizScore != null || s.caScore != null || s.examScore != null)
                            ? ((s.assignmentScore || 0) + (s.quizScore || 0) + (s.caScore || 0) + (s.examScore || 0))
                            : null
                        );
                        if (s.scoresRevealed && effectiveTotal != null) {
                          termMarksSum += effectiveTotal;
                          termPointsSum += getGradePoint(effectiveTotal, gradingSystem);
                          termScoredCount++;
                        }
                      });

                      const termGpa = termScoredCount > 0 ? (termPointsSum / termScoredCount).toFixed(2) : "0.00";
                      const termAvg = termScoredCount > 0 ? Math.round(termMarksSum / termScoredCount) : 0;

                      return (
                        <div
                          key={`${sessionId}-${termGroup.term}-${termIdx}`}
                          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs"
                        >
                          {/* Term Summary Header Strip */}
                          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase tracking-wider">
                                {termLabel}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {termGroup.class?.name || "Class Cohort"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
                                <span>Term GPA:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {termGpa}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
                                <span>Average:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {termAvg}%
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-slate-500">
                                <span>Scores:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {revealedCount}/{totalSubjects}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Term Scores Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-zinc-800">
                                <tr>
                                  <th className="py-2.5 px-4 w-20">Code</th>
                                  <th className="py-2.5 px-4">Course / Subject</th>
                                  <th className="py-2.5 px-3 text-center">Asst</th>
                                  <th className="py-2.5 px-3 text-center">Quiz</th>
                                  <th className="py-2.5 px-3 text-center">CA</th>
                                  <th className="py-2.5 px-3 text-center">Exam</th>
                                  <th className="py-2.5 px-3 text-center font-black">Total</th>
                                  <th className="py-2.5 px-3 text-center">Grade</th>
                                  <th className="py-2.5 px-3 text-center">GP</th>
                                  <th className="py-2.5 px-4 text-right">Remark</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                {subjects.length === 0 ? (
                                  <tr>
                                    <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                                      No courses recorded for this term.
                                    </td>
                                  </tr>
                                ) : (
                                  subjects.map((sub, sIdx) => {
                                    const isRevealed = Boolean(sub.scoresRevealed);
                                    const subCode = sub.subject?.code || "SUB";
                                    const subName = sub.subject?.name || "Subject";
                                    const asst = isRevealed && sub.assignmentScore != null ? sub.assignmentScore : "—";
                                    const quiz = isRevealed && sub.quizScore != null ? sub.quizScore : "—";
                                    const ca = isRevealed && sub.caScore != null ? sub.caScore : "—";
                                    const exam = isRevealed && sub.examScore != null ? sub.examScore : "—";

                                    const effectiveTotal = sub.totalScore ?? (
                                      (sub.assignmentScore != null || sub.quizScore != null || sub.caScore != null || sub.examScore != null)
                                        ? ((sub.assignmentScore || 0) + (sub.quizScore || 0) + (sub.caScore || 0) + (sub.examScore || 0))
                                        : null
                                    );

                                    const totalDisplay = isRevealed && effectiveTotal != null ? `${effectiveTotal}%` : "Pending";
                                    const grade = isRevealed ? getGradeLetter(effectiveTotal ?? null, gradingSystem) : "—";
                                    const gp = isRevealed ? getGradePoint(effectiveTotal ?? null, gradingSystem).toFixed(1) : "—";
                                    const remark = isRevealed ? getRemark(effectiveTotal ?? null, gradingSystem) : "Pending";

                                    return (
                                      <tr
                                        key={sub.id || `${subCode}-${sIdx}`}
                                        className={cn(
                                          "transition-colors",
                                          sIdx % 2 === 1 ? "bg-slate-50/50 dark:bg-zinc-900/30" : "bg-white dark:bg-zinc-950",
                                          "hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
                                        )}
                                      >
                                        <td className="py-3 px-4 font-mono font-bold text-slate-500">
                                          {subCode}
                                        </td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                                          {subName}
                                        </td>
                                        <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400 font-mono">
                                          {asst}
                                        </td>
                                        <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400 font-mono">
                                          {quiz}
                                        </td>
                                        <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400 font-mono">
                                          {ca}
                                        </td>
                                        <td className="py-3 px-3 text-center text-slate-600 dark:text-zinc-400 font-mono">
                                          {exam}
                                        </td>
                                        <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white">
                                          {totalDisplay}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                          {isRevealed && grade !== "—" ? (
                                            <span className={cn("inline-block px-2 py-0.5 rounded-md font-bold text-[11px] border", getGradeBadgeClass(grade))}>
                                              {grade}
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 font-semibold">—</span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-zinc-300">
                                          {gp}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-slate-600 dark:text-zinc-300">
                                          {remark}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cumulative CGPA Summary Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                CGPA: {transcriptStats.cgpa} ({transcriptStats.cgpaGrade})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {transcriptStats.academicStanding}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Overall Average: <strong className="text-slate-800 dark:text-zinc-200">{transcriptStats.cumulativeAverage}%</strong> across {transcriptStats.scoredSubjectCount} certified courses
            </p>
          </div>
            </>
          )}

          {/* Official Endorsements on Page 1 */}
          {renderEndorsementSignatures()}
        </div>

        {/* =================================================================== */}
        {/* ── PAGE 2: BEHAVIORAL EVALUATIONS & EXECUTIVE REMARKS ──────────── */}
        {/* =================================================================== */}
        <div
          className={cn(
            "rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0 print:break-before-page",
            activePageView === "page1" ? "hidden print:block" : "block"
          )}
        >
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none text-center">
            <Heart className="w-96 h-96 mx-auto text-slate-900 dark:text-white" />
          </div>

          {/* Letterhead Page 2 */}
          {renderOfficialLetterhead(
            "Behavioral Record",
            "Department of Student Affairs & Behavioral Guidance"
          )}

          {/* Student Profile Banner */}
          {renderStudentProfileBanner("Behavioral Record")}

          {/* Page 2 Document Title & Term Selector Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-transparent dark:from-blue-950/20 dark:via-zinc-900/40 dark:to-transparent border border-blue-200/60 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider">
                  Page 2 of 2
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Student Conduct Appraisal & Behavioral Domain Evaluation
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Official appraisal of behavioral traits, psychomotor skills, and institutional remarks.
              </p>
            </div>

            {/* Term Selector for Behavioral Appraisal */}
            {evalCandidates.length > 1 && (
              <Select
                value={String(safeEvalIdx)}
                onValueChange={(val) => setSelectedEvaluationIdx(Number(val))}
              >
                <SelectTrigger className="w-[230px] h-9 px-3 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                  <SelectValue placeholder="Select Term Evaluation" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl">
                  {evalCandidates.map((res, idx) => (
                    <SelectItem key={`${res.sessionId}-${res.term}-${idx}`} value={String(idx)} className="text-xs font-medium py-2">
                      {res.session?.name} • {getTermLabel(res.term)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {requiresPayment && !isCurrentViewUnlocked ? (
            <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-10 text-center space-y-4 print:hidden animate-in fade-in duration-300 my-6">
              <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={30} />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Conduct & Character Evaluation Records Locked
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {isGraduated
                    ? `As a graduated scholar of ${schoolName}, full certified appraisal of affective domain traits, psychomotor skills, and leadership remarks require an archival clearance fee of ₦${transcriptFee.toLocaleString()}.`
                    : `Your institution requires portal session clearance of ₦${transcriptFee.toLocaleString()} to preview and verify conduct appraisal records.`}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => {
                    setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
                    setIsPaymentModalOpen(true);
                  }}
                  className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <CreditCard size={16} />
                  <span>Pay Clearance & Unlock Records (₦{transcriptFee.toLocaleString()})</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Session & Cohort Metadata Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 dark:text-zinc-400">Evaluation Session:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeEvalGroup?.session?.name || "Current Academic Session"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 dark:text-zinc-400">Academic Term:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {getTermLabel(evalTerm)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 dark:text-zinc-400">Assessed Class:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeEvalGroup?.class?.name || enrolledClass}
                  </span>
                </div>
              </div>

          {/* ── Section 1: Affective Domain Table ──────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                <span>Affective Domain Appraisal (Behavior & Social Conduct)</span>
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                5-Point Standardized Institutional Scale
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Behavioral Attribute</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Description</th>
                    <th className="py-2.5 px-3 text-center w-24">Rating (1-5)</th>
                    <th className="py-2.5 px-4 text-center w-40">Proficiency Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {AFFECTIVE_TRAITS.map((item, idx) => {
                    const score = (serverEvaluation as any)?.[item.key] ?? 5;
                    return (
                      <tr
                        key={item.key}
                        className={cn(
                          "transition-colors",
                          idx % 2 === 1 ? "bg-slate-50/50 dark:bg-zinc-900/30" : "bg-white dark:bg-zinc-950",
                          "hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
                        )}
                      >
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-zinc-100">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 hidden sm:table-cell text-[11px]">
                          {item.desc}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-200 dark:border-blue-800">
                            {score}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                              score >= 5
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : score === 4
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : score === 3
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            )}
                          >
                            {score >= 5
                              ? "Excellent"
                              : score === 4
                              ? "Very Good"
                              : score === 3
                              ? "Good"
                              : "Fair"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Section 2: Psychomotor Skills Table ─────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Psychomotor Domain Appraisal (Physical & Practical Skills)</span>
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                5-Point Standardized Institutional Scale
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Psychomotor Skill</th>
                    <th className="py-2.5 px-4 hidden sm:table-cell">Skill Context</th>
                    <th className="py-2.5 px-3 text-center w-24">Rating (1-5)</th>
                    <th className="py-2.5 px-4 text-center w-40">Proficiency Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {PSYCHOMOTOR_SKILLS.map((item, idx) => {
                    const score = (serverEvaluation as any)?.[item.key] ?? 5;
                    return (
                      <tr
                        key={item.key}
                        className={cn(
                          "transition-colors",
                          idx % 2 === 1 ? "bg-slate-50/50 dark:bg-zinc-900/30" : "bg-white dark:bg-zinc-950",
                          "hover:bg-slate-100/50 dark:hover:bg-zinc-800/30"
                        )}
                      >
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-zinc-100">
                          {item.label}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-zinc-400 hidden sm:table-cell text-[11px]">
                          {item.desc}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-xs border border-blue-200 dark:border-blue-800">
                            {score}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                              score >= 5
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : score === 4
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : score === 3
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                            )}
                          >
                            {score >= 5
                              ? "Excellent"
                              : score === 4
                              ? "Very Good"
                              : score === 3
                              ? "Good"
                              : "Fair"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Section 3: Rating Key Rubric (Standard Institutional Scale) ─── */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs">
            <p className="font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[10px] mb-2">
              Behavioral Evaluation Rubric Key:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                  5
                </span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">Excellent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                  4
                </span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">High / Good</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">Acceptable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">Minimal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">Needs Attention</span>
              </div>
            </div>
          </div>

          {/* ── CGPA Banner ─────────────────────────────────────────────────── */}
          <div className="pt-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              CGPA: {transcriptStats.cgpa} ({transcriptStats.cgpaGrade})
            </h3>
          </div>

          {/* ── Section 4: Institutional Remarks & Certified Endorsements ─── */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
              <Quote size={16} className="text-blue-600" />
              <span>Remarks:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form Teacher's Appraisal */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Class Teacher&apos;s Remark
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Academic & Moral Conduct</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800 min-h-[72px] flex items-center">
                  <p className="text-xs italic text-slate-800 dark:text-zinc-200 leading-relaxed font-serif">
                    &ldquo;{serverEvaluation?.teacherRemark?.trim() || "Consistently displays commendable discipline, attentiveness in class, and positive interaction with classmates. Keep up the high standard!"}&rdquo;
                  </p>
                </div>
                <p className="text-[11px] font-bold text-slate-500 pt-1">
                  Class Form Tutor • Office of Academic Guidance
                </p>
              </div>

              {/* Principal's Certified Endorsement */}
              <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Principal&apos;s Certified Endorsement
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Attested
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-950/50 min-h-[72px] flex items-center">
                  <p className="text-xs italic text-slate-900 dark:text-zinc-100 leading-relaxed font-serif">
                    &ldquo;{serverEvaluation?.principalRemark?.trim() || "An exemplary scholar with admirable academic focus and leadership qualities. Certified for continuous advancement in good standing."}&rdquo;
                  </p>
                </div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 pt-1">
                  {principalSlot.roleTitle} • {schoolName}
                </p>
              </div>
            </div>
          </div>

          {/* ── Section 5: Standard Institutional Grading Scale Key ───────── */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <BookOpen size={12} className="text-blue-600" />
              Standard Institutional Grading System Key (Scale 5.00)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <p className="font-bold text-slate-900 dark:text-white">A1 (75 - 100%)</p>
                <p className="text-slate-500">5.0 GP • Excellent</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <p className="font-bold text-slate-900 dark:text-white">B2/B3 (65 - 74%)</p>
                <p className="text-slate-500">4.5 - 4.0 GP • Very Good</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <p className="font-bold text-slate-900 dark:text-white">C4 - C6 (50 - 64%)</p>
                <p className="text-slate-500">3.5 - 2.5 GP • Credit</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <p className="font-bold text-slate-900 dark:text-white">D7/E8 (40 - 49%)</p>
                <p className="text-slate-500">1.5 - 1.0 GP • Pass</p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <p className="font-bold text-rose-600">F9 (0 - 39%)</p>
                <p className="text-slate-500">0.0 GP • Fail</p>
              </div>
            </div>
          </div>
            </>
          )}

          {/* Endorsement Signatures on Page 2 */}
          {renderEndorsementSignatures()}
        </div>
      </div>

      {/* ── Right Column: Credential Verification & Audit Sidebar ───────── */}
      {isSidebarOpen && (
        <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5 print:hidden">
          {/* Card 1: Official Electronic Verification & Security */}
          <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Credential Verification
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                    Official Certified Electronic Copy
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchAudit()}
                className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                title="Refresh Verification & Audit Data"
              >
                <RefreshCw size={13} className={cn(isAuditLoading ? "animate-spin" : "")} />
              </Button>
            </div>

            {/* Verification Status Beacon Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/60 dark:border-emerald-900/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Certified Record
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  v2.4 Live
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Digitally Authenticated
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">
                  Certified by {schoolName} Academic Board &amp; Qefas Hub Registry.
                </p>
              </div>
            </div>

            {/* Document Reference Code with 1-click Copy */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Transcript Ref Hash
                </span>
                <button
                  onClick={() => handleCopy(`TRX-${studentProfile?.studentCode?.toUpperCase() || "SCH"}-${new Date().getFullYear()}`, "transcript reference")}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === "transcript reference" ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copiedField === "transcript reference" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                TRX-{studentProfile?.studentCode?.toUpperCase() || "SCH"}-{new Date().getFullYear()}
              </p>
            </div>

            {/* Verified Signatories */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Certified Signatories
              </span>
              <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{principalSlot.roleTitle}</p>
                  <p className="text-[10px] text-slate-500 truncate">{principalSlot.adminName || "Head of School"}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                  <CheckCircle2 size={11} /> Endorsed
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{registrarSlot.roleTitle}</p>
                  <p className="text-[10px] text-slate-500 truncate">{registrarSlot.adminName || "Registrar"}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                  <CheckCircle2 size={11} /> Endorsed
                </span>
              </div>
            </div>

            {/* Archival Access & Session Clearance */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <Lock size={13} className="text-blue-600" />
                  Portal Clearance Status
                </span>
                {requiresPayment && !isCurrentViewUnlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                    <AlertCircle size={11} />
                    Clearance Required
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={11} />
                    Cleared &amp; Active
                  </span>
                )}
              </div>

              {requiresPayment && !isCurrentViewUnlocked ? (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    Archival session clearance fee is required to unlock full transcript records and issue verifiable PDF credentials.
                  </p>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[11px] font-bold text-slate-500">Session Fee:</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">₦{transcriptFee.toLocaleString()}</span>
                  </div>
                  <Button
                    onClick={() => {
                      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : "ALL");
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>Pay Clearance (₦{transcriptFee.toLocaleString()})</span>
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Settlement Route</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Direct Institutional Subaccount
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <CheckCheck size={12} />
                    Archival clearance active for exports
                  </p>
                </div>
              )}
            </div>

            {/* Download Activity Telemetry */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <Download size={13} className="text-blue-600" />
                  Download Activity
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  Live
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200/60 dark:border-blue-900/30 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                    Total Official Downloads
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {totalTranscriptDownloads}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Download size={18} />
                </div>
              </div>

              {isGraduated && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Download Allowance</span>
                    <span className={hasDownloadRemaining ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                      {hasDownloadRemaining ? "1 Official Use Remaining" : "Limit Reached (1/1 Used)"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {hasDownloadRemaining
                      ? "Your paid clearance grants 1 official download copy."
                      : "Official single-use limit reached. Clearance required for new copy."}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <User size={11} />
                    Scholar
                  </div>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {auditData?.downloadStats?.studentDownloads ?? 0}
                  </p>
                  <p className="text-[9px] text-slate-400">Downloads</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <Users size={11} />
                    Guardians
                  </div>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {auditData?.downloadStats?.parentDownloads ?? 0}
                  </p>
                  <p className="text-[9px] text-slate-400">Downloads</p>
                </div>
              </div>

              {auditData?.downloadStats?.lastDownloadedAt && (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 pt-0.5">
                  <Clock size={11} />
                  <span>Last downloaded: {format(new Date(auditData.downloadStats.lastDownloadedAt), "MMM d, yyyy • h:mm a")}</span>
                </p>
              )}
            </div>

            {/* Embassy & Hard Copy Transcripts Notice */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                <Building2 size={14} className="text-blue-600" />
                <span>Physical Wax-Sealed Copies</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                For embassy visa applications or international universities requiring embossed physical transcripts with wet wax seals, contact the Office of the Registrar.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 text-[11px] space-y-1">
                <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">{schoolName}</p>
                <p className="text-slate-400 truncate">{schoolLocation}</p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>

      {/* ── 8. Session Payment & Clearance Modal ─────────────────────────────── */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-950 border-none shadow-2xl">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <CreditCard className="size-6 text-blue-500" />
              Transcript Clearance & Portal Access
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-xs mt-1.5 leading-relaxed">
              {isGraduated
                ? `Alumni archival certification for ${schoolName}. Complete the clearance payment of ₦${transcriptFee.toLocaleString()} to preview and download your official academic transcript.`
                : `Official portal verification clearance for ${schoolName}.`}
            </DialogDescription>
          </div>

          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" />
                Which session would you like to pay for?
              </label>
              <Select value={paymentTargetSessionId} onValueChange={setPaymentTargetSessionId}>
                <SelectTrigger className="h-13 px-4 rounded-2xl border-slate-200 dark:border-zinc-800 font-bold text-xs bg-slate-50 dark:bg-zinc-900/60">
                  <SelectValue placeholder="Select target academic session" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl">
                  <SelectItem value="ALL" className="py-3 text-xs font-bold">
                    Full Cumulative Transcript (All Completed Sessions) — ₦{transcriptFee.toLocaleString()}
                  </SelectItem>
                  {availableSessions.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="py-3 text-xs font-semibold">
                      {s.name} Only — ₦{transcriptFee.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Archival Clearance Fee
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">₦{transcriptFee.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Beneficiary</span>
                <p className="text-xs font-black text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">
                  {schoolName}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-end mt-0.5">
                  <ShieldCheck size={11} /> Verified Subaccount
                </span>
              </div>
            </div>

            {/* Option A: Online via Flutterwave */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Option A: Instant Online Checkout (Flutterwave)
              </span>
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Instant clearance via Debit Card, Bank Transfer, or USSD. Funds are automatically split and settled into {schoolName}&apos;s subaccount.
                </p>
                <Button
                  onClick={handleInitiateOnlinePayment}
                  disabled={isPayingOnline}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  {isPayingOnline ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting to Flutterwave...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} />
                      <span>Pay ₦{transcriptFee.toLocaleString()} with Flutterwave</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Option B: Direct School Bank Transfer */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Option B: Direct School Bank Transfer (Offline Conduit)
              </span>
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-4">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Transfer ₦{transcriptFee.toLocaleString()} directly to the school&apos;s verified institutional settlement conduit:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Bank Name</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {schoolProfile?.bankName || (school as Record<string, unknown>)?.bankName as string || "Institution Primary Bank"}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Account Number</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {schoolProfile?.accountNumber || (school as Record<string, unknown>)?.accountNumber as string || "0123456789"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(schoolProfile?.accountNumber || (school as Record<string, unknown>)?.accountNumber as string || "0123456789", "account number")}
                      className="h-8 px-2 text-slate-400 hover:text-slate-900"
                    >
                      {copiedField === "account number" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </Button>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Account Name</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {schoolProfile?.accountName || (school as Record<string, unknown>)?.accountName as string || schoolName}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Payment Reference</span>
                      <p className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                        TRX-{studentProfile?.studentCode || "STU"}-{paymentTargetSessionId.slice(0, 4)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(`TRX-${studentProfile?.studentCode || "STU"}-${paymentTargetSessionId.slice(0, 4)}`, "payment reference")}
                      className="h-8 px-2 text-slate-400 hover:text-slate-900"
                    >
                      {copiedField === "payment reference" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleManualTransferConfirmed}
                  className="w-full h-11 rounded-xl text-xs font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  <Check size={14} className="mr-1.5 text-emerald-600" />
                  I Have Completed This Transfer
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800">
            <Button
              variant="ghost"
              onClick={() => setIsPaymentModalOpen(false)}
              className="rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 w-full sm:w-auto"
            >
              Close Window
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
