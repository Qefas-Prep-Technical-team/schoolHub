import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  useStudentProfile,
  useTermlyEvaluation,
  useStudentDownloadAudit,
  useRecordStudentDownload,
} from "@/lib/api/hooks/useStudent";
import { useMyPublishedResults } from "@/lib/api/hooks/useRecords";
import { useSchoolProfile, useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { GradingRule } from "@/utils/gradingSystem";
import {
  PublishedResultGroup,
  GraduatedSchoolBadge,
  TranscriptStatsSummary,
  StudentTranscriptAccessTier,
  getTermLabel,
  getGradePoint,
  getCgpaGrade,
} from "../types/transcript.types";
import { useTranscriptSignatures } from "./useTranscriptSignatures";

export function useStudentTranscriptData() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { data: studentProfile, isLoading: isProfileLoading } =
    useStudentProfile();
  const { data: rawPublishedResults, isLoading: isResultsLoading } =
    useMyPublishedResults();

  const [logoLoadError, setLogoLoadError] = useState(false);
  const [activePageView, setActivePageView] = useState<
    "all" | "page1" | "page2"
  >("page1");
  const [selectedEvaluationIdx, setSelectedEvaluationIdx] = useState<number>(0);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("ALL");
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("ALL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const results =
    (rawPublishedResults as PublishedResultGroup[] | undefined) || [];

  const isSchoolConnected = Boolean(
    studentProfile?.schoolId ||
    studentProfile?.school?.id ||
    (user?.schools && user.schools.length > 0),
  );

  const school = studentProfile?.school;
  const userRecord = user as Record<string, unknown> | null | undefined;
  const schoolId =
    studentProfile?.schoolId ||
    school?.id ||
    user?.schools?.[0]?.schoolId ||
    (typeof userRecord?.schoolId === "string" ? userRecord.schoolId : "") ||
    user?.tenantId ||
    ((user?.schools?.[0] as Record<string, unknown>)?.id as string) ||
    "";

  const { data: schoolProfile, isLoading: isSchoolProfileLoading } = useSchoolProfile(schoolId);
  const { data: schoolSessionsData } = useSessions(schoolId);
  const schoolName = schoolProfile?.name || school?.name || "Institution";
  const schoolMotto =
    schoolProfile?.motto ||
    ((school as Record<string, unknown>)?.motto as string) ||
    "Empowering minds for a better tomorrow.";
  const schoolLocation =
    schoolProfile?.address ||
    ((school as Record<string, unknown>)?.address as string) ||
    "Official Institutional Record";
  const schoolLogoUrl =
    !logoLoadError &&
      (schoolProfile?.logo || ((school as Record<string, unknown>)?.logo as string))
      ? schoolProfile?.logo ||
      ((school as Record<string, unknown>)?.logo as string)
      : null;
  const gradingSystem = (schoolProfile?.gradingSystem ||
    (school as Record<string, unknown>)?.gradingSystem) as
    | GradingRule[]
    | null
    | undefined;

  const { data: schoolSettings, isLoading: isSchoolSettingsLoading } = useSchoolSettings(schoolId);

  const rawFee =
    (schoolSettings as Record<string, unknown> | undefined)?.transcriptFee ??
    ((schoolProfile as Record<string, unknown> | undefined)?.settings as
      | Record<string, unknown>
      | undefined)?.transcriptFee;

  // We are loading fee if profile is loading, or schoolId not yet discovered, or settings/profile queries are pending
  const isFeeLoading =
    isProfileLoading ||
    !schoolId ||
    isSchoolSettingsLoading ||
    (rawFee === undefined && isSchoolProfileLoading);

  const transcriptFee =
    rawFee !== undefined && rawFee !== null
      ? Number(rawFee)
      : isFeeLoading
        ? 0
        : 5000;

  const studentId =
    studentProfile?.id || (((user as unknown) as Record<string, unknown>)?.id as string) || "";
  const {
    data: auditData,
    isLoading: isAuditLoading,
    refetch: refetchAudit,
  } = useStudentDownloadAudit(studentId);
  const recordDownloadMutation = useRecordStudentDownload(studentId);

  const { principalSlot, registrarSlot } = useTranscriptSignatures(
    schoolProfile as Record<string, unknown> | null | undefined,
    school as Record<string, unknown> | null | undefined,
    schoolName,
    results,
  );

  const isGraduated = useMemo(() => {
    const profRec = studentProfile as unknown as Record<string, unknown>;
    const userRec = user as unknown as Record<string, unknown>;
    const sStatus = String(
      profRec?.status || userRec?.status || searchParams.get("status") || "",
    ).toUpperCase();
    const gStatus = String(profRec?.graduationStatus || "").toUpperCase();
    const isAlum = Boolean(
      profRec?.isAlumni || userRec?.isAlumni || profRec?.graduated,
    );
    const hasGradParam =
      searchParams.get("graduated") === "true" ||
      searchParams.get("alumni") === "true";
    return (
      sStatus === "GRADUATED" ||
      sStatus === "ALUMNI" ||
      gStatus === "GRADUATED" ||
      isAlum ||
      hasGradParam
    );
  }, [studentProfile, user, searchParams]);

  const graduatedSchools = useMemo((): GraduatedSchoolBadge[] => {
    const list: GraduatedSchoolBadge[] = [];
    const seen = new Set<string>();
    const profRec = studentProfile as unknown as Record<string, unknown>;

    const addSchool = (
      id?: string | null,
      name?: string | null,
      logo?: string | null,
      motto?: string | null,
    ) => {
      if (!name) return;
      const key = (id || name).toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          id: id || key,
          name: name.trim(),
          logo: logo || null,
          motto: motto || null,
          graduationYear:
            (profRec?.graduationYear as string | number) ||
            (profRec?.graduatedYear as string | number) ||
            new Date().getFullYear(),
        });
      }
    };

    addSchool(
      schoolProfile?.id || schoolId,
      schoolProfile?.name || schoolName,
      schoolProfile?.logo || schoolLogoUrl,
      schoolProfile?.motto || schoolMotto,
    );
    if (school) {
      const schRec = school as unknown as Record<string, unknown>;
      addSchool(
        school.id,
        school.name,
        schRec.logo as string,
        schRec.motto as string,
      );
    }
    const origSchool = profRec?.originalSchool as
      | Record<string, unknown>
      | undefined;
    if (origSchool) {
      addSchool(
        origSchool.id as string,
        origSchool.name as string,
        origSchool.logo as string,
        origSchool.motto as string,
      );
    }
    return list;
  }, [
    schoolProfile,
    schoolId,
    schoolName,
    schoolLogoUrl,
    schoolMotto,
    school,
    studentProfile,
  ]);

  const isSchoolPaidPlan = useMemo(() => {
    const schRec = school as unknown as Record<string, unknown>;
    const plan = String(
      schoolProfile?.plan || schRec?.plan || "FREE",
    ).toUpperCase();
    const subStatus = String(
      schoolProfile?.subscriptionStatus || schRec?.subscriptionStatus || "",
    ).toUpperCase();
    const isTrial = Boolean(
      schoolProfile?.isTrialActive || schRec?.isTrialActive,
    );
    return (
      isTrial ||
      (plan !== "FREE" &&
        plan !== "" &&
        (subStatus === "ACTIVE" || subStatus === ""))
    );
  }, [schoolProfile, school]);

  const accessTier: StudentTranscriptAccessTier = useMemo(() => {
    if (isGraduated) return "GRADUATED_ALUMNI";
    if (isSchoolPaidPlan) return "PAID_SCHOOL_ACTIVE";
    return "FREE_TIER_SCHOOL";
  }, [isGraduated, isSchoolPaidPlan]);

  const availableSessions = useMemo(() => {
    const map = new Map<string, string>();

    // 1. First add any sessions configured in the institution
    const rawSchoolSessions = Array.isArray(schoolSessionsData)
      ? schoolSessionsData
      : Array.isArray((schoolSessionsData as { data?: unknown[] } | undefined)?.data)
        ? (schoolSessionsData as { data: Array<{ id: string; name: string }> }).data
        : [];

    rawSchoolSessions.forEach((s: { id?: string; name?: string }) => {
      if (s?.id && s?.name) {
        map.set(s.id, s.name);
      }
    });

    // 2. Also incorporate sessions from published result records
    results.forEach((g) => {
      const sId = g.sessionId;
      const sName = g.session?.name;
      if (sId && sName && !map.has(sId)) {
        map.set(sId, sName);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [schoolSessionsData, results]);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (selectedSessionId !== "ALL" && r.sessionId !== selectedSessionId)
        return false;
      if (selectedTermFilter !== "ALL" && r.term !== selectedTermFilter)
        return false;
      return true;
    });
  }, [results, selectedSessionId, selectedTermFilter]);

  const filteredGroupedBySession = useMemo(() => {
    const sessionMap = new Map<
      string,
      { sessionName: string; terms: PublishedResultGroup[] }
    >();
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

  const transcriptStats: TranscriptStatsSummary = useMemo(() => {
    let totalMarksSum = 0;
    let scoredSubjectCount = 0;
    let totalPointsSum = 0;
    let totalSubjectsOverall = 0;

    filteredResults.forEach((group) => {
      (group.subjectResults || []).forEach((s) => {
        totalSubjectsOverall++;
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
        if (s.scoresRevealed && effectiveTotal != null) {
          totalMarksSum += effectiveTotal;
          totalPointsSum += getGradePoint(effectiveTotal, gradingSystem);
          scoredSubjectCount++;
        }
      });
    });

    const cgpa =
      scoredSubjectCount > 0
        ? (totalPointsSum / scoredSubjectCount).toFixed(2)
        : "0.00";
    const cumulativeAverage =
      scoredSubjectCount > 0
        ? Math.round(totalMarksSum / scoredSubjectCount)
        : 0;
    const numericCGPA = parseFloat(cgpa);
    const academicStanding =
      numericCGPA >= 4.5 || cumulativeAverage >= 75
        ? "First Class Honors / Excellent"
        : numericCGPA >= 3.5 || cumulativeAverage >= 65
          ? "Second Class Upper / Very Good"
          : numericCGPA >= 2.5 || cumulativeAverage >= 50
            ? "Second Class Lower / Good"
            : numericCGPA >= 1.5 || cumulativeAverage >= 40
              ? "Third Class / Pass"
              : "Academic Warning / Needs Improvement";

    return {
      cgpa,
      cgpaGrade: getCgpaGrade(numericCGPA, cumulativeAverage, gradingSystem),
      cumulativeAverage,
      totalSubjectsOverall,
      scoredSubjectCount,
      academicStanding,
      totalSessions: new Set(filteredResults.map((r) => r.sessionId)).size,
      totalTerms: filteredResults.length,
    };
  }, [filteredResults, gradingSystem]);

  const evalCandidates =
    filteredResults.length > 0 ? filteredResults : results;
  const safeEvalIdx =
    selectedEvaluationIdx < evalCandidates.length ? selectedEvaluationIdx : 0;
  const activeEvalGroup = evalCandidates[safeEvalIdx] || results[0];
  const evalSessionId = activeEvalGroup?.sessionId || "";
  const evalTerm =
    (activeEvalGroup?.term as "FIRST" | "SECOND" | "THIRD") || "FIRST";
  const profClasses = (studentProfile as Record<string, unknown> | undefined)
    ?.classes as Array<{ class?: { id?: string; name?: string; section?: string } }> | undefined;
  const evalClassId =
    activeEvalGroup?.class?.id || profClasses?.[0]?.class?.id || "";
  const { data: serverEvaluation } = useTermlyEvaluation(
    studentId,
    evalClassId,
    evalSessionId,
    evalTerm,
  );

  const enrolledClass = profClasses?.[0]?.class?.name
    ? `${profClasses[0].class.name} ${profClasses[0].class.section || ""}`.trim()
    : "Active Enrolled";

  return {
    user,
    studentProfile,
    studentId,
    isProfileLoading,
    isResultsLoading,
    results,
    filteredResults,
    filteredGroupedBySession,
    availableSessions,
    isSchoolConnected,
    schoolId,
    schoolProfile,
    schoolName,
    schoolMotto,
    schoolLocation,
    schoolLogoUrl,
    setLogoLoadError,
    gradingSystem,
    transcriptFee,
    isFeeLoading,
    auditData,
    isAuditLoading,
    refetchAudit,
    recordDownloadMutation,
    principalSlot,
    registrarSlot,
    isGraduated,
    graduatedSchools,
    isSchoolPaidPlan,
    accessTier,
    transcriptStats,
    evalCandidates,
    safeEvalIdx,
    activeEvalGroup,
    evalSessionId,
    evalTerm,
    serverEvaluation,
    enrolledClass,
    activePageView,
    setActivePageView,
    selectedEvaluationIdx,
    setSelectedEvaluationIdx,
    selectedSessionId,
    setSelectedSessionId,
    selectedTermFilter,
    setSelectedTermFilter,
    isSidebarOpen,
    setIsSidebarOpen,
  };
}
