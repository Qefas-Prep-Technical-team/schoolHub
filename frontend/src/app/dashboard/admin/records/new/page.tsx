"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Search,
  Download,
  Loader2,
  Settings,
  Pencil,
  Check,
  UploadCloud,
  PenLine,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Filter,
  RotateCcw,
  Heart,
  Activity,
  Star,
  Sparkles,
  MessageSquare,
  Award,
  CheckCheck,
  SlidersHorizontal,
  Eye,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ResultRecordUploadModal, { UploadCategory } from "./components/ResultRecordUploadModal";
import { EditConfigModal } from "./components/EditConfigModal";
import { ScoreBreakdownModal } from "./components/ScoreBreakdownModal";
import { SyncProgressModal } from "./components/SyncProgressModal";
import { SummaryPanel } from "./components/SummaryPanel";
import { useClassSubjectResult, useStudentSubjectResults, useBulkSaveStudentSubjectResults, useUpdatePaperLinks, useCalculatePaperSync, usePublishClassSubjectResult, useUnpublishClassSubjectResult } from "@/lib/api/hooks/useRecords";
import { useSubjectPapers } from "@/lib/api/hooks/useExams";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useAdminAssignments } from "@/lib/api/hooks/useAssignments";
import {
  useStudents,
  useClassTermlyEvaluations,
  useBulkUpsertTermlyEvaluations,
} from "@/lib/api/hooks/useStudent";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { gradeService } from "@/lib/api/services/gradeService";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { getGradeEvaluation } from "@/utils/gradingSystem";

function StudentAvatar({ name, profileImage }: { name: string; profileImage?: string | null }) {
  const [hasError, setHasError] = useState(false);
  const initial = (name || "S").trim().charAt(0).toUpperCase();

  if (profileImage && !hasError) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <img
          src={profileImage}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-[#5B5CE6]/10 text-[#5B5CE6] font-extrabold text-xs flex items-center justify-center flex-shrink-0 border border-[#5B5CE6]/20 shadow-xs uppercase select-none">
      {initial}
    </div>
  );
}

function formatAdminRole(role?: string | null): string {
  if (!role) return "School Administrator";
  const r = role.toUpperCase().trim();
  switch (r) {
    case "SCHOOL_OWNER":
      return "School Owner";
    case "PRINCIPAL":
      return "Principal";
    case "VICE_PRINCIPAL":
      return "Vice Principal";
    case "REGISTRAR":
      return "Registrar";
    case "ACCOUNTANT":
      return "Accountant";
    case "SUPPORT":
      return "Support Administrator";
    case "ADMIN":
      case "ADMINISTRATOR":
      return "School Administrator";
    default:
      return role
        .replace(/_/g, " ")
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
  }
}

function getRatingBadgeClass(rating: number | string) {
  const r = parseInt(String(rating), 10);
  switch (r) {
    case 5:
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    case 4:
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case 3:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case 2:
      return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    case 1:
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    default:
      return "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
}

function RatingSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: string | number;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const val = String(value || "5");
  return (
    <select
      value={val}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-14 mx-auto text-center font-bold text-xs rounded-lg px-1.5 py-1.5 border outline-none cursor-pointer transition-all ${getRatingBadgeClass(
        val
      )} focus:ring-2 focus:ring-[#5B5CE6]/30 disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <option value="5" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-bold">5 - Distinction</option>
      <option value="4" className="bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold">4 - Commendable</option>
      <option value="3" className="bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 font-bold">3 - Acceptable</option>
      <option value="2" className="bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-300 font-bold">2 - Minimal</option>
      <option value="1" className="bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 font-bold">1 - Needs Attention</option>
    </select>
  );
}

const AFFECTIVE_TRAITS = [
  { key: "attentiveness", label: "Attentiveness", fullLabel: "Attentiveness & Focus", desc: "Concentration in learning activities" },
  { key: "honesty", label: "Honesty", fullLabel: "Honesty & Integrity", desc: "Truthfulness in conduct and assignments" },
  { key: "neatness", label: "Neatness", fullLabel: "Neatness & Hygiene", desc: "Orderliness in personal appearance" },
  { key: "politeness", label: "Politeness", fullLabel: "Politeness & Courtesy", desc: "Respectful conduct towards others" },
  { key: "punctuality", label: "Punctuality", fullLabel: "Punctuality & Attendance", desc: "Prompt arrival to school and classes" },
  { key: "selfControl", label: "Self Control", fullLabel: "Self Control & Stability", desc: "Emotional maturity and calmness" },
  { key: "obedience", label: "Obedience", fullLabel: "Obedience & Compliance", desc: "Adherence to rules and instructions" },
  { key: "reliability", label: "Reliability", fullLabel: "Reliability & Dependability", desc: "Faithful execution of duties" },
  { key: "responsibility", label: "Responsibility", fullLabel: "Sense of Responsibility", desc: "Ownership of academic tasks" },
  { key: "relationship", label: "Relationship", fullLabel: "Relationship with Peers", desc: "Empathy and teamwork" },
] as const;

const PSYCHOMOTOR_SKILLS = [
  { key: "handwriting", label: "Handwriting", fullLabel: "Handwriting & Penmanship", desc: "Legibility, spacing and presentation" },
  { key: "handlingTools", label: "Handling Tools", fullLabel: "Handling Tools & Equipment", desc: "Care and precision with tools" },
  { key: "drawingPainting", label: "Drawing & Crafts", fullLabel: "Drawing, Painting & Crafts", desc: "Artistic representation and design" },
  { key: "publicSpeaking", label: "Public Speaking", fullLabel: "Public Speaking & Oratory", desc: "Confidence and poise in presentations" },
  { key: "speechFluency", label: "Speech Fluency", fullLabel: "Speech Fluency & Diction", desc: "Clarity and vocabulary" },
  { key: "sportsGames", label: "Sports & Athletics", fullLabel: "Sports, Games & Athletics", desc: "Physical dexterity and sportsmanship" },
] as const;

const PRESET_REMARKS = [
  "An exceptionally diligent and well-behaved scholar. Keeps up high standards consistently.",
  "Very good academic performance and commendable conduct throughout the term.",
  "Hardworking, disciplined and cooperative with peers and teachers alike.",
  "Good performance with positive attitude to learning. Capable of even greater heights.",
  "Demonstrates high potential and active participation in class activities.",
  "Polite, punctual and obedient. Keep striving for academic excellence.",
];

export default function NewFinalResultDataEntryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { user } = useAuthStore();
  const adminRoleTitle = useMemo(() => {
    return formatAdminRole(user?.adminRole || user?.role || "ADMIN");
  }, [user?.adminRole, user?.role]);
  // Data Hooks
  const { data: config, isLoading: isLoadingConfig } = useClassSubjectResult(id || undefined);
  const effectiveSchoolId = config?.schoolId || user?.schools?.[0]?.schoolId || (user as any)?.school?.id || user?.tenantId || "";
  
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(
    effectiveSchoolId,
    { classId: config?.classId, limit: 500 },
    { enabled: !!config?.classId }
  );
  // studentsData is directly an array (service returns response.data.data)
  const rawStudents = Array.isArray(studentsData) ? studentsData : [];

  const { data: existingMarks, isLoading: isLoadingMarks } = useStudentSubjectResults({
    classId: config?.classId,
    subjectId: config?.subjectId,
    sessionId: config?.sessionId,
    term: config?.term
  });

  const { mutate: saveResults, isPending: isSaving } = useBulkSaveStudentSubjectResults();
  const calculateSyncMutation = useCalculatePaperSync();
  const { mutate: publishResult, isPending: isPublishing } = usePublishClassSubjectResult();
  const { mutate: unpublishResult, isPending: isUnpublishing } = useUnpublishClassSubjectResult();

  // Termly Evaluation Hooks for Conduct & Remarks
  const { data: classEvaluations = [], isLoading: isLoadingEvaluations } = useClassTermlyEvaluations(
    config?.classId,
    config?.sessionId,
    config?.term
  );
  const { mutate: bulkSaveTermlyEvaluations, isPending: isSavingEvaluations } = useBulkUpsertTermlyEvaluations();

  // Local State
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"academic" | "evaluation" | "details">("academic");
  const [evalSubTab, setEvalSubTab] = useState<"key" | "affective" | "psychomotor" | "remarks">("key");
  const [evalModalStudentId, setEvalModalStudentId] = useState<string | null>(null);
  const evalModalStudent = useMemo(
    () => (evalModalStudentId ? students.find((s) => s.id === evalModalStudentId) || null : null),
    [students, evalModalStudentId]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 20;

  // Paper assignments per assessment category (multi-select)
  const [paperAssignments, setPaperAssignments] = useState<{
    exam: string[]; subjectPaper: string[]; ca: string[]; assignment: string[];
  }>({ exam: [], subjectPaper: [], ca: [], assignment: [] });
  const [paperSearch, setPaperSearch] = useState<{
    exam: string; subjectPaper: string; ca: string; assignment: string;
  }>({ exam: "", subjectPaper: "", ca: "", assignment: "" });

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditConfigOpen, setIsEditConfigOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [adminSignature, setAdminSignature] = useState("");
  const [unpublishReason, setUnpublishReason] = useState("");
  
  const [breakdownModal, setBreakdownModal] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    category: "ca" | "quiz" | "exam" | "assignment" | null;
    categoryMax: number | null;
  }>({ isOpen: false, studentId: "", studentName: "", category: null, categoryMax: null });

  // Update paper links mutation
  const { mutate: savePaperLinks, isPending: isSavingLinks } = useUpdatePaperLinks();

  // Term & Session filters for Configuration Details
  const [activeFilterSession, setActiveFilterSession] = useState<string>("default");
  const [activeFilterTerm, setActiveFilterTerm] = useState<string>("default");

  const approvalHistory: any[] = useMemo(() => {
    const pl = config?.paperLinks as any;
    if (Array.isArray(pl?.approvalHistory) && pl.approvalHistory.length > 0) {
      return pl.approvalHistory;
    }
    if (pl?.approval?.status === "APPROVED") {
      return [pl.approval];
    }
    return [];
  }, [config?.paperLinks]);

  const { data: sessionsData } = useSessions(effectiveSchoolId);
  const sessions: any[] = useMemo(() => {
    if (Array.isArray(sessionsData?.data)) return sessionsData.data;
    if (Array.isArray(sessionsData)) return sessionsData;
    return [];
  }, [sessionsData]);

  const resolvedSessionFilter = activeFilterSession === "default" 
    ? config?.sessionId 
    : (activeFilterSession === "all" ? undefined : activeFilterSession);
  const resolvedTermFilter = activeFilterTerm === "default" 
    ? config?.term 
    : (activeFilterTerm === "all" ? undefined : activeFilterTerm);

  const { data: subjectPapersResult, isLoading: isLoadingPapers } = useSubjectPapers(
    config?.subjectId ? { 
      subjectId: config.subjectId,
      classId: config.classId,
      sessionId: resolvedSessionFilter,
      term: resolvedTermFilter
    } : undefined
  );
  const subjectPapers: any[] = Array.isArray(subjectPapersResult) 
    ? subjectPapersResult 
    : (subjectPapersResult as any)?.data || [];

  const { data: assignmentsResult, isLoading: isLoadingAssignments } = useAdminAssignments(effectiveSchoolId);
  const assignments: any[] = assignmentsResult?.assignments || [];

  // Fetch offline marksheet grades matching class and session/term filters
  const { data: offlineGradesData, isLoading: isLoadingOfflineGrades } = useQuery({
    queryKey: ['records-new-offline-grades', effectiveSchoolId, config?.classId, resolvedSessionFilter, resolvedTermFilter],
    queryFn: async () => {
      if (!effectiveSchoolId || !config?.classId) return [];
      const res = await gradeService.getGradeHub(effectiveSchoolId, {
        classId: config.classId,
        sessionId: resolvedSessionFilter,
        term: resolvedTermFilter,
        offlineOnly: 'true',
        limit: 1000,
      });
      return Array.isArray(res?.grades) ? res.grades : (Array.isArray(res?.data) ? res.data : []);
    },
    enabled: !!effectiveSchoolId && !!config?.classId,
    staleTime: 1000 * 60 * 3,
  });

  const offlineBatches = useMemo(() => {
    if (!Array.isArray(offlineGradesData)) return [];
    const map = new Map<string, {
      id: string;
      title: string;
      category: "EXAM" | "QUIZ" | "CA" | "ASSIGNMENT";
      totalMarks: number;
      gradedCount: number;
      totalStudents: number;
      isOffline: boolean;
      sessionName?: string;
      term?: string;
      status: string;
    }>();

    offlineGradesData.forEach((g: any) => {
      if (g.subjectPaperId || g.subjectPaper || g.examAttemptId) return;
      const cat = (g.category || "CA").toUpperCase() as "EXAM" | "QUIZ" | "CA" | "ASSIGNMENT";
      const title = g.assessmentType || `${cat} Marksheet`;
      const key = `${cat}_${title.trim().toLowerCase()}`;

      const existing = map.get(key);
      const hasScore = g.score != null && !isNaN(Number(g.score));

      if (existing) {
        existing.totalStudents += 1;
        if (hasScore) existing.gradedCount += 1;
        if (g.maxMarks && g.maxMarks > existing.totalMarks) existing.totalMarks = g.maxMarks;
      } else {
        map.set(key, {
          id: g.id,
          title: title,
          category: cat,
          totalMarks: g.maxMarks || (cat === "EXAM" ? 60 : cat === "CA" ? 20 : 10),
          gradedCount: hasScore ? 1 : 0,
          totalStudents: 1,
          isOffline: true,
          sessionName: g.session?.name,
          term: g.term,
          status: g.status || "SAVED",
        });
      }
    });

    return Array.from(map.values());
  }, [offlineGradesData]);

  // Load existing paperLinks from config when it arrives
  useEffect(() => {
    if (config?.paperLinks) {
      const pl = config.paperLinks as any;
      setPaperAssignments({
        exam: pl.exam || [],
        subjectPaper: pl.subjectPaper || [],
        ca: pl.ca || [],
        assignment: pl.assignment || [],
      });
      if (pl.approval?.signature) {
        setAdminSignature(pl.approval.signature);
      }
    }
  }, [config?.id]);

  // Set default admin signature from logged in admin if not already set
  useEffect(() => {
    if (user?.name && !adminSignature) {
      setAdminSignature(`${user.name} (${adminRoleTitle})`);
    }
  }, [user?.name, adminRoleTitle, adminSignature]);

  // Sync loaded data into editable state
  useEffect(() => {
    if (rawStudents.length > 0) {
      let filteredRaw = rawStudents;
      if (config?.departmentId) {
        filteredRaw = rawStudents.filter((s: any) => s.departmentId === config.departmentId || s.department?.id === config.departmentId);
      }

      const merged = filteredRaw.map((student: any) => {
        const mark = Array.isArray(existingMarks) ? existingMarks.find(m => m.studentId === student.id) : undefined;
        const scoreSources = mark?.scoreSources || {};
        
        // Find if student has a TermlyEvaluation record in Prisma
        const evalRec = Array.isArray(classEvaluations) ? classEvaluations.find((e: any) => e.studentId === student.id) : undefined;

        // 10 Affective Traits (default to "5" for excellent/distinction if unset)
        const attentiveness = String(evalRec?.attentiveness ?? scoreSources.behavior?.attentiveness ?? "5");
        const honesty = String(evalRec?.honesty ?? scoreSources.behavior?.honesty ?? "5");
        const neatness = String(evalRec?.neatness ?? scoreSources.behavior?.neatness ?? "5");
        const politeness = String(evalRec?.politeness ?? scoreSources.behavior?.politeness ?? "5");
        const punctuality = String(evalRec?.punctuality ?? scoreSources.behavior?.punctuality ?? "5");
        const selfControl = String(evalRec?.selfControl ?? scoreSources.behavior?.selfControl ?? "5");
        const obedience = String(evalRec?.obedience ?? scoreSources.behavior?.obedience ?? "5");
        const reliability = String(evalRec?.reliability ?? scoreSources.behavior?.reliability ?? "5");
        const responsibility = String(evalRec?.responsibility ?? scoreSources.behavior?.responsibility ?? "5");
        const relationship = String(evalRec?.relationship ?? scoreSources.behavior?.relationship ?? "5");

        // 6 Psychomotor Skills (default to "5" for distinction if unset)
        const handwriting = String(evalRec?.handwriting ?? scoreSources.behavior?.handwriting ?? "5");
        const handlingTools = String(evalRec?.handlingTools ?? scoreSources.behavior?.handlingTools ?? "5");
        const drawingPainting = String(evalRec?.drawingPainting ?? scoreSources.behavior?.drawingPainting ?? "5");
        const publicSpeaking = String(evalRec?.publicSpeaking ?? scoreSources.behavior?.publicSpeaking ?? "5");
        const speechFluency = String(evalRec?.speechFluency ?? scoreSources.behavior?.speechFluency ?? "5");
        const sportsGames = String(evalRec?.sportsGames ?? scoreSources.behavior?.sportsGames ?? "5");

        // Remarks
        const teacherRemark = String(evalRec?.teacherRemark ?? scoreSources.behavior?.teacherRemark ?? "");
        const principalRemark = String(evalRec?.principalRemark ?? scoreSources.behavior?.principalRemark ?? "");

        return {
          id: student.id,
          name: student.name,
          code: student.studentCode || "-",
          profileImage: student.profileImage || null,
          assignment: mark?.assignmentScore ?? "",
          quiz: mark?.quizScore ?? "",
          ca: mark?.caScore ?? "",
          exam: mark?.examScore ?? "",
          scoreSources: mark?.scoreSources || {},
          // Conduct & Behavioral Evaluation
          attentiveness,
          honesty,
          neatness,
          politeness,
          punctuality,
          selfControl,
          obedience,
          reliability,
          responsibility,
          relationship,
          handwriting,
          handlingTools,
          drawingPainting,
          publicSpeaking,
          speechFluency,
          sportsGames,
          teacherRemark,
          principalRemark
        };
      });
      setStudents(merged);
    }
  }, [rawStudents, existingMarks, config, classEvaluations]);

  const handleScoreChange = (id: string, field: string, value: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value, scoreSources: { ...(s.scoreSources || {}), [field]: "MANUAL" } } : s))
    );
  };

  const handleSetAllToDistinction = () => {
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        attentiveness: "5",
        honesty: "5",
        neatness: "5",
        politeness: "5",
        punctuality: "5",
        selfControl: "5",
        obedience: "5",
        reliability: "5",
        responsibility: "5",
        relationship: "5",
        handwriting: "5",
        handlingTools: "5",
        drawingPainting: "5",
        publicSpeaking: "5",
        speechFluency: "5",
        sportsGames: "5",
      }))
    );
    toast.success("Set all students to 5 (Distinction) across all 16 domains");
  };

  const handleAutoFillRemarks = () => {
    setStudents((prev) =>
      prev.map((s, idx) => {
        const defaultTeacher = PRESET_REMARKS[idx % PRESET_REMARKS.length];
        const defaultPrincipal = "A commendable scholar demonstrating exemplary discipline and steady intellectual focus.";
        return {
          ...s,
          teacherRemark: s.teacherRemark?.trim() ? s.teacherRemark : defaultTeacher,
          principalRemark: s.principalRemark?.trim() ? s.principalRemark : defaultPrincipal,
        };
      })
    );
    toast.success("Auto-filled empty remarks with standard commendable comments");
  };

  const handleUploadComplete = (mappedData: any[], category: UploadCategory) => {
    setStudents(prev => {
      let newStudents = [...prev];
      
      mappedData.forEach(row => {
        if (row.matched && row.studentId) {
          // If it's a new student, append it to the table
          if (row.isNew) {
            newStudents.push({
              id: row.studentId,
              name: row.studentName,
              code: "-",
              profileImage: null,
              assignment: category === "all" ? String(row.assignment || "") : category === "assignment" ? String(row.score || "") : "",
              quiz: category === "all" ? String(row.quiz || "") : category === "quiz" ? String(row.score || "") : "",
              ca: category === "all" ? String(row.ca || "") : category === "ca" ? String(row.score || "") : "",
              exam: category === "all" ? String(row.exam || "") : category === "exam" ? String(row.score || "") : "",
              politeness: "0",
              punctuality: "0",
              handwriting: "0",
              teacherRemark: "",
              principalRemark: "",
              scoreSources: {
                ...(category === "all" || category === "assignment" ? { assignment: "CSV/AI" } : {}),
                ...(category === "all" || category === "quiz" ? { quiz: "CSV/AI" } : {}),
                ...(category === "all" || category === "ca" ? { ca: "CSV/AI" } : {}),
                ...(category === "all" || category === "exam" ? { exam: "CSV/AI" } : {})
              }
            });
            return;
          }

          const idx = newStudents.findIndex(s => s.id === row.studentId);
          if (idx !== -1) {
             if (category === "all") {
                const updates: any = {};
                const sources: any = { ...(newStudents[idx].scoreSources || {}) };
                if (row.assignment !== undefined && row.assignment !== "") { updates.assignment = String(row.assignment); sources.assignment = "CSV/AI"; }
                if (row.quiz !== undefined && row.quiz !== "") { updates.quiz = String(row.quiz); sources.quiz = "CSV/AI"; }
                if (row.ca !== undefined && row.ca !== "") { updates.ca = String(row.ca); sources.ca = "CSV/AI"; }
                if (row.exam !== undefined && row.exam !== "") { updates.exam = String(row.exam); sources.exam = "CSV/AI"; }
                newStudents[idx] = { ...newStudents[idx], ...updates, scoreSources: sources };
             } else {
                if (row.score !== undefined && row.score !== "") {
                  newStudents[idx] = { 
                    ...newStudents[idx], 
                    [category]: String(row.score),
                    scoreSources: { ...(newStudents[idx].scoreSources || {}), [category]: "CSV/AI" }
                  };
                }
             }
          }
        }
      });
      return newStudents;
    });
    
    const count = mappedData.filter(d => d.matched).length;
    if (category === "all") {
       toast.success(`Successfully applied ${count} combined records`);
    } else {
       toast.success(`Successfully applied ${count} scores to ${category.toUpperCase()}`);
    }
  };

  const handleSave = () => {
    if (!config) return;

    const parseScore = (val: string | number | undefined) => {
      if (val === "" || val === null || val === undefined) return null;
      const parsed = parseFloat(String(val));
      return isNaN(parsed) ? null : parsed;
    };

    const parseIntRating = (val: string | number | undefined) => {
      if (val === "" || val === null || val === undefined) return 5;
      const parsed = parseInt(String(val), 10);
      return isNaN(parsed) ? 5 : Math.max(1, Math.min(5, parsed));
    };

    const payload = {
      classId: config.classId,
      subjectId: config.subjectId,
      sessionId: config.sessionId,
      term: config.term,
      scores: students.map(s => ({
        studentId: s.id,
        assignmentScore: parseScore(s.assignment),
        quizScore: parseScore(s.quiz),
        caScore: parseScore(s.ca),
        examScore: parseScore(s.exam),
        scoreSources: {
          ...s.scoreSources,
          behavior: {
            attentiveness: s.attentiveness,
            honesty: s.honesty,
            neatness: s.neatness,
            politeness: s.politeness,
            punctuality: s.punctuality,
            selfControl: s.selfControl,
            obedience: s.obedience,
            reliability: s.reliability,
            responsibility: s.responsibility,
            relationship: s.relationship,
            handwriting: s.handwriting,
            handlingTools: s.handlingTools,
            drawingPainting: s.drawingPainting,
            publicSpeaking: s.publicSpeaking,
            speechFluency: s.speechFluency,
            sportsGames: s.sportsGames,
            teacherRemark: s.teacherRemark,
            principalRemark: s.principalRemark
          }
        }
      }))
    };

    saveResults(payload, {
      onSuccess: () => {
        // Also persist directly into TermlyEvaluation table in Prisma
        if (config.classId && config.sessionId && config.term) {
          bulkSaveTermlyEvaluations({
            classId: config.classId,
            sessionId: config.sessionId,
            term: config.term,
            evaluations: students.map(s => ({
              studentId: s.id,
              attentiveness: parseIntRating(s.attentiveness),
              honesty: parseIntRating(s.honesty),
              neatness: parseIntRating(s.neatness),
              politeness: parseIntRating(s.politeness),
              punctuality: parseIntRating(s.punctuality),
              selfControl: parseIntRating(s.selfControl),
              obedience: parseIntRating(s.obedience),
              reliability: parseIntRating(s.reliability),
              responsibility: parseIntRating(s.responsibility),
              relationship: parseIntRating(s.relationship),
              handwriting: parseIntRating(s.handwriting),
              handlingTools: parseIntRating(s.handlingTools),
              drawingPainting: parseIntRating(s.drawingPainting),
              publicSpeaking: parseIntRating(s.publicSpeaking),
              speechFluency: parseIntRating(s.speechFluency),
              sportsGames: parseIntRating(s.sportsGames),
              teacherRemark: s.teacherRemark?.trim() || null,
              principalRemark: s.principalRemark?.trim() || null,
            }))
          }, {
            onSuccess: () => {
              toast.success("Scores and behavioral evaluations saved successfully!");
            },
            onError: () => {
              toast.success("Scores saved successfully!");
            }
          });
        } else {
          toast.success("Scores saved successfully!");
        }
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to save scores");
      }
    });
  };

  const handlePublish = () => {
    if (!config?.id) return;
    publishResult({ 
      id: config.id, 
      signature: adminSignature.trim() || undefined,
      role: adminRoleTitle,
    }, {
      onSuccess: () => {
        toast.success("Result approved and published successfully!");
        setIsPublishModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to approve and publish result");
      }
    });
  };

  const handleUnpublish = () => {
    if (!config?.id) return;
    unpublishResult({ 
      id: config.id, 
      reason: unpublishReason.trim() || undefined 
    }, {
      onSuccess: () => {
        toast.success("Result unpublished and reverted to draft!");
        setIsUnpublishModalOpen(false);
        setUnpublishReason("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to unpublish result");
      }
    });
  };

  const isLoading = isLoadingConfig || isLoadingStudents || isLoadingMarks;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleEdit = (id: string) => {
    if (config?.status === "PUBLISHED") return toast.info("Cannot edit published results");
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Validate total score
        const student = students.find(s => s.id === id);
        if (student) {
          const total = (parseFloat(student.assignment) || 0) + 
                        (parseFloat(student.quiz) || 0) + 
                        (parseFloat(student.ca) || 0) + 
                        (parseFloat(student.exam) || 0);
          if (total > 100) {
            toast.error(`Total score cannot exceed 100 marks! Current total is ${total}.`);
            return prev; // keep editing
          }
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const scoresEntered = students.filter(s => !!s.assignment || !!s.quiz || !!s.ca || !!s.exam).length;
  const pendingEntry = students.length - scoresEntered;
  
  // Calculate class average
  let totalClassScore = 0;
  let studentsWithScores = 0;
  students.forEach(s => {
    const total = (parseFloat(s.assignment) || 0) + (parseFloat(s.quiz) || 0) + (parseFloat(s.ca) || 0) + (parseFloat(s.exam) || 0);
    if (total > 0) {
      totalClassScore += total;
      studentsWithScores++;
    }
  });
  const classAverage = studentsWithScores > 0 ? (totalClassScore / studentsWithScores).toFixed(1) : "0";

  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId || "");

  // Export states
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [exportTargetFormat, setExportTargetFormat] = useState<'excel' | 'pdf'>('excel');
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);

  const calculateGrade = (total: number, gradingSystem?: any) => {
    return getGradeEvaluation(total, gradingSystem || schoolProfile?.gradingSystem).grade;
  };

  const handleExport = async () => {
    setIsExporting(exportTargetFormat);
    try {
      if (filteredStudents.length === 0) {
        toast.info("No records to export.");
        return;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const schoolName = schoolProfile?.name || user?.schools?.[0]?.name || (user as any)?.tenant?.name || "School";
      const sanitizedSchoolName = schoolName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileNameBase = `${sanitizedSchoolName}_result_entry_${config?.subject?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'subject'}_${dateStr}`;

      // Helper to calculate ordinal suffix
      const getOrdinalSuffix = (i: number) => {
        const j = i % 10, k = i % 100;
        if (j === 1 && k !== 11) return i + "st";
        if (j === 2 && k !== 12) return i + "nd";
        if (j === 3 && k !== 13) return i + "rd";
        return i + "th";
      };

      // Calculate positions (Standard Competition Ranking)
      const scoresWithIds = filteredStudents.map(s => {
        const total = (parseFloat(s.assignment) || 0) + (parseFloat(s.quiz) || 0) + (parseFloat(s.ca) || 0) + (parseFloat(s.exam) || 0);
        return { id: s.id, total };
      });
      scoresWithIds.sort((a, b) => b.total - a.total);
      
      const positionMap = new Map<string, string>();
      let currentRank = 1;
      for (let i = 0; i < scoresWithIds.length; i++) {
        if (i > 0 && scoresWithIds[i].total < scoresWithIds[i - 1].total) {
          currentRank = i + 1;
        }
        positionMap.set(scoresWithIds[i].id, getOrdinalSuffix(currentRank));
      }

      // Section 1: Configuration
      const configHeaders = ["Configuration Property", "Value"];
      const configRows = [
        ["Subject", config?.subject?.name || "N/A"],
        ["Class", config?.class?.name || "N/A"],
        ["Session", config?.session?.name || "N/A"],
        ["Term", config?.term || "N/A"],
        ["Max Assignment Score", (config?.assignmentMax ?? "N/A").toString()],
        ["Max Quiz Score", (config?.quizMax ?? "N/A").toString()],
        ["Max CA Score", (config?.caMax ?? "N/A").toString()],
        ["Max Exam Score", (config?.examMax ?? "N/A").toString()],
      ];

      // Section 2: Academic
      const academicHeaders = [
        "#", "Student Name", "Class ID",
        ...(config?.assignmentMax != null ? ["Assignment"] : []),
        ...(config?.quizMax != null ? ["Quiz"] : []),
        ...(config?.caMax != null ? ["CA"] : []),
        ...(config?.examMax != null ? ["Exam"] : []),
        "Total Score", "Grade", "Position"
      ];
      
      const academicRows = filteredStudents.map((s, idx) => {
        const total = (parseFloat(s.assignment) || 0) + (parseFloat(s.quiz) || 0) + (parseFloat(s.ca) || 0) + (parseFloat(s.exam) || 0);
        const grade = calculateGrade(total, schoolProfile?.gradingSystem);
        const position = positionMap.get(s.id) || "N/A";
        const row = [
          (idx + 1).toString(),
          s.name || "N/A",
          s.code || "N/A"
        ];
        if (config?.assignmentMax != null) row.push(s.assignment || "0");
        if (config?.quizMax != null) row.push(s.quiz || "0");
        if (config?.caMax != null) row.push(s.ca || "0");
        if (config?.examMax != null) row.push(s.exam || "0");
        row.push(total.toString());
        row.push(grade);
        row.push(position);
        return row;
      });

      // Section 3: Behavioral & Remarks
      const behaviorHeaders = [
        "#", 
        "Student Name", 
        "Attentiveness",
        "Honesty",
        "Neatness",
        "Politeness", 
        "Punctuality", 
        "Self Control",
        "Obedience",
        "Reliability",
        "Responsibility",
        "Relationship",
        "Handwriting", 
        "Handling Tools",
        "Drawing & Crafts",
        "Public Speaking",
        "Speech Fluency",
        "Sports & Games",
        "Teacher Remark", 
        "Principal Remark"
      ];
      
      const behaviorRows = filteredStudents.map((s, idx) => [
        (idx + 1).toString(),
        s.name || "N/A",
        s.attentiveness || "5",
        s.honesty || "5",
        s.neatness || "5",
        s.politeness || "5",
        s.punctuality || "5",
        s.selfControl || "5",
        s.obedience || "5",
        s.reliability || "5",
        s.responsibility || "5",
        s.relationship || "5",
        s.handwriting || "5",
        s.handlingTools || "5",
        s.drawingPainting || "5",
        s.publicSpeaking || "5",
        s.speechFluency || "5",
        s.sportsGames || "5",
        s.teacherRemark || "N/A",
        s.principalRemark || "N/A"
      ]);

      if (exportTargetFormat === 'excel') {
        const { utils, writeFile } = await import('xlsx');
        
        const wb = utils.book_new();

        // 1. Configuration Sheet
        const wsConfig = utils.aoa_to_sheet([
          [schoolName.toUpperCase()],
          [schoolProfile?.motto || ""],
          [schoolProfile?.address || ""],
          [[schoolProfile?.phone, schoolProfile?.schoolEmail].filter(Boolean).join(' | ')],
          [],
          ["Result Data Entry Report"],
          [`Generated on: ${dateStr}`],
          [],
          configHeaders,
          ...configRows
        ]);
        utils.book_append_sheet(wb, wsConfig, "Configuration");

        // 2. Academic Scores Sheet
        const wsAcademic = utils.aoa_to_sheet([
          [schoolName.toUpperCase()],
          ["Academic Scores"],
          [],
          academicHeaders,
          ...academicRows
        ]);
        utils.book_append_sheet(wb, wsAcademic, "Academic Scores");

        // 3. Behavioral & Remarks Sheet
        const wsBehavior = utils.aoa_to_sheet([
          [schoolName.toUpperCase()],
          ["Behavioral Evaluations & Remarks"],
          [],
          behaviorHeaders,
          ...behaviorRows
        ]);
        utils.book_append_sheet(wb, wsBehavior, "Behavioral & Remarks");

        writeFile(wb, `${fileNameBase}.xlsx`);
      } else {
        const { jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        
        const doc = new jsPDF('landscape');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        let startY = 15;

        // Try adding the logo
        if (schoolProfile?.logo) {
          try {
            // Top left corner logo
            doc.addImage(schoolProfile.logo, 'PNG', 14, 15, 25, 25);
          } catch (error) {
            console.error("Could not load logo for PDF:", error);
          }
        }

        // Proper School Heading
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // text-slate-800
        doc.text(schoolName.toUpperCase(), pageWidth / 2, startY, { align: 'center' });
        startY += 8;

        if (schoolProfile?.motto) {
          doc.setFontSize(12);
          doc.setTextColor(71, 85, 105); // text-slate-600
          doc.text(schoolProfile.motto, pageWidth / 2, startY, { align: 'center', renderingMode: 'fill' });
          startY += 6;
        }

        if (schoolProfile?.address) {
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139); // text-slate-500
          doc.text(schoolProfile.address, pageWidth / 2, startY, { align: 'center' });
          startY += 5;
        }

        if (schoolProfile?.phone || schoolProfile?.schoolEmail) {
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139); // text-slate-500
          const contactStr = [schoolProfile?.phone, schoolProfile?.schoolEmail].filter(Boolean).join(' | ');
          doc.text(contactStr, pageWidth / 2, startY, { align: 'center' });
          startY += 5;
        }
        
        // Ensure startY clears the logo if it's placed on the left
        if (startY < 45 && schoolProfile?.logo) {
          startY = 45;
        } else {
          startY += 6;
        }

        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139); // text-slate-500
        doc.text(`Result Data Entry Report`, pageWidth / 2, startY, { align: 'center' });
        startY += 6;
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${dateStr}`, pageWidth / 2, startY, { align: 'center' });
        startY += 8;

        let finalY = startY;

        // Section 1: Configuration Details
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("1. Configuration Details", 14, finalY);
        autoTable(doc, {
          head: [configHeaders],
          body: configRows,
          startY: finalY + 5,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [91, 92, 230], textColor: [255, 255, 255] },
          columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
        });
        
        finalY = (doc as any).lastAutoTable.finalY + 15;

        // Section 2: Academic Scores
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("2. Academic Scores", 14, finalY);
        autoTable(doc, {
          head: [academicHeaders],
          body: academicRows,
          startY: finalY + 5,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [91, 92, 230], textColor: [255, 255, 255] }
        });
        
        finalY = (doc as any).lastAutoTable.finalY + 15;

        if (finalY > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          finalY = 20;
        }

        // Section 3: Behavioral Evaluations & Remarks
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text("3. Behavioral Evaluations & Remarks", 14, finalY);
        autoTable(doc, {
          head: [behaviorHeaders],
          body: behaviorRows,
          startY: finalY + 5,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [91, 92, 230], textColor: [255, 255, 255] }
        });

        finalY = (doc as any).lastAutoTable.finalY + 12;
        if (finalY > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          finalY = 20;
        }

        // Section 4: Authorized Approval & Verification Signature
        const approval = (config?.paperLinks as any)?.approval;
        const approverName = approval?.approvedByName || "School Administrator";
        const approvalDate = approval?.approvedAt ? new Date(approval.approvedAt).toLocaleDateString() : dateStr;

        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("4. Official Institutional Certification & Signature", 14, finalY);

        doc.setDrawColor(148, 163, 184);
        doc.line(14, finalY + 14, 110, finalY + 14);
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Authorized Administrator: ${approverName}`, 14, finalY + 19);
        doc.text(`Electronic Signature: Digitally Verified & Certified`, 14, finalY + 23);
        doc.text(`Verification Date: ${approvalDate}`, 14, finalY + 27);

        doc.save(`${fileNameBase}.pdf`);
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to export data as ${exportTargetFormat.toUpperCase()}.`);
    } finally {
      setIsExporting(null);
      setIsExportPopupOpen(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[95%] mx-auto font-sans bg-[#f8f9fa] dark:bg-[#0f1015] min-h-screen">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin/records" 
            className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1b2e] dark:text-white tracking-tight">
              {config ? config.name : "Loading..."}
            </h1>
            <div className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
              {config ? (
                <>
                  <span>{config.class?.name || "Class"}</span>
                  <span>•</span>
                  <span>{config.session?.name || "Session"}</span>
                </>
              ) : (
                <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditConfigOpen(true)}
            className="flex items-center justify-center p-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            title="Configuration Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <Dialog open={isExportPopupOpen} onOpenChange={setIsExportPopupOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
                <Download className="w-4 h-4" />
                Export data
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Export Data</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Choose the format you want to export the results in.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-4">
                <button
                  onClick={() => { setExportTargetFormat('excel'); handleExport(); }}
                  disabled={isExporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isExporting === 'excel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Excel
                </button>
                <button
                  onClick={() => { setExportTargetFormat('pdf'); handleExport(); }}
                  disabled={isExporting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <button 
            onClick={handleSave}
            disabled={isSaving || isLoading || config?.status === "PUBLISHED"}
            className="flex items-center gap-2 px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4be5] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Results"}
          </button>
          {config?.status !== "PUBLISHED" ? (
            <button 
              onClick={() => setIsPublishModalOpen(true)}
              disabled={isPublishing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Approve & Publish
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Approved & Published
              </span>
              <button 
                onClick={() => setIsUnpublishModalOpen(true)}
                disabled={isUnpublishing || isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
                {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Unpublish
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="w-full space-y-6 mt-6 animate-pulse">
          {/* Skeleton for Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-28"></div>
            ))}
          </div>
          {/* Skeleton for Tabs */}
          <div className="flex gap-6 mt-8 mb-4 border-b border-slate-200 dark:border-slate-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
            ))}
          </div>
          {/* Skeleton for Table */}
          <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden h-96 flex flex-col">
            <div className="h-16 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20"></div>
            <div className="flex-1 p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Teacher Submission Pending Approval Banner */}
          {config?.status !== "PUBLISHED" && config?.paperLinks?.approval?.status === "PENDING_APPROVAL" && (
            <div className="mt-4 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Action Required: Teacher Submission Pending Administrative Approval</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Teacher <span className="font-bold">{config.paperLinks.approval.requestedByName || "Assigned Teacher"}</span> has completed scores and requested publication. Verify marks and approve to certify with your signature.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shrink-0 shadow-sm transition-all"
              >
                Review & Approve
              </button>
            </div>
          )}

          {/* Approved & Certified Banner */}
          {config?.status === "PUBLISHED" && config?.paperLinks?.approval?.status === "APPROVED" && (
            <div className="mt-4 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm">Administrative Approval Certified & Digitally Signed</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Approved by <span className="font-bold">{config.paperLinks.approval.approvedByName}</span> on {new Date(config.paperLinks.approval.approvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}.
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Official Electronic Stamp</span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{config.paperLinks.approval.signature}</span>
              </div>
            </div>
          )}

          {/* Summary Cards Overview */}
          <div className="mt-6 mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#4a8df5]/10 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4 text-[#4a8df5]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Students</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{students.length}</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#7854f5]/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#7854f5]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Scores Entered</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{scoresEntered}</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#f06148]/10 flex items-center justify-center mb-3">
                  <Clock className="w-4 h-4 text-[#f06148]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Pending Entry</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{pendingEntry}</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white dark:bg-[#1a1b2e] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-[#38b75e]/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-4 h-4 text-[#38b75e]" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Class Average</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{classAverage}%</div>
                </div>
              </div>

            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 mb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("academic")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "academic"
                  ? "text-[#5B5CE6]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Academic Scores
              {activeTab === "academic" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5CE6] rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("evaluation")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "evaluation"
                  ? "text-[#5B5CE6]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Behavioral Evaluations & Remarks
              {activeTab === "evaluation" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5CE6] rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 text-sm font-semibold transition-colors relative ${
                activeTab === "details"
                  ? "text-[#5B5CE6]"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Configuration Details
              {activeTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5CE6] rounded-t-full" />}
            </button>
          </div>

          {/* Data Entry Grid - Academic */}
          {activeTab === "academic" && (
          <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden mt-4">
            
            {/* Search Bar & Actions */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-4 bg-white dark:bg-[#1a1b2e]">
              <div className="relative w-full max-w-sm flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-[#f8f9fa] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#5B5CE6] transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={config?.status === "PUBLISHED"}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Grades
                </button>
                <button 
                  onClick={() => {
                    if (!config?.id) return;
                    const studentIds = paginatedStudents.map(s => s.id);
                    if (studentIds.length === 0) return;
                    setIsSyncModalOpen(true);
                  }}
                  disabled={config?.status === "PUBLISHED"}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Papers
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/50">
                    <th className="px-6 py-4 w-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">#</th>
                    <th className="px-4 py-4 min-w-[200px] text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Student</th>
                    <th className="px-4 py-4 w-24 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Class ID</th>
                    {config?.assignmentMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment<br/><span className="text-[9px] font-medium opacity-70">(Max {config.assignmentMax})</span></th>}
                    {config?.quizMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Quiz/Test<br/><span className="text-[9px] font-medium opacity-70">(Max {config.quizMax})</span></th>}
                    {config?.caMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">CA<br/><span className="text-[9px] font-medium opacity-70">(Max {config.caMax})</span></th>}
                    {config?.examMax != null && <th className="px-4 py-4 w-28 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Exam<br/><span className="text-[9px] font-medium opacity-70">(Max {config.examMax})</span></th>}
                    <th className="px-6 py-4 w-24 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                    <th className="px-4 py-4 w-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-slate-500">No students found.</td>
                    </tr>
                  ) : paginatedStudents.map((student, idx) => {
                    const isEditing = editingIds.has(student.id);
                    const assignNum = parseFloat(student.assignment) || 0;
                    const quizNum = parseFloat(student.quiz) || 0;
                    const caNum = parseFloat(student.ca) || 0;
                    const examNum = parseFloat(student.exam) || 0;
                    const total = assignNum + quizNum + caNum + examNum;
                    const globalIdx = (currentPage - 1) * PAGE_SIZE + idx;
                    
                    return (
                      <tr key={student.id} className={`group transition-colors border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isEditing ? "bg-slate-50 dark:bg-slate-800/30" : ""}`}>
                        <td className="px-6 py-4 text-center text-slate-400 font-normal text-sm">{String(globalIdx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-4 flex items-center gap-3">
                          <StudentAvatar name={student.name} profileImage={student.profileImage} />
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{student.name}</span>
                        </td>
                        <td className="px-4 py-4 text-slate-400 font-normal text-sm">{student.code}</td>
                        {config?.assignmentMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.assignment}
                              onChange={(e) => handleScoreChange(student.id, "assignment", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "assignment", categoryMax: config?.assignmentMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.assignment !== "" && student.assignment != null ? student.assignment : <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        {config?.quizMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.quiz}
                              onChange={(e) => handleScoreChange(student.id, "quiz", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "quiz", categoryMax: config?.quizMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.quiz !== "" && student.quiz != null ? student.quiz : <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        {config?.caMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.ca}
                              onChange={(e) => handleScoreChange(student.id, "ca", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "ca", categoryMax: config?.caMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.ca !== "" && student.ca != null ? student.ca : <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        {config?.examMax != null && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input 
                              type="number" 
                              value={student.exam}
                              onChange={(e) => handleScoreChange(student.id, "exam", e.target.value)}
                              placeholder="-"
                              className="w-16 mx-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#5B5CE6] focus:border-[#5B5CE6] text-center font-medium text-slate-800 dark:text-slate-200 text-sm transition-all shadow-sm"
                            />
                          ) : (
                            <button onClick={() => setBreakdownModal({ isOpen: true, studentId: student.id, studentName: student.name, category: "exam", categoryMax: config?.examMax || null })} className="text-slate-500 font-medium hover:text-[#5B5CE6] transition-colors px-2 py-1 rounded text-sm">
                              {student.exam !== "" && student.exam != null ? student.exam : <span className="text-slate-300">-</span>}
                            </button>
                          )}
                        </td>
                        )}
                        <td className="px-6 py-4 text-center">
                          {student.assignment || student.quiz || student.ca || student.exam ? (
                            <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold ${total < 40 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>{total}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleEdit(student.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          >
                            {isEditing ? <Check className="w-4 h-4 text-emerald-500" /> : <Pencil className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <span className="text-xs text-slate-400 font-medium">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length} students
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                        page === currentPage 
                          ? "bg-[#5B5CE6] text-white" 
                          : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          )}


          {/* Data Entry Grid - Behavioral Evaluations & Remarks */}
          {activeTab === "evaluation" && (
          <div className="space-y-4 mt-4">
            {/* Context & Rubric Banner */}
            <div className="p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-[#1a1b2e] dark:to-purple-950/10 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#5B5CE6]/10 text-[#5B5CE6] shrink-0 mt-0.5">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      Student Conduct Appraisal & Behavioral Domain Evaluation
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#5B5CE6]/10 text-[#5B5CE6] border border-[#5B5CE6]/20">
                        16 Domains + 2 Remarks
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      All 10 Affective traits, 6 Psychomotor skills, and terminal remarks configured here automatically sync directly with <strong className="text-slate-700 dark:text-slate-200">Page 2 of the Certified Academic Transcript</strong>, terminal broadsheets, and parent portal cards.
                    </p>
                  </div>
                </div>

                {/* Class-wide Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSetAllToDistinction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Set All to 5 (Distinction)
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFillRemarks}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-fill Empty Remarks
                  </button>
                </div>
              </div>

              {/* Standard 5-Point Institutional Rubric Key */}
              <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                <span className="font-bold text-slate-600 dark:text-slate-400">Standard 5-Point Rating Rubric:</span>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    5 = Distinction / Excellent
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    4 = Commendable / Good
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    3 = Acceptable / Moderate
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    2 = Minimal / Needs Work
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    1 = Needs Attention
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Switcher & Search Bar */}
            <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-xs overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/50 gap-4 bg-slate-50/50 dark:bg-slate-900/20">
                {/* Sub-tab pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setEvalSubTab("key")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      evalSubTab === "key"
                        ? "bg-white dark:bg-slate-900 text-[#5B5CE6] shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#5B5CE6]" />
                    Key Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalSubTab("affective")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      evalSubTab === "affective"
                        ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Affective Domain (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalSubTab("psychomotor")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      evalSubTab === "psychomotor"
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                    Psychomotor Domain (6)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalSubTab("remarks")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      evalSubTab === "remarks"
                        ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                    Remarks Focus
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search student or code..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#5B5CE6]/40 transition-all"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/10">
                      <th className="px-4 py-3.5 w-12 text-center">#</th>
                      <th className="px-4 py-3.5 min-w-[200px]">Scholar Name</th>

                      {/* Columns when Key Overview is active */}
                      {evalSubTab === "key" && (
                        <>
                          <th className="px-3 py-3.5 w-24 text-center">Attentiveness<br/><span className="text-[9px] font-normal text-slate-400">(1–5)</span></th>
                          <th className="px-3 py-3.5 w-24 text-center">Politeness<br/><span className="text-[9px] font-normal text-slate-400">(1–5)</span></th>
                          <th className="px-3 py-3.5 w-24 text-center">Punctuality<br/><span className="text-[9px] font-normal text-slate-400">(1–5)</span></th>
                          <th className="px-3 py-3.5 w-24 text-center">Handwriting<br/><span className="text-[9px] font-normal text-slate-400">(1–5)</span></th>
                          <th className="px-4 py-3.5 min-w-[220px] text-left">Teacher Remark</th>
                          <th className="px-4 py-3.5 min-w-[220px] text-left">Principal Remark</th>
                        </>
                      )}

                      {/* Columns when Affective Domain (10) is active */}
                      {evalSubTab === "affective" && (
                        <>
                          {AFFECTIVE_TRAITS.map(trait => (
                            <th key={trait.key} className="px-2.5 py-3.5 w-24 text-center" title={trait.desc}>
                              {trait.label}
                              <br/><span className="text-[9px] font-normal text-slate-400">(1–5)</span>
                            </th>
                          ))}
                        </>
                      )}

                      {/* Columns when Psychomotor Domain (6) is active */}
                      {evalSubTab === "psychomotor" && (
                        <>
                          {PSYCHOMOTOR_SKILLS.map(skill => (
                            <th key={skill.key} className="px-2.5 py-3.5 w-28 text-center" title={skill.desc}>
                              {skill.label}
                              <br/><span className="text-[9px] font-normal text-slate-400">(1–5)</span>
                            </th>
                          ))}
                        </>
                      )}

                      {/* Columns when Remarks Focus is active */}
                      {evalSubTab === "remarks" && (
                        <>
                          <th className="px-4 py-3.5 min-w-[320px] text-left">Class Teacher's Terminal Remark</th>
                          <th className="px-4 py-3.5 min-w-[320px] text-left">Principal's Executive Conduct Remark</th>
                        </>
                      )}

                      <th className="px-4 py-3.5 w-24 text-center">Appraisal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300 font-medium">
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="px-6 py-12 text-center text-slate-500">
                          No students matched your search criteria.
                        </td>
                      </tr>
                    ) : paginatedStudents.map((student, idx) => {
                      const absoluteIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                          <td className="px-4 py-3 text-center text-slate-400 font-normal">
                            {String(absoluteIdx).padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3 flex items-center gap-2.5">
                            <StudentAvatar name={student.name} profileImage={student.profileImage} />
                            <div className="min-w-0">
                              <span className="text-slate-800 dark:text-slate-100 font-bold block truncate">{student.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">{student.code}</span>
                            </div>
                          </td>

                          {/* Key Overview Cells */}
                          {evalSubTab === "key" && (
                            <>
                              <td className="px-3 py-2 text-center">
                                <RatingSelect 
                                  value={student.attentiveness}
                                  onChange={(val) => handleScoreChange(student.id, "attentiveness", val)}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <RatingSelect 
                                  value={student.politeness}
                                  onChange={(val) => handleScoreChange(student.id, "politeness", val)}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <RatingSelect 
                                  value={student.punctuality}
                                  onChange={(val) => handleScoreChange(student.id, "punctuality", val)}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <RatingSelect 
                                  value={student.handwriting}
                                  onChange={(val) => handleScoreChange(student.id, "handwriting", val)}
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  value={student.teacherRemark || ""}
                                  onChange={(e) => handleScoreChange(student.id, "teacherRemark", e.target.value)}
                                  placeholder="Add teacher remark..."
                                  className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded-lg px-2.5 py-1.5 outline-none transition-all placeholder:text-slate-300 text-xs text-slate-800 dark:text-slate-200"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input 
                                  type="text" 
                                  value={student.principalRemark || ""}
                                  onChange={(e) => handleScoreChange(student.id, "principalRemark", e.target.value)}
                                  placeholder="Add principal remark..."
                                  className="w-full bg-transparent border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded-lg px-2.5 py-1.5 outline-none transition-all placeholder:text-slate-300 text-xs text-slate-800 dark:text-slate-200"
                                />
                              </td>
                            </>
                          )}

                          {/* Affective Domain (10) Cells */}
                          {evalSubTab === "affective" && (
                            <>
                              {AFFECTIVE_TRAITS.map(trait => (
                                <td key={trait.key} className="px-2 py-2 text-center">
                                  <RatingSelect 
                                    value={student[trait.key]}
                                    onChange={(val) => handleScoreChange(student.id, trait.key, val)}
                                  />
                                </td>
                              ))}
                            </>
                          )}

                          {/* Psychomotor Domain (6) Cells */}
                          {evalSubTab === "psychomotor" && (
                            <>
                              {PSYCHOMOTOR_SKILLS.map(skill => (
                                <td key={skill.key} className="px-2 py-2 text-center">
                                  <RatingSelect 
                                    value={student[skill.key]}
                                    onChange={(val) => handleScoreChange(student.id, skill.key, val)}
                                  />
                                </td>
                              ))}
                            </>
                          )}

                          {/* Remarks Focus Cells */}
                          {evalSubTab === "remarks" && (
                            <>
                              <td className="px-4 py-2">
                                <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={student.teacherRemark || ""}
                                    onChange={(e) => handleScoreChange(student.id, "teacherRemark", e.target.value)}
                                    placeholder="Enter teacher's terminal evaluation remark..."
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 hover:border-[#5B5CE6] focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded-lg px-3 py-1.5 outline-none transition-all placeholder:text-slate-400 text-xs text-slate-800 dark:text-slate-200"
                                  />
                                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                                    <span className="text-[10px] text-slate-400 shrink-0">Presets:</span>
                                    {PRESET_REMARKS.slice(0, 3).map((pr, pIdx) => (
                                      <button
                                        key={pIdx}
                                        type="button"
                                        onClick={() => handleScoreChange(student.id, "teacherRemark", pr)}
                                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#5B5CE6]/10 hover:text-[#5B5CE6] text-slate-500 dark:text-slate-400 transition-colors shrink-0 max-w-[200px] truncate"
                                        title={pr}
                                      >
                                        "{pr.slice(0, 24)}..."
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="space-y-1">
                                  <input 
                                    type="text" 
                                    value={student.principalRemark || ""}
                                    onChange={(e) => handleScoreChange(student.id, "principalRemark", e.target.value)}
                                    placeholder="Enter principal's certified conduct remark..."
                                    className="w-full bg-transparent border border-slate-200 dark:border-slate-700 hover:border-[#5B5CE6] focus:border-[#5B5CE6] focus:ring-1 focus:ring-[#5B5CE6] rounded-lg px-3 py-1.5 outline-none transition-all placeholder:text-slate-400 text-xs text-slate-800 dark:text-slate-200"
                                  />
                                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                                    <span className="text-[10px] text-slate-400 shrink-0">Presets:</span>
                                    {PRESET_REMARKS.slice(3, 6).map((pr, pIdx) => (
                                      <button
                                        key={pIdx}
                                        type="button"
                                        onClick={() => handleScoreChange(student.id, "principalRemark", pr)}
                                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#5B5CE6]/10 hover:text-[#5B5CE6] text-slate-500 dark:text-slate-400 transition-colors shrink-0 max-w-[200px] truncate"
                                        title={pr}
                                      >
                                        "{pr.slice(0, 24)}..."
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Full Appraisal Button */}
                          <td className="px-4 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => setEvalModalStudentId(student.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#5B5CE6] hover:bg-[#5B5CE6]/10 transition-colors cursor-pointer"
                              title="Open Full 16-Domain Appraisal Modal"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              Appraisal
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 text-xs text-slate-500">
                  <div>
                    Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} of{" "}
                    {filteredStudents.length} students
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-500 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Configuration Details Tab */}
          {activeTab === "details" && config && (
            <div className="bg-white dark:bg-[#1a1b2e] rounded-xl border border-slate-100 dark:border-slate-800/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 md:p-8 mt-4">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Configuration Details
                </h2>
                <button
                  onClick={() => setIsEditConfigOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  Edit Configuration
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">General Information</h3>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Result Name</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.name}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Subject</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.subject?.name || "N/A"}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Class</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.class?.name || "N/A"}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Department</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.department?.name || "All Departments"}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Term</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{config.term?.toLowerCase()} Term</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Session</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{config.session?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Score Configuration & Dates */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Assessment Limits & Dates</h3>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Assignment Max</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{config.assignmentMax || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Quiz Max</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{config.quizMax || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                      <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">CA Max</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{config.caMax || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-[#5B5CE6]/10 rounded shadow-sm border border-[#5B5CE6]/20">
                      <span className="text-[10px] uppercase text-[#5B5CE6] font-bold mb-1">Exam Max</span>
                      <span className="text-lg font-black text-[#5B5CE6]">{config.examMax || "-"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Reveal Date</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {config.revealDate ? new Date(config.revealDate).toLocaleDateString() : "Not Set"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400">Release Date</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {config.releaseDate ? new Date(config.releaseDate).toLocaleDateString() : "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Official Administrative Approval & Digital Certification Details */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Administrative Approval & Digital Signature
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Certification record required for student and parent visibility on report cards and dashboards.
                    </p>
                  </div>
                </div>

                {config?.paperLinks?.approval?.status === "APPROVED" ? (
                  <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-200/60 dark:border-emerald-800/40">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-xs">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                              Officially Certified & Published
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              Live for Students & Parents
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                            This result sheet has been verified and released by authorized school administration.
                          </p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
                          Approval Timestamp
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {new Date(config.paperLinks.approval.approvedAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{" "}
                          at{" "}
                          {new Date(config.paperLinks.approval.approvedAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-800 shadow-2xs">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                          Approving Official
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {config.paperLinks.approval.approvedByName || "School Administrator"}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {formatAdminRole(config.paperLinks.approval.role)}
                        </span>
                      </div>

                      <div className="md:col-span-2 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                              Official Digital Signature & Stamp
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                              AUTH-STAMP-VERIFIED
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-dashed border-emerald-300 dark:border-emerald-700/60 font-serif italic text-base text-slate-800 dark:text-slate-100 select-all">
                            "{config.paperLinks.approval.signature || `${config.paperLinks.approval.approvedByName} (${formatAdminRole(config.paperLinks.approval.role)})`}"
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Digital signature cryptographic record permanently stamped on this class result.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-700/60">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-amber-950 dark:text-amber-100">
                            Pending Administrative Approval
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                            Hidden from Students & Parents
                          </span>
                        </div>
                        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 max-w-xl">
                          This final result sheet is unapproved. Use the <strong className="font-semibold text-amber-950 dark:text-amber-100">"Approve & Publish"</strong> button in the top action bar to review, digitally sign, and officially certify these results.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approval & Publishing History Audit Ledger */}
                {approvalHistory.length > 0 && (
                  <div className="mt-5 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Approval & Publishing History ({approvalHistory.length})
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Complete chronological record of all administrative approvals and certifications.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {approvalHistory.map((item: any, idx: number) => {
                        const isUnpublish = item.action === "UNPUBLISHED" || item.status === "UNAPPROVED" || item.status === "UNPUBLISHED";
                        const actorName = isUnpublish ? (item.unapprovedByName || item.approvedByName || "School Administrator") : (item.approvedByName || "School Administrator");
                        const actorRole = item.role;
                        const eventDate = isUnpublish ? (item.unapprovedAt || item.approvedAt) : item.approvedAt;

                        return (
                          <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3">
                              {isUnpublish ? (
                                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800/80">
                                  <RotateCcw className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/80">
                                  {(actorName || "A").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                    {actorName}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isUnpublish 
                                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  }`}>
                                    {formatAdminRole(actorRole)}
                                  </span>
                                  {isUnpublish ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                      Unpublished / Reverted to Draft
                                    </span>
                                  ) : (
                                    <>
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        Approved & Published
                                      </span>
                                      {idx === 0 && config?.status === "PUBLISHED" && config?.paperLinks?.approval?.status === "APPROVED" && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                          Active Seal
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                                {isUnpublish ? (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">Action:</span> {item.reason || "Unpublished and reverted to draft by administrator"}
                                  </p>
                                ) : (
                                  <p className="text-[11px] font-serif italic text-slate-500 dark:text-slate-400 mt-1 select-all">
                                    "{item.signature || `${actorName} (${formatAdminRole(actorRole)})`}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right pl-12 sm:pl-0 shrink-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                                {isUnpublish ? "Unpublished On" : "Certified & Published On"}
                              </span>
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {eventDate
                                  ? `${new Date(eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date(eventDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Paper Assignments */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Assessment Linkage & Marksheet Sources</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Link online CBT papers, assignments, and physical offline grade marksheets to each category.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!id) return;
                      savePaperLinks(
                        { id, paperLinks: paperAssignments },
                        {
                          onSuccess: () => toast.success("Assessment linkage saved successfully!"),
                          onError: () => toast.error("Failed to save assessment linkage"),
                        }
                      );
                    }}
                    disabled={isSavingLinks || !id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B5CE6] hover:bg-[#4a4bd4] text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  >
                    {isSavingLinks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Links
                  </button>
                </div>

                {/* Session & Term Filter Controls */}
                <div className="bg-slate-50/70 dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#5B5CE6]/10 text-[#5B5CE6] flex items-center justify-center shrink-0">
                      <Filter className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                        Assessment Filters
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {resolvedSessionFilter || resolvedTermFilter
                          ? `Showing assessments filtered by ${resolvedSessionFilter ? 'Selected Session' : 'All Sessions'} & ${resolvedTermFilter ? `${resolvedTermFilter} Term` : 'All Terms'}`
                          : "Showing all assessments across all terms and sessions"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Session Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">Session:</span>
                      <select
                        value={activeFilterSession}
                        onChange={(e) => setActiveFilterSession(e.target.value)}
                        className="h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#5B5CE6] cursor-pointer"
                      >
                        <option value="default">Default ({config?.session?.name || "Result Session"})</option>
                        <option value="all">All Sessions</option>
                        {sessions.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Term Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">Term:</span>
                      <select
                        value={activeFilterTerm}
                        onChange={(e) => setActiveFilterTerm(e.target.value)}
                        className="h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#5B5CE6] cursor-pointer"
                      >
                        <option value="default">Default ({config?.term || "Result Term"})</option>
                        <option value="all">All Terms</option>
                        <option value="FIRST">First Term</option>
                        <option value="SECOND">Second Term</option>
                        <option value="THIRD">Third Term</option>
                      </select>
                    </div>

                    {(activeFilterSession !== "default" || activeFilterTerm !== "default") && (
                      <button
                        onClick={() => {
                          setActiveFilterSession("default");
                          setActiveFilterTerm("default");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {(isLoadingPapers || isLoadingAssignments || isLoadingOfflineGrades) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {([
                      { key: "exam" as const,         label: "Exam Assessments",           category: "EXAM",       borderColor: "border-[#5B5CE6]/40",    headerBg: "bg-[#5B5CE6]/10",  dotColor: "bg-[#5B5CE6]",  textColor: "text-[#5B5CE6]",  checkColor: "accent-[#5B5CE6]" },
                      { key: "subjectPaper" as const, label: "Quiz / Test Assessments",   category: "QUIZ",       borderColor: "border-amber-300/60",    headerBg: "bg-amber-50 dark:bg-amber-500/10",  dotColor: "bg-amber-500",  textColor: "text-amber-600 dark:text-amber-400",  checkColor: "accent-amber-500" },
                      { key: "ca" as const,           label: "Continuous Assessment (CA)", category: "CA",         borderColor: "border-emerald-300/60",  headerBg: "bg-emerald-50 dark:bg-emerald-500/10",  dotColor: "bg-emerald-500",  textColor: "text-emerald-600 dark:text-emerald-400",  checkColor: "accent-emerald-500" },
                      { key: "assignment" as const,   label: "Assignment Assessments",     category: "ASSIGNMENT", borderColor: "border-rose-300/60",     headerBg: "bg-rose-50 dark:bg-rose-500/10",  dotColor: "bg-rose-500",  textColor: "text-rose-600 dark:text-rose-400",  checkColor: "accent-rose-500" },
                    ]).map(({ key, label, category, borderColor, headerBg, dotColor, textColor, checkColor }) => {
                      const selected = paperAssignments[key];
                      const searchKey = paperSearch[key];
                      
                      // Filter online papers
                      const onlineItems = key === "assignment"
                        ? assignments.filter((p: any) => {
                            const matchesClass = !config?.classId || p.classId === config.classId;
                            const matchesSubject = !config?.subjectId || p.subjectId === config.subjectId;
                            const matchesTerm = !resolvedTermFilter || p.term === resolvedTermFilter;
                            const matchesSession = !resolvedSessionFilter || p.sessionId === resolvedSessionFilter;
                            return matchesClass && matchesSubject && matchesTerm && matchesSession;
                          })
                        : subjectPapers.filter((p: any) => {
                            const hasExamConnections = p.exams && p.exams.length > 0;
                            if (hasExamConnections) {
                              return p.exams.some((e: any) => e.exam?.category === category);
                            }
                            return p.category === category;
                          });

                      // Filter offline marksheets
                      const matchingOffline = offlineBatches.filter((b) => b.category === category);

                      // Merge items and apply search query
                      const allAssessments = [
                        ...onlineItems.map((item: any) => ({
                          id: item.id,
                          title: item.title || (key === "assignment" ? "Assignment Task" : "CBT Paper"),
                          totalMarks: item.totalMarks,
                          status: item.status || "PUBLISHED",
                          isOffline: false,
                        })),
                        ...matchingOffline.map((b) => ({
                          id: b.id,
                          title: b.title,
                          totalMarks: b.totalMarks,
                          status: b.status,
                          isOffline: true,
                          gradedCount: b.gradedCount,
                          totalStudents: b.totalStudents,
                        }))
                      ].filter((item) => !searchKey || item.title.toLowerCase().includes(searchKey.toLowerCase()));

                      const togglePaper = (paperId: string) => {
                        setPaperAssignments(prev => {
                          const cur = prev[key];
                          return {
                            ...prev,
                            [key]: cur.includes(paperId) ? cur.filter(x => x !== paperId) : [...cur, paperId],
                          };
                        });
                      };

                      return (
                        <div key={key} className={`rounded-xl border ${borderColor} overflow-hidden flex flex-col h-72 shadow-xs`}>
                          <div className={`${headerBg} px-4 py-2.5 flex items-center justify-between flex-shrink-0`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                              <span className={`text-xs font-bold uppercase tracking-wide ${textColor}`}>{label}</span>
                            </div>
                            <span className={`text-[10px] font-semibold ${textColor}`}>
                              {selected.length} selected
                            </span>
                          </div>
                          
                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 flex-shrink-0">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder={`Search ${label}...`}
                                value={searchKey}
                                onChange={(e) => setPaperSearch(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-[#5B5CE6]/50 transition-all"
                              />
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-transparent">
                            {allAssessments.length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-6">No assessments found for this category.</p>
                            ) : allAssessments.map((p: any) => {
                              const isChecked = selected.includes(p.id);
                              return (
                                <label
                                  key={p.id}
                                  className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isChecked ? "bg-slate-50 dark:bg-slate-900/50" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/20"}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePaper(p.id)}
                                    className={`mt-1 w-4 h-4 rounded ${checkColor} flex-shrink-0 cursor-pointer`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                        {p.title}
                                      </span>
                                      {p.isOffline ? (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 shrink-0">
                                          Offline Marksheet
                                        </span>
                                      ) : key === "assignment" ? (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shrink-0">
                                          Online Task
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shrink-0">
                                          CBT Paper
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {p.totalMarks ? `${p.totalMarks} marks` : "—"} ·{" "}
                                      {p.isOffline ? (
                                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                                          {p.gradedCount}/{p.totalStudents} graded
                                        </span>
                                      ) : (
                                        <span className={p.status === "PUBLISHED" ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
                                          {p.status || "Active"}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-1" />}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <SummaryPanel 
        students={students}
        config={config}
        subjectPapers={subjectPapers}
        assignments={assignments}
      />

      <ResultRecordUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        students={students}
        schoolId={effectiveSchoolId}
        classId={config?.classId || ""}
        onUploadComplete={handleUploadComplete}
      />

      <EditConfigModal
        isOpen={isEditConfigOpen}
        onClose={() => setIsEditConfigOpen(false)}
        config={config}
      />

      <ScoreBreakdownModal
        isOpen={breakdownModal.isOpen}
        onClose={() => setBreakdownModal(prev => ({ ...prev, isOpen: false }))}
        resultId={config?.id || ""}
        studentId={breakdownModal.studentId}
        studentName={breakdownModal.studentName}
        category={breakdownModal.category}
        categoryMax={breakdownModal.categoryMax}
      />

      <SyncProgressModal 
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        resultId={config?.id || ""}
        studentIds={paginatedStudents.map(s => s.id)}
        onComplete={(results) => {
          toast.success("Sync complete! Please remember to click 'Save Results' to persist your changes.", {
            autoClose: 6000
          });
          setStudents(prev => prev.map(student => {
            const syncedData = results.find((r: any) => r.studentId === student.id);
            if (syncedData) {
              const updates: any = {};
              const sources = { ...(student.scoreSources || {}) };
              if (syncedData.assignment !== undefined) { updates.assignment = syncedData.assignment?.toString() || "0"; sources.assignment = "SYNC"; }
              if (syncedData.quiz !== undefined) { updates.quiz = syncedData.quiz?.toString() || "0"; sources.quiz = "SYNC"; }
              if (syncedData.ca !== undefined) { updates.ca = syncedData.ca?.toString() || "0"; sources.ca = "SYNC"; }
              if (syncedData.exam !== undefined) { updates.exam = syncedData.exam?.toString() || "0"; sources.exam = "SYNC"; }
              
              return {
                ...student,
                ...updates,
                scoreSources: sources
              };
            }
            return student;
          }));
        }}
      />

      <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
        <DialogContent className="sm:max-w-[480px] dark:bg-[#1a1b2e] dark:border-slate-800">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-slate-900 dark:text-white text-lg">
              Approve & Publish Final Results
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-slate-500 text-xs leading-relaxed space-y-2 pt-1">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-medium">
                  <strong>Access Rule:</strong> For students and parents to see this final result, it needs to be approved and digitally signed by a school administrator.
                </div>
                <p>
                  By approving and publishing, you officially certify these final scores for <strong className="text-slate-700 dark:text-slate-300">{config?.subject?.name || config?.name || "this class"}</strong>. Your administrative digital signature will be permanently attached to this result sheet.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Approving Official:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name || "School Administrator"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Administrative Role / Title:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {adminRoleTitle}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Digital Signature & Seal
                </label>
                <span className="text-[10px] text-slate-400">Assigned role included</span>
              </div>
              <input
                type="text"
                value={adminSignature}
                onChange={(e) => setAdminSignature(e.target.value)}
                placeholder={`e.g. ${user?.name || "Administrator"} (${adminRoleTitle})`}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Your signature and assigned role will be permanently recorded in the official approval audit trail and on exported transcripts.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-70 shadow-sm cursor-pointer"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Approve & Publish Now
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnpublishModalOpen} onOpenChange={setIsUnpublishModalOpen}>
        <DialogContent className="sm:max-w-[460px] dark:bg-[#1a1b2e] dark:border-slate-800">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <DialogTitle className="text-slate-900 dark:text-white">Unpublish & Revoke Approval</DialogTitle>
            <DialogDescription asChild>
              <div className="text-slate-500 text-xs leading-relaxed space-y-2 pt-1">
                <p>
                  Unpublishing immediately reverts this final result sheet to <strong className="text-slate-700 dark:text-slate-300">Draft</strong> status and hides all scores from student and parent portals.
                </p>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-medium">
                  Your identity ({user?.name || "Administrator"}), role ({adminRoleTitle}), and this timestamp will be permanently tracked in the official audit history.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="my-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Unpublishing (Optional)
            </label>
            <input
              type="text"
              value={unpublishReason}
              onChange={(e) => setUnpublishReason(e.target.value)}
              placeholder="e.g. Correcting test scores for class cohort"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button 
              onClick={handleUnpublish}
              disabled={isUnpublishing}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-70 shadow-sm cursor-pointer"
            >
              {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Unpublish Result
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Student Behavioral Appraisal Modal */}
      <Dialog open={!!evalModalStudentId && !!evalModalStudent} onOpenChange={(open) => { if (!open) setEvalModalStudentId(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-[#1a1b2e] dark:border-slate-800 p-6">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <StudentAvatar name={evalModalStudent?.name || ""} profileImage={evalModalStudent?.profileImage} />
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {evalModalStudent?.name}
                  <span className="font-mono text-xs font-normal px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {evalModalStudent?.code}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete 16-Domain Behavioral Appraisal & Remarks • Page 2 Transcript Sync
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {evalModalStudent && (
            <div className="space-y-6 py-2">
              {/* 1. Affective Domain (10 Traits) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Affective Domain (10 Core Character Traits)
                    </h4>
                    <p className="text-[11px] text-slate-400">Evaluates personal character, attitude, social conduct, and discipline on standard 1–5 scale.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AFFECTIVE_TRAITS.map(trait => {
                    const currentRating = parseInt(String(evalModalStudent[trait.key] || "5"), 10);
                    return (
                      <div 
                        key={trait.key} 
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate" title={trait.fullLabel}>
                            {trait.fullLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate" title={trait.desc}>
                            {trait.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {[1, 2, 3, 4, 5].map(score => {
                            const isSelected = currentRating === score;
                            return (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleScoreChange(evalModalStudent.id, trait.key, String(score))}
                                className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? score === 5
                                      ? "bg-emerald-600 text-white shadow-xs scale-105"
                                      : score === 4
                                      ? "bg-blue-600 text-white shadow-xs scale-105"
                                      : score === 3
                                      ? "bg-amber-600 text-white shadow-xs scale-105"
                                      : score === 2
                                      ? "bg-orange-600 text-white shadow-xs scale-105"
                                      : "bg-rose-600 text-white shadow-xs scale-105"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Psychomotor Domain (6 Practical Skills) */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Psychomotor Domain (6 Practical & Motor Skills)
                    </h4>
                    <p className="text-[11px] text-slate-400">Assesses manual dexterity, handwriting, athletics, and laboratory/craft skills on 1–5 scale.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PSYCHOMOTOR_SKILLS.map(skill => {
                    const currentRating = parseInt(String(evalModalStudent[skill.key] || "5"), 10);
                    return (
                      <div 
                        key={skill.key} 
                        className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate" title={skill.fullLabel}>
                            {skill.fullLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate" title={skill.desc}>
                            {skill.desc}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {[1, 2, 3, 4, 5].map(score => {
                            const isSelected = currentRating === score;
                            return (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleScoreChange(evalModalStudent.id, skill.key, String(score))}
                                className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? score === 5
                                      ? "bg-emerald-600 text-white shadow-xs scale-105"
                                      : score === 4
                                      ? "bg-blue-600 text-white shadow-xs scale-105"
                                      : score === 3
                                      ? "bg-amber-600 text-white shadow-xs scale-105"
                                      : score === 2
                                      ? "bg-orange-600 text-white shadow-xs scale-105"
                                      : "bg-rose-600 text-white shadow-xs scale-105"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Class Teacher & Principal Remarks */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Class Teacher's Cumulative Terminal Remark
                  </label>
                  <textarea
                    rows={2}
                    value={evalModalStudent.teacherRemark || ""}
                    onChange={(e) => handleScoreChange(evalModalStudent.id, "teacherRemark", e.target.value)}
                    placeholder="Enter teacher's terminal evaluation..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B5CE6]/30 focus:border-[#5B5CE6] transition-all"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                    {PRESET_REMARKS.slice(0, 3).map((pr, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleScoreChange(evalModalStudent.id, "teacherRemark", pr)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#5B5CE6]/10 hover:text-[#5B5CE6] text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                      >
                        "{pr.slice(0, 32)}..."
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Principal's Executive Conduct Remark
                  </label>
                  <textarea
                    rows={2}
                    value={evalModalStudent.principalRemark || ""}
                    onChange={(e) => handleScoreChange(evalModalStudent.id, "principalRemark", e.target.value)}
                    placeholder="Enter principal's certified conduct comment..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B5CE6]/30 focus:border-[#5B5CE6] transition-all"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                    {PRESET_REMARKS.slice(3, 6).map((pr, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleScoreChange(evalModalStudent.id, "principalRemark", pr)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#5B5CE6]/10 hover:text-[#5B5CE6] text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                      >
                        "{pr.slice(0, 32)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => {
                setEvalModalStudentId(null);
                toast.success("Scholar conduct appraisal applied to sheet");
              }}
              className="px-5 py-2 bg-[#5B5CE6] hover:bg-[#4a4bd1] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Done & Apply Appraisal
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Configuration Modal */}
      <EditConfigModal
        isOpen={isEditConfigOpen}
        onClose={() => setIsEditConfigOpen(false)}
        config={config}
      />
    </div>
  );
}

