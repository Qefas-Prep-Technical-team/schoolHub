"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
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
  CheckCheck,
  ExternalLink,
  Mail,
  Key,
  Users, // Used in telemetry audit stats
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
  const router = useRouter();
  const searchParams = useSearchParams();
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

  // ── Auto-Verification on Return from Flutterwave Checkout & Pass Restoration ──
  useEffect(() => {
    const txRef = searchParams.get("tx_ref") || searchParams.get("reference");
    const transactionId = searchParams.get("transaction_id");
    const flwStatus = searchParams.get("status");
    const passParam = searchParams.get("pass");

    // 1. Direct 30-Day Access Pass in URL parameter
    if (passParam) {
      financeService.verifyTranscriptPass(passParam).then((res) => {
        if (res && res.valid) {
          setDirectAccessPass({
            token: passParam,
            expiresAt: res.expiresAt || "",
            sessionId: res.sessionId,
            term: res.term,
          });
          const targetKey = `${res.sessionId || "ALL"}_${res.term || "ALL"}`;
          setUnlockedClearances((prev) => new Set(prev).add(targetKey));
          if (studentId) {
            localStorage.setItem(`transcript_access_pass_${studentId}`, passParam);
          }
          toast.success("Official 30-Day Clearance Pass validated! Your certified transcript is unlocked.");
        } else {
          toast.error(res?.error || "This 30-day access pass has expired or is invalid.");
        }
      }).catch((err) => {
        console.warn("Pass verification error:", err);
      });
    }

    // 2. Flutterwave redirect callback
    if (!txRef) return;

    if (flwStatus === "cancelled" || flwStatus === "failed") {
      toast.error("Clearance payment was cancelled or failed. You may retry at any time.");
      router.replace("/dashboard/student/transcript");
      return;
    }

    let isMounted = true;
    const verifyTransaction = async () => {
      try {
        toast.info("Verifying your transcript clearance payment with Flutterwave...", { autoClose: 3500 });
        const res = await financeService.verifyPayment(txRef, transactionId || undefined);
        if (!isMounted) return;
        if (res?.success) {
          toast.success("Transcript clearance confirmed! 30-day direct access pass generated.");
          if (res.data?.accessPass) {
            setDirectAccessPass(res.data.accessPass);
            const targetKey = `${res.data.accessPass.sessionId || "ALL"}_${res.data.accessPass.term || "ALL"}`;
            setUnlockedClearances((prev) => new Set(prev).add(targetKey));
            if (studentId) {
              localStorage.setItem(`transcript_access_pass_${studentId}`, res.data.accessPass.token);
            }
          }
          refetchAudit();
          if (res.data?.accessPass?.token) {
            router.replace(`/dashboard/student/transcript?pass=${encodeURIComponent(res.data.accessPass.token)}`);
            return;
          }
          router.replace("/dashboard/student/transcript");
        } else {
          toast.error("Could not verify clearance payment automatically. Please refresh or contact support.");
          router.replace("/dashboard/student/transcript");
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Auto verification error:", err);
        refetchAudit();
        router.replace("/dashboard/student/transcript");
      }
    };

    verifyTransaction();
    return () => {
      isMounted = false;
    };
  }, [searchParams, router, refetchAudit, studentId]);

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
  const [unlockedClearances, setUnlockedClearances] = useState<Set<string>>(new Set());
  const [paymentTargetSessionId, setPaymentTargetSessionId] = useState<string>("");
  const [paymentTargetTerm, setPaymentTargetTerm] = useState<string>("");
  const [isPayingOnline, setIsPayingOnline] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [directAccessPass, setDirectAccessPass] = useState<{ token: string; expiresAt: string; accessUrl?: string; sessionId?: string; term?: string } | null>(null);
  const [isEmailingPass, setIsEmailingPass] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreInput, setRestoreInput] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  // ── Check Graduation Status & School Subscription ─────────────────────────
  const isGraduated = useMemo(() => {
    const sStatus = String((studentProfile as unknown as Record<string, unknown>)?.status || (user as unknown as Record<string, unknown>)?.status || searchParams.get("status") || "").toUpperCase();
    const gStatus = String((studentProfile as unknown as Record<string, unknown>)?.graduationStatus || "").toUpperCase();
    const isAlum = Boolean((studentProfile as any)?.isAlumni || (user as any)?.isAlumni || (studentProfile as any)?.graduated);
    const hasGradParam = searchParams.get("graduated") === "true" || searchParams.get("alumni") === "true";
    return sStatus === "GRADUATED" || sStatus === "ALUMNI" || gStatus === "GRADUATED" || isAlum || hasGradParam;
  }, [studentProfile, user, searchParams]);

  // ── Graduated Institutions / School Badges ────────────────────────────────
  const graduatedSchools = useMemo(() => {
    const list: Array<{ id: string; name: string; logo?: string | null; motto?: string | null; graduationYear?: string | number | null }> = [];
    const seen = new Set<string>();

    const addSchool = (id?: string | null, name?: string | null, logo?: string | null, motto?: string | null) => {
      if (!name) return;
      const key = (id || name).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          id: id || key,
          name: name.trim(),
          logo: logo || null,
          motto: motto || null,
          graduationYear: (studentProfile as any)?.graduationYear || (studentProfile as any)?.graduatedYear || new Date().getFullYear(),
        });
      }
    };

    // 1. Primary school Profile / School
    addSchool(schoolProfile?.id || schoolId, schoolProfile?.name || schoolName, schoolProfile?.logo || schoolLogoUrl, schoolProfile?.motto || schoolMotto);

    // 2. School relation on studentProfile
    if (school) {
      addSchool(school.id, school.name, (school as any).logo, (school as any).motto);
    }

    // 3. Original school if transferred/graduated
    const origSchool = (studentProfile as any)?.originalSchool;
    if (origSchool) {
      addSchool(origSchool.id, origSchool.name, origSchool.logo, origSchool.motto);
    }

    // 4. Any school memberships from user.schools
    if (Array.isArray(user?.schools)) {
      user.schools.forEach((s: any) => {
        addSchool(s.schoolId || s.id, s.name || s.schoolName, s.logo || s.schoolLogo, s.motto);
      });
    }

    // Fallback if none added
    if (list.length === 0 && schoolName) {
      addSchool("default-school", schoolName, schoolLogoUrl, schoolMotto);
    }

    return list;
  }, [schoolProfile, schoolId, schoolName, schoolLogoUrl, schoolMotto, school, studentProfile, user]);

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
    return list.length + (unlockedClearances.size > 0 ? unlockedClearances.size : 0);
  }, [auditData, unlockedClearances]);

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

  // Official transcript clearance requirement:
  // All transcripts require clearance if school configured a transcript fee (> 0) or student is graduated.
  const requiresPayment = useMemo(() => {
    if (transcriptFee > 0) return true;
    if (isGraduated) return true;
    return !isSchoolPaidPlan;
  }, [transcriptFee, isGraduated, isSchoolPaidPlan]);

  // Check whether a specific academic session and term is unlocked
  // Gating rule: Direct dashboard visits are locked. Access to preview & download
  // certified records is strictly restricted to valid 30-day passes accessed via the secure link.
  const isTermUnlocked = (sId: string, termVal: string): boolean => {
    if (!requiresPayment) return true;

    // Direct dashboard visits are strictly locked without a verified 30-day link pass
    if (!directAccessPass) return false;

    // Check pass expiration
    if (directAccessPass.expiresAt) {
      const expiry = new Date(directAccessPass.expiresAt).getTime();
      if (Date.now() > expiry) return false;
    }

    const passSession = directAccessPass.sessionId || "ALL";
    const passTerm = directAccessPass.term || "ALL";
    const sessionMatches =
      passSession === "ALL" ||
      passSession === "All Sessions" ||
      passSession === sId;
    const termMatches =
      passTerm === "ALL" ||
      passTerm === "All Terms" ||
      passTerm === termVal ||
      passTerm === getTermLabel(termVal);

    return sessionMatches && termMatches;
  };

  // ── Recent Clearance Payments (Completed within the last 30 days) ─────────
  const recentClearancePayments = useMemo(() => {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    return (auditData?.paymentStats?.payments || []).filter((p) => {
      const isSuccess = p.status === "SUCCESS" || p.status === "PAID";
      if (!isSuccess) return false;
      const isTranscript =
        p.paymentType === "TRANSCRIPT" ||
        p.term === "All Terms" ||
        String(p.session).includes("Session");
      if (!isTranscript) return false;
      const paidTime = p.paidAt
        ? new Date(p.paidAt).getTime()
        : p.createdAt
        ? new Date(p.createdAt).getTime()
        : 0;
      return now - paidTime <= thirtyDaysMs;
    });
  }, [auditData]);

  const [isResendingLink, setIsResendingLink] = useState(false);
  const handleResendLink = async (reference?: string) => {
    const targetEmail = studentProfile?.email || user?.email;
    if (!targetEmail) {
      toast.error("No registered email address found for your scholar account.");
      return;
    }
    try {
      setIsResendingLink(true);
      await financeService.emailTranscriptPass({
        studentId,
        schoolId,
        email: targetEmail,
        reference: reference || recentClearancePayments[0]?.reference || undefined,
        token: directAccessPass?.token || undefined,
      });
      toast.success(`Transcript preview & download link sent to ${targetEmail}! Check your inbox to preview what you paid for.`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to resend transcript preview link");
    } finally {
      setIsResendingLink(false);
    }
  };

  const isCurrentViewUnlocked = useMemo(() => {
    if (!requiresPayment) return true;
    if (selectedSessionId !== "ALL" && selectedTermFilter !== "ALL") {
      return isTermUnlocked(selectedSessionId, selectedTermFilter);
    }
    if (selectedSessionId !== "ALL") {
      const sessionTerms = results.filter((r) => r.sessionId === selectedSessionId).map((r) => r.term);
      if (sessionTerms.length === 0) return true;
      return sessionTerms.every((t) => isTermUnlocked(selectedSessionId, t));
    }
    if (selectedTermFilter !== "ALL") {
      const termMatches = results.filter((r) => r.term === selectedTermFilter);
      if (termMatches.length === 0) return true;
      return termMatches.every((r) => isTermUnlocked(r.sessionId || "current-session", selectedTermFilter));
    }
    if (results.length === 0) return true;
    return results.every((r) => isTermUnlocked(r.sessionId || "current-session", r.term));
  }, [requiresPayment, selectedSessionId, selectedTermFilter, results, directAccessPass]);

  const hasAnyUnlockedTerm = useMemo(() => {
    if (!requiresPayment) return true;
    if (results.length === 0) return true;
    return results.some((r) => isTermUnlocked(r.sessionId || "current-session", r.term));
  }, [requiresPayment, results, unlockedClearances, directAccessPass, auditData]);

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
    if (requiresPayment && !isCurrentViewUnlocked) {
      toast.error(`Official transcript clearance required. Please complete payment of ₦${transcriptFee.toLocaleString()} to unlock.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : (availableSessions[0]?.id || ""));
      setPaymentTargetTerm(selectedTermFilter !== "ALL" ? selectedTermFilter : "");
      setIsPaymentModalOpen(true);
      return;
    }

    if (isGraduated && !hasDownloadRemaining) {
      toast.error(`You have already downloaded your official copy (1/1 used). To generate an additional copy, please complete a new clearance payment of ₦${transcriptFee.toLocaleString()}.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : (availableSessions[0]?.id || ""));
      setPaymentTargetTerm(selectedTermFilter !== "ALL" ? selectedTermFilter : "");
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
    if (requiresPayment && !isCurrentViewUnlocked) {
      toast.error(`Official transcript clearance required. Please complete payment of ₦${transcriptFee.toLocaleString()} to unlock.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : (availableSessions[0]?.id || ""));
      setPaymentTargetTerm(selectedTermFilter !== "ALL" ? selectedTermFilter : "");
      setIsPaymentModalOpen(true);
      return;
    }
    if (isGraduated && !hasDownloadRemaining) {
      toast.error(`You have already downloaded/printed your official copy (1/1 used). To generate an additional copy, please complete a new clearance payment of ₦${transcriptFee.toLocaleString()}.`);
      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : (availableSessions[0]?.id || ""));
      setPaymentTargetTerm(selectedTermFilter !== "ALL" ? selectedTermFilter : "");
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

    if (!paymentTargetSessionId || paymentTargetSessionId.trim() === "") {
      toast.error("Please select an academic session before proceeding with payment.");
      return;
    }

    if (!paymentTargetTerm || paymentTargetTerm.trim() === "") {
      toast.error("Please select an academic term (1st, 2nd, or 3rd Term) before proceeding with payment.");
      return;
    }

    try {
      setIsPayingOnline(true);
      const res = await financeService.initiateTranscriptPayment(schoolId, {
        studentId,
        sessionId: paymentTargetSessionId,
        term: paymentTargetTerm,
        amount: transcriptFee,
        email: user?.email,
        name: studentProfile?.name || user?.name || "Student",
      });

      if (res?.checkoutUrl) {
        if (res.accessPass) {
          setDirectAccessPass(res.accessPass);
          const targetKey = `${paymentTargetSessionId}_${paymentTargetTerm}`;
          setUnlockedClearances((prev) => new Set(prev).add(targetKey));
          if (studentId) {
            localStorage.setItem(`transcript_access_pass_${studentId}`, res.accessPass.token);
          }
        }
        toast.info("Connecting to Flutterwave secure checkout...");
        // Direct browser redirection
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Unable to generate payment checkout link. Please try again.");
        setIsPayingOnline(false);
      }
    } catch (err: unknown) {
      console.error("Payment initiation error:", err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Failed to initiate online payment");
      setIsPayingOnline(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.info(`Copied ${field} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleCopyAccessLink = () => {
    const token = directAccessPass?.token || "";
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = token ? `${origin}/dashboard/student/transcript?pass=${encodeURIComponent(token)}` : window.location.href;
    handleCopy(link, "accessLink");
  };

  const handleEmailAccessLink = async () => {
    if (!directAccessPass?.token) {
      toast.error("No active 30-day access pass token available. Please verify your clearance first.");
      return;
    }
    const targetEmail = studentProfile?.email || user?.email;
    if (!targetEmail) {
      toast.error("No email address found for your account.");
      return;
    }
    try {
      setIsEmailingPass(true);
      await financeService.emailTranscriptPass({
        studentId,
        schoolId,
        email: targetEmail,
        token: directAccessPass.token,
        reference: (auditData?.paymentStats?.payments?.[0]?.reference as string) || undefined,
      });
      toast.success(`30-day direct access link sent to ${targetEmail}!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send direct access link");
    } finally {
      setIsEmailingPass(false);
    }
  };

  const handleRestoreAccess = async () => {
    const trimmed = restoreInput.trim();
    if (!trimmed) {
      toast.error("Please enter your transaction reference or pass token");
      return;
    }
    try {
      setIsRestoring(true);
      toast.info("Validating your clearance record...");

      // If user pasted a URL with ?pass=...
      let tokenToTest = trimmed;
      if (trimmed.includes("pass=")) {
        try {
          const u = new URL(trimmed);
          tokenToTest = u.searchParams.get("pass") || trimmed;
        } catch {}
      }

      // 1. Try as 30-day access pass token
      const passRes = await financeService.verifyTranscriptPass(tokenToTest).catch(() => null);
      if (passRes && passRes.valid) {
        setDirectAccessPass({
          token: tokenToTest,
          expiresAt: passRes.expiresAt || "",
          sessionId: passRes.sessionId,
          term: passRes.term,
        });
        const targetKey = `${passRes.sessionId || "ALL"}_${passRes.term || "ALL"}`;
        setUnlockedClearances((prev) => new Set(prev).add(targetKey));
        if (studentId) {
          localStorage.setItem(`transcript_access_pass_${studentId}`, tokenToTest);
        }
        toast.success("30-Day Clearance Pass validated! Official records unlocked.");
        setIsRestoreModalOpen(false);
        setRestoreInput("");
        return;
      }

      // 2. Try as transaction reference with gateway verification
      const txRes = await financeService.verifyPayment(trimmed).catch(() => null);
      if (txRes && txRes.success) {
        if (txRes.data?.accessPass) {
          setDirectAccessPass(txRes.data.accessPass);
          const targetKey = `${txRes.data.accessPass.sessionId || "ALL"}_${txRes.data.accessPass.term || "ALL"}`;
          setUnlockedClearances((prev) => new Set(prev).add(targetKey));
          if (studentId) {
            localStorage.setItem(`transcript_access_pass_${studentId}`, txRes.data.accessPass.token);
          }
        } else {
          setUnlockedClearances((prev) => new Set(prev).add("ALL"));
        }
        refetchAudit();
        toast.success("Transcript clearance confirmed! Academic records unlocked.");
        setIsRestoreModalOpen(false);
        setRestoreInput("");
        return;
      }

      toast.error("Could not find or verify any clearance record with that code or token. Please check and retry.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore clearance access");
    } finally {
      setIsRestoring(false);
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
          {isGraduated ? (
            <p className="text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-1 truncate">
              <GraduationCap size={14} className="shrink-0 text-amber-500" />
              <span>Graduated Alumnus</span>
            </p>
          ) : (
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1 truncate">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>Active Enrolled</span>
            </p>
          )}
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
            ) : requiresPayment && !isCurrentViewUnlocked ? (
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

          {/* ── Graduated Scholar Alumni Badges Roll ── */}
          {isGraduated && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-blue-500/10 border border-amber-300/70 dark:border-amber-700/60 shadow-xs flex flex-wrap items-center justify-between gap-3.5 transition-all print:border-amber-400 print:bg-white">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
                  <Award size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Badge
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <GraduationCap size={12} className="text-amber-600 dark:text-amber-400" />
                      Graduated Scholar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                    Official graduation credential and institutional alumni badge
                  </p>
                </div>
              </div>

              {/* Roll of schools logo that they graduated from as badges */}
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
                {graduatedSchools.map((sch) => (
                  <div
                    key={sch.id}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-all group"
                  >
                    <div className="size-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {sch.logo ? (
                        <img
                          src={sch.logo}
                          alt={sch.name}
                          className="size-full object-contain"
                        />
                      ) : (
                        <School size={18} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {sch.name}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                        <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                        <span>Graduated Alumnus</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Scenario A: Scholar Accessed via 30-Day Link (Pass Active & Verified) ─── */}
          {directAccessPass && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-indigo-600/10 border border-emerald-300 dark:border-emerald-800/80 shadow-xs space-y-3 print:hidden animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        Official 30-Day Clearance Pass Active
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                        Unlocked via Secure Link
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 truncate">
                      Viewing certified records for: <strong>{directAccessPass.sessionId === "ALL" ? "All Sessions" : (availableSessions.find((s) => s.id === directAccessPass.sessionId)?.name || directAccessPass.sessionId)} • {getTermLabel(directAccessPass.term || "ALL")}</strong> (Class: <strong>{enrolledClass}</strong>)
                      {directAccessPass.expiresAt && ` • Valid until ${format(new Date(directAccessPass.expiresAt), "MMMM d, yyyy")}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyAccessLink}
                    className="rounded-xl h-9 text-xs font-bold gap-1.5 flex-1 md:flex-none border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copiedField === "accessLink" ? "Copied Link!" : "Copy 30-Day Link"}</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEmailAccessLink}
                    disabled={isEmailingPass}
                    className="rounded-xl h-9 text-xs font-bold gap-1.5 flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    <Mail size={13} />
                    <span>{isEmailingPass ? "Sending..." : "Email Link to Me"}</span>
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed border-t border-emerald-200/40 dark:border-emerald-900/30 pt-2.5">
                💡 <strong>Access Notice:</strong> You are currently viewing certified terminal records unlocked via your secure 30-day clearance pass. To access on other devices, bookmark or email this link.
              </p>
            </div>
          )}

          {/* ── Scenario B: Paid Within Last 30 Days but Visiting Direct from Dashboard (Locked) ─── */}
          {requiresPayment && !directAccessPass && recentClearancePayments.length > 0 && (
            <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-blue-500/40 shadow-xl space-y-4 print:hidden animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} />
                      30-Day Clearance Record Verified
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Lock size={10} />
                      Dashboard Direct Preview Locked
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Official Transcript Clearance Record on File
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    To preserve institutional certification and prevent unauthorized browser caching, certified academic transcripts cannot be previewed directly from the student dashboard. Official records can only be viewed and exported using your dedicated 30-day link.
                  </p>
                </div>

                <Button
                  onClick={() => handleResendLink()}
                  disabled={isResendingLink}
                  className="h-12 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs gap-2 shrink-0 shadow-xl shadow-blue-600/30 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <Mail size={16} />
                  <span>{isResendingLink ? "Sending Link..." : "Resend Transcript Download & Preview Link"}</span>
                </Button>
              </div>

              {/* Itemized Cleared Terms Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {recentClearancePayments.map((p, idx) => (
                  <div
                    key={p.id || p.reference || idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
                        Cleared Scope
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Paid & Certified
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-sm text-white">
                        {p.session || "Academic Session"} • {p.term ? getTermLabel(p.term) : "All Terms"}
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Class: <strong className="text-white">{enrolledClass}</strong>
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Paid: {format(new Date(p.paidAt || p.createdAt), "dd MMM yyyy")}</span>
                      <span className="font-mono text-[10px]">Ref: {p.reference?.slice(-6) || "PAID"}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-blue-400 shrink-0" />
                  <span>
                    Preview link will be sent to <strong>{studentProfile?.email || user?.email || "your registered email"}</strong>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="h-8 px-3 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  Already have access token? Enter manually →
                </Button>
              </div>
            </div>
          )}

          {/* Cumulative Performance 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 space-y-1">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} />
                Cumulative CGPA
              </span>
              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {requiresPayment && !isCurrentViewUnlocked ? "••••" : transcriptStats.cgpa}
                </span>
                {requiresPayment && !isCurrentViewUnlocked ? (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Lock size={11} /> Locked
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      ({transcriptStats.cgpaGrade})
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
                  </>
                )}
              </div>
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 pt-0.5 truncate">
                {requiresPayment && !isCurrentViewUnlocked ? "Official Records Protected" : transcriptStats.academicStanding}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Cumulative Average
              </span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {requiresPayment && !isCurrentViewUnlocked ? "••••" : `${transcriptStats.cumulativeAverage}%`}
                </span>
                {requiresPayment && !isCurrentViewUnlocked && (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Lock size={11} /> Locked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {requiresPayment && !isCurrentViewUnlocked ? "Clearance required" : `Over ${transcriptStats.scoredSubjectCount} verified scores`}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" />
                Total Subjects
              </span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {requiresPayment && !isCurrentViewUnlocked ? "••••" : transcriptStats.totalSubjectsOverall}
                </span>
                {requiresPayment && !isCurrentViewUnlocked && (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Lock size={11} /> Locked
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                {requiresPayment && !isCurrentViewUnlocked ? "Clearance required" : "Registered in transcript"}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-500" />
                Completed Terms
              </span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {requiresPayment && !isCurrentViewUnlocked ? "••••" : transcriptStats.totalTerms}
                </span>
                {requiresPayment && !isCurrentViewUnlocked ? (
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Lock size={11} /> Locked
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    ({transcriptStats.totalSessions} Sessions)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {requiresPayment && !isCurrentViewUnlocked ? "Clearance required" : "Certified terminal score sheets"}
              </p>
            </div>
          </div>

          {/* Paywall Clearance Banner or Course Breakdown */}
          {requiresPayment && !hasAnyUnlockedTerm && recentClearancePayments.length === 0 ? (
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
                    ? `As a graduated scholar of ${schoolName}, previewing and downloading certified official transcript records requires an archival clearance fee of ₦${transcriptFee.toLocaleString()} per academic term.`
                    : `Your institution requires portal session clearance of ₦${transcriptFee.toLocaleString()} per academic term to preview and verify academic records.`}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : (availableSessions[0]?.id || ""));
                    setPaymentTargetTerm(selectedTermFilter !== "ALL" ? selectedTermFilter : "FIRST");
                    setIsPaymentModalOpen(true);
                  }}
                  className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <CreditCard size={16} />
                  <span>Select Term & Pay Clearance (₦{transcriptFee.toLocaleString()})</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="h-12 px-5 rounded-2xl border-slate-300 dark:border-zinc-700 font-bold text-xs gap-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <Key size={14} />
                  <span>Already Paid? Restore 30-Day Access</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Partial Clearance Alert Strip */}
              {requiresPayment && !isCurrentViewUnlocked && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs my-3 print:hidden">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Lock size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        Partial Terminal Clearance Active
                      </span>
                      <span className="text-slate-600 dark:text-zinc-400">
                        Some academic terms require clearance. Unlocked terms are displayed below; select any locked term to clear it.
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPaymentTargetSessionId(selectedSessionId !== "ALL" ? selectedSessionId : (availableSessions[0]?.id || ""));
                      setPaymentTargetTerm(selectedTermFilter !== "ALL" ? selectedTermFilter : "FIRST");
                      setIsPaymentModalOpen(true);
                    }}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Clear Next Term
                  </Button>
                </div>
              )}

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
                      const isThisTermUnlocked = isTermUnlocked(sessionId, termGroup.term);
                      const matchingClearedPayment = recentClearancePayments.find(
                        (p) =>
                          (p.session === "All Sessions" || p.session === "ALL" || p.session === sessionId || p.session === sessionName) &&
                          (p.term === "All Terms" || p.term === "ALL" || p.term === termGroup.term || p.term === getTermLabel(termGroup.term))
                      );

                      return (
                        <div
                          key={`${sessionId}-${termGroup.term}-${termIdx}`}
                          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs"
                        >
                          {/* Term Summary Header Strip */}
                          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <span>{termLabel}</span>
                                {requiresPayment && !isThisTermUnlocked && (
                                  <Lock size={11} className="text-amber-300" />
                                )}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {termGroup.class?.name || "Class Cohort"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
                                <span>Term GPA:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {requiresPayment && !isThisTermUnlocked ? "••••" : termGpa}
                                </span>
                                {requiresPayment && !isThisTermUnlocked && (
                                  <span className="text-[10px] font-bold text-amber-500 ml-0.5">(Locked)</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-zinc-400">
                                <span>Average:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {requiresPayment && !isThisTermUnlocked ? "••••" : `${termAvg}%`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 font-semibold text-slate-500">
                                <span>Scores:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {requiresPayment && !isThisTermUnlocked ? "Clearance Req." : `${revealedCount}/${totalSubjects}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Term Scores Table or Locked Clearance Card */}
                          {requiresPayment && !isThisTermUnlocked ? (
                            matchingClearedPayment ? (
                              <div className="p-6 sm:p-8 text-center bg-blue-50/50 dark:bg-zinc-900/40 rounded-b-2xl border-t border-slate-200 dark:border-zinc-800 space-y-3">
                                <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                                  <ShieldCheck size={22} />
                                </div>
                                <div className="space-y-1 max-w-md mx-auto">
                                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                                    {termLabel} Cleared & Ready for Preview
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    You already completed clearance for {termLabel} ({sessionName}) on {format(new Date(matchingClearedPayment.paidAt || matchingClearedPayment.createdAt), "dd MMM yyyy")} (Class: <strong>{enrolledClass}</strong>). Transcripts cannot be accessed directly from the dashboard; click below to resend your secure 30-day preview link to your email.
                                  </p>
                                </div>
                                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                                  <Button
                                    size="sm"
                                    onClick={() => handleResendLink(matchingClearedPayment.reference)}
                                    disabled={isResendingLink}
                                    className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                                  >
                                    <Mail size={14} />
                                    <span>{isResendingLink ? "Sending Link..." : `Resend Link to Preview ${termLabel}`}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsRestoreModalOpen(true)}
                                    className="h-10 px-3.5 rounded-xl border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer gap-1"
                                  >
                                    <Key size={13} />
                                    <span>Enter Pass Token</span>
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-6 sm:p-8 text-center bg-slate-50/70 dark:bg-zinc-900/40 rounded-b-2xl border-t border-slate-200 dark:border-zinc-800 space-y-3">
                                <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                                  <Lock size={22} />
                                </div>
                                <div className="space-y-1 max-w-md mx-auto">
                                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                                    {termLabel} Scores Locked ({sessionName})
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    Terminal academic records for {termLabel} are locked pending individual clearance. Clear this term via Flutterwave to view course scores, assessments, and grade points.
                                  </p>
                                </div>
                                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setPaymentTargetSessionId(sessionId);
                                      setPaymentTargetTerm(termGroup.term);
                                      setIsPaymentModalOpen(true);
                                    }}
                                    className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                                  >
                                    <CreditCard size={14} />
                                    <span>Pay ₦{transcriptFee.toLocaleString()} to Unlock {termLabel}</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsRestoreModalOpen(true)}
                                    className="h-10 px-3.5 rounded-xl border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer gap-1"
                                  >
                                    <Key size={13} />
                                    <span>Restore Pass</span>
                                  </Button>
                                </div>
                              </div>
                            )
                          ) : (
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
                          )}
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

          {requiresPayment && !isTermUnlocked(evalSessionId, evalTerm) ? (
            (() => {
              const matchingClearedPayment = recentClearancePayments.find(
                (p) =>
                  (p.session === "All Sessions" || p.session === "ALL" || p.session === evalSessionId || p.session === activeEvalGroup?.session?.name) &&
                  (p.term === "All Terms" || p.term === "ALL" || p.term === evalTerm || p.term === getTermLabel(evalTerm))
              );

              return matchingClearedPayment ? (
                <div className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent border-2 border-dashed border-emerald-300 dark:border-emerald-800/60 rounded-3xl p-6 sm:p-10 text-center space-y-4 print:hidden animate-in fade-in duration-300 my-6">
                  <div className="size-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck size={30} />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Conduct Evaluation Records Cleared ({getTermLabel(evalTerm)})
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      You already completed clearance for {getTermLabel(evalTerm)} on {format(new Date(matchingClearedPayment.paidAt || matchingClearedPayment.createdAt), "dd MMM yyyy")} (Class: <strong>{enrolledClass}</strong>). Transcripts cannot be accessed directly from the dashboard; click below to resend your secure 30-day preview link to your email.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      onClick={() => handleResendLink(matchingClearedPayment.reference)}
                      disabled={isResendingLink}
                      className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Mail size={16} />
                      <span>{isResendingLink ? "Sending Link..." : `Resend Link to Preview Conduct Records`}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRestoreModalOpen(true)}
                      className="h-12 px-5 rounded-2xl border-slate-300 dark:border-zinc-700 font-bold text-xs gap-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Key size={14} />
                      <span>Enter Pass Token</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-10 text-center space-y-4 print:hidden animate-in fade-in duration-300 my-6">
                  <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                    <Lock size={30} />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Conduct & Character Evaluation Records Locked ({getTermLabel(evalTerm)})
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {isGraduated
                        ? `As a graduated scholar of ${schoolName}, full certified appraisal of affective domain traits, psychomotor skills, and leadership remarks for ${getTermLabel(evalTerm)} require an archival clearance fee of ₦${transcriptFee.toLocaleString()}.`
                        : `Your institution requires portal session clearance of ₦${transcriptFee.toLocaleString()} for ${getTermLabel(evalTerm)} to preview and verify conduct appraisal records.`}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      onClick={() => {
                        setPaymentTargetSessionId(evalSessionId || (availableSessions[0]?.id || ""));
                        setPaymentTargetTerm(evalTerm || "FIRST");
                        setIsPaymentModalOpen(true);
                      }}
                      className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-600/25 gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <CreditCard size={16} />
                      <span>Pay ₦{transcriptFee.toLocaleString()} to Unlock {getTermLabel(evalTerm)}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRestoreModalOpen(true)}
                      className="h-12 px-5 rounded-2xl border-slate-300 dark:border-zinc-700 font-bold text-xs gap-1.5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Key size={14} />
                      <span>Already Paid? Restore 30-Day Access</span>
                    </Button>
                  </div>
                </div>
              );
            })()
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
        <DialogContent className="max-w-3xl lg:max-w-4xl xl:max-w-5xl w-[95vw] p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-2xl">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

            <div className="relative space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  Official Clearance Gateway
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  <Lock size={10} /> 256-Bit SSL Secured
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                  Instant Auto-Unlock
                </span>
              </div>

              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <CreditCard className="size-6 sm:size-7 text-blue-400" />
                  Official Transcript Clearance
                </DialogTitle>
                <DialogDescription className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl">
                  Clearance fee required by {schoolName} for archival records verification, electronic endorsement, and official document release.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column (7 cols): Scholar Snapshot, Scope Selector, Inclusions */}
              <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-5">
                  {/* Scholar Snapshot Strip */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center shrink-0 border border-blue-500/20">
                        {studentProfile?.name ? studentProfile.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {studentProfile?.name || user?.name || "Enrolled Scholar"}
                        </p>
                        <p className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 truncate">
                          ID: {studentProfile?.studentCode || "SCH-RECORD"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scope</span>
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-300">
                        {paymentTargetSessionId && paymentTargetTerm
                          ? `${availableSessions.find((s) => s.id === paymentTargetSessionId)?.name || "Session"} • ${getTermLabel(paymentTargetTerm)}`
                          : paymentTargetSessionId
                          ? `${availableSessions.find((s) => s.id === paymentTargetSessionId)?.name || "Session"} (Select Term)`
                          : "Select Session & Term"}
                      </span>
                    </div>
                  </div>

                  {/* Step 1: Session Selector (Required) */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                        1. Select Academic Session <span className="text-rose-500">*</span>
                      </span>
                      {paymentTargetSessionId ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Required</span>
                      )}
                    </label>
                    <Select value={paymentTargetSessionId} onValueChange={setPaymentTargetSessionId}>
                      <SelectTrigger className={cn(
                        "h-12 px-4 rounded-2xl border font-bold text-xs bg-white dark:bg-zinc-900 shadow-xs transition-all",
                        !paymentTargetSessionId
                          ? "border-amber-300 dark:border-amber-800 ring-1 ring-amber-400/20"
                          : "border-slate-200 dark:border-zinc-800"
                      )}>
                        <SelectValue placeholder="Choose Academic Session..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl">
                        {availableSessions.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="py-3 text-xs font-semibold">
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 2: Term Selector (Required) */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-blue-600 dark:text-blue-400" />
                        2. Select Academic Term <span className="text-rose-500">*</span>
                      </span>
                      {paymentTargetTerm ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Required</span>
                      )}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "FIRST", label: "1st Term" },
                        { value: "SECOND", label: "2nd Term" },
                        { value: "THIRD", label: "3rd Term" },
                      ].map((termOpt) => {
                        const isSelected = paymentTargetTerm === termOpt.value;
                        return (
                          <button
                            key={termOpt.value}
                            type="button"
                            onClick={() => setPaymentTargetTerm(termOpt.value)}
                            className={cn(
                              "h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer",
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/30"
                                : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                            )}
                          >
                            {isSelected && <Check size={13} className="shrink-0" />}
                            <span>{termOpt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Scope Feedback Alert */}
                  {paymentTargetSessionId && paymentTargetTerm ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Target Clearance Lock</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {availableSessions.find((s) => s.id === paymentTargetSessionId)?.name || "Session"} • {getTermLabel(paymentTargetTerm)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <AlertCircle size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Selection Required</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                          {!paymentTargetSessionId && !paymentTargetTerm
                            ? "Please select both an academic session and term to enable checkout."
                            : !paymentTargetSessionId
                            ? "Please select an academic session above."
                            : "Please select an academic term (1st, 2nd, or 3rd Term)."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Inclusions List */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 space-y-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                      What this official clearance covers:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                      <li className="flex items-start gap-2">
                        <CheckCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Instant unmasking of full course results, CGPA & GPA points</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Certified Registrar seal & Head of Institution digital signatures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>Tamper-evident verification reference (TRX code) for embassies & universities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCheck size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>High-resolution PDF generation and browser printing rights</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Fee Summary, Payment Channels, Pay CTA */}
              <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Fee Summary Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Clearance Fee
                        </span>
                        <p className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                          ₦{transcriptFee.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-300 mt-0.5">One-time official institutional fee</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-400/20">
                        <CreditCard size={20} />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beneficiary</span>
                        <p className="font-black text-white truncate max-w-[170px] mt-0.5">
                          {schoolName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 font-semibold inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck size={12} /> Verified Subaccount
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Badges */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Accepted Payment Channels
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700/80 text-center truncate">
                        Debit / Credit Cards
                      </span>
                      <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700/80 text-center truncate">
                        Bank Transfer
                      </span>
                      <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700/80 text-center truncate">
                        USSD
                      </span>
                      <span className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700/80 text-center truncate">
                        Mobile Money
                      </span>
                    </div>
                  </div>
                </div>

                {/* Online Payment CTA */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleInitiateOnlinePayment}
                    disabled={isPayingOnline || !paymentTargetSessionId || !paymentTargetTerm}
                    className={cn(
                      "w-full h-13 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all",
                      paymentTargetSessionId && paymentTargetTerm && !isPayingOnline
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                        : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-80 shadow-none"
                    )}
                  >
                    {isPayingOnline ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Flutterwave...</span>
                      </>
                    ) : !paymentTargetSessionId ? (
                      <>
                        <Lock size={16} />
                        <span>1. Select Academic Session to Continue</span>
                      </>
                    ) : !paymentTargetTerm ? (
                      <>
                        <Lock size={16} />
                        <span>2. Select Academic Term to Continue</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Pay ₦{transcriptFee.toLocaleString()} for {getTermLabel(paymentTargetTerm)} via Flutterwave</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-center text-slate-400 dark:text-zinc-500 leading-tight">
                    {!paymentTargetSessionId || !paymentTargetTerm
                      ? "Both academic session and term must be selected before payment can proceed."
                      : `Once payment is confirmed, official records for ${getTermLabel(paymentTargetTerm)} will unlock automatically.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between sm:justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              Powered by Flutterwave • PCI-DSS Level 1 Certified
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaymentModalOpen(false)}
              className="rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 9. Restore 30-Day Clearance Access Dialog ──────────────────────── */}
      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Key size={22} />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              Restore Official Transcript Access
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              If you previously paid for clearance, had an internet interruption, or received a 30-day link, paste your reference code or link below to restore full access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Payment Reference or Pass Link / Token
              </label>
              <Input
                placeholder="e.g. TRX-172938... or paste pass link"
                value={restoreInput}
                onChange={(e) => setRestoreInput(e.target.value)}
                className="h-11 rounded-xl text-xs font-semibold border-slate-200 dark:border-zinc-800"
              />
              <p className="text-[11px] text-slate-400">
                Found on your payment receipt email or Flutterwave confirmation SMS.
              </p>
            </div>

            <Button
              onClick={handleRestoreAccess}
              disabled={isRestoring || !restoreInput.trim()}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
            >
              {isRestoring ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating Clearance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Validate & Unlock Transcript</span>
                </>
              )}
            </Button>
          </div>

          <DialogFooter className="border-t border-slate-100 dark:border-zinc-800 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRestoreModalOpen(false)}
              className="rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
