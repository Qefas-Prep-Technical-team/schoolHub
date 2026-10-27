"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  School, 
  GraduationCap, 
  Users, 
  BookOpen, 
  CalendarDays, 
  Clock, 
  UserCheck, 
  RotateCw, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Copy, 
  Check, 
  Sparkles, 
  LayoutDashboard,
  ShieldCheck,
  Building,
  Layers,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useParentChildren, useChildDetails } from '@/lib/api/hooks/useParentChildren';
import { useSingleClass, useClassBehaviourAlerts } from '@/lib/api/hooks/useClasses';
import { useExams } from '@/lib/api/hooks/useExams';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import Overview from '@/app/dashboard/admin/classes/[id]/components/Overview';
import ParentClassSubjects, { SubjectItem } from './ParentClassSubjects';
import ParentClassTimetable from './ParentClassTimetable';
import SwitchClassModal, { AvailableClass } from './SwitchClassModal';

interface RawAlert {
  id: string;
  type?: string;
  title?: string;
  description?: string;
  studentId?: string;
  student?: { id?: string; name?: string };
  reporter?: { name?: string };
}

interface RawExam {
  id: string;
  title: string;
  category?: string;
  createdAt: string;
  startDate?: string;
}

// ==========================================
// Full Shimmering Modern Loading Skeleton
// ==========================================
function ClassPageSkeleton() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      {/* Top Child Selector Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-7 w-44 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="h-9 sm:h-11 w-2/3 max-w-md bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-4 w-1/2 max-w-sm bg-slate-100 dark:bg-slate-800/70 rounded animate-pulse" />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="size-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Modern Tabs Bar Skeleton */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-fit">
        <div className="h-10 w-36 rounded-xl bg-white dark:bg-slate-800 shadow-sm animate-pulse" />
        <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800/40 animate-pulse" />
        <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800/40 animate-pulse" />
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-72 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="h-44 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-20 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-24 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="h-56 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Empty State: No Children Linked to Parent
// ==========================================
function NoChildrenLinkedState() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      <div className="rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-100 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 size-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Users size={14} />
            Parent Portal • Classroom Network
          </div>

          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              No Children Linked to Your Account
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              To inspect your child&apos;s active classroom cohort, view assigned curriculum subjects, verify weekly schedules, and monitor cohort averages, connect your student using their school-issued Student Access Code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 1</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Obtain your child&apos;s unique Student Access Code (e.g. STU-2024-001) from their school.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 2</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Navigate to Linked Students and submit a connection authorization request.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 3</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Once approved, their live classroom schedules, teachers, and grades will sync instantly.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link href="/dashboard/parent/my-children">
              <Button className="h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <span>Go to Linked Students</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Empty State: Child Has No Class Assigned Yet
// ==========================================
interface NoClassAssignedStateProps {
  childName: string;
  studentCode: string;
  schoolName?: string;
  avatarUrl?: string;
  allChildren: { id: string; name: string }[];
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
  onRefresh: () => void;
}

function NoClassAssignedState({
  childName,
  studentCode,
  schoolName,
  avatarUrl,
  allChildren,
  selectedChildId,
  onSelectChild,
  onRefresh,
}: NoClassAssignedStateProps) {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      {/* Multi-Child Switcher if parent has more than 1 child */}
      {allChildren.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            Viewing Student:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {allChildren.map((child) => {
              const isSelected = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onSelectChild(child.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 active:scale-95",
                    isSelected
                      ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-500/20"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500/40"
                  )}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#fff' : '#ea580c' }} />
                  <span>{child.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Friendly Guidance Card */}
      <div className="rounded-[24px] bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-100 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 size-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          {/* Student Context Badge */}
          <div className="flex items-center gap-3 p-2.5 pr-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 w-fit shadow-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt={childName} className="size-10 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm shrink-0">
                {childName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{childName}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{studentCode || 'N/A'}</span></span>
                {schoolName && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{schoolName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap size={14} />
              Classroom Placement Pending
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              No Classroom Cohort Assigned Yet
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{childName}</span> is registered in the school network but has not yet been assigned to an active classroom cohort for the current academic session.
            </p>
          </div>

          {/* Context Explanations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <CalendarDays size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Term Transitions</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Schools assign students to new classes and sections during registration periods or at the start of a term.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <UserCheck size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Roster Finalization</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If the student recently joined or changed arms, the administrative office is completing roster allocations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sparkles size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Instant Sync</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                As soon as the class teacher or school administrator assigns the student, timetables will appear here automatically.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3 items-center">
            <Button
              type="button"
              onClick={onRefresh}
              variant="outline"
              className="h-11 px-5 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-colors shadow-xs"
            >
              <RotateCw size={14} />
              <span>Refresh Status</span>
            </Button>

            <Link href="/dashboard/parent/my-children">
              <Button className="h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm">
                <span>View Linked Students</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Class Details Component
// ==========================================
export default function ClassDetails() {
  const { selectedChildId, setSelectedChildId } = useParentStore();
  const { data: children = [], isLoading: isChildrenLoading } = useParentChildren();
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useParentDashboard(selectedChildId);
  const { data: childDetails, isLoading: isChildDetailsLoading } = useChildDetails(selectedChildId);

  // Auto-select first child if none is currently selected in store
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChildId]);

  // Memoize all available classes for this child from both dashboard and details
  const availableClasses = React.useMemo<AvailableClass[]>(() => {
    const map = new Map<string, AvailableClass>();

    // 1. Current class from dashboard
    if (dashboardData?.child?.currentClass?.id) {
      const cc = dashboardData.child.currentClass as any;
      map.set(cc.id, {
        id: cc.id,
        name: cc.name,
        section: cc.section,
        level: cc.level,
        session: cc.session,
        term: cc.term,
        classCode: cc.classCode,
        teachers: cc.teachers,
      });
    }

    // 2. All classes array from dashboard
    const dashClasses = (dashboardData?.child as any)?.classes;
    if (Array.isArray(dashClasses)) {
      dashClasses.forEach((c: any) => {
        if (c?.id) {
          map.set(c.id, {
            id: c.id,
            name: c.name,
            section: c.section,
            level: c.level,
            session: c.session,
            term: c.term,
            classCode: c.classCode,
            teachers: c.teachers,
          });
        }
      });
    }

    // 3. Classes from childDetails
    if (Array.isArray(childDetails?.classes)) {
      childDetails.classes.forEach((cItem: any) => {
        const cls = cItem?.class;
        if (cls?.id) {
          map.set(cls.id, {
            id: cls.id,
            name: cls.name,
            section: cls.section,
            level: cls.level,
            session: cls.session,
            term: cls.term,
            classCode: cls.classCode,
            teachers: cls.teachers,
          });
        }
      });
    }

    return Array.from(map.values());
  }, [dashboardData, childDetails]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isSwitchClassModalOpen, setIsSwitchClassModalOpen] = useState(false);

  // Sync selectedClassId when available classes change or child switches
  useEffect(() => {
    if (availableClasses.length > 0) {
      if (!selectedClassId || !availableClasses.some((c) => c.id === selectedClassId)) {
        setSelectedClassId(availableClasses[0].id);
      }
    } else {
      setSelectedClassId(null);
    }
  }, [availableClasses, selectedClassId, selectedChildId]);

  const classId = selectedClassId || dashboardData?.child?.currentClass?.id || availableClasses[0]?.id || "";

  const { 
    data: classData, 
    isLoading: isClassLoading, 
    error: classError,
    refetch: refetchClass 
  } = useSingleClass(classId || "");

  const { data: realBehaviourAlerts = [] } = useClassBehaviourAlerts(classId || "", selectedChildId || undefined);
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "schedule">("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedChild = children.find((c) => c.id === selectedChildId) || dashboardData?.child;
  const childName = selectedChild?.name || dashboardData?.child?.name || "Student";
  const studentCode = selectedChild?.studentCode || dashboardData?.child?.studentCode || "";
  const schoolName = dashboardData?.child?.school?.name || classData?.school?.name;
  const avatarUrl = selectedChild?.profileImage || dashboardData?.child?.profileImage;

  const handleCopyClassCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Class Code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleManualRefresh = () => {
    refetchDashboard();
    if (classId) refetchClass();
    toast.info("Refreshed classroom status.");
  };

  // Safe behavioral alerts mapping with strict typing
  const behaviourAlerts = (realBehaviourAlerts as RawAlert[])
    .filter((alert) => alert.studentId === selectedChildId || alert.student?.id === selectedChildId)
    .map((alert) => ({
      id: alert.id,
      type: (alert.type || 'warning').toLowerCase() as 'warning' | 'danger',
      title: alert.title || 'Behavioral Notice',
      description: alert.description || "",
      student: alert.student?.name || childName,
      reportedBy: alert.reporter?.name || "School Staff",
    }));

  const { data: studentExamsResponse } = useExams({ 
    availableForStudentId: selectedChildId || "",
    status: "PUBLISHED",
  });
  
  const upcomingExams = ((studentExamsResponse || []) as RawExam[]).slice(0, 3).map((e) => ({
    id: e.id,
    subject: e.title.split(' ')[0] || 'Exam',
    date: e.startDate ? new Date(e.startDate).toLocaleDateString() : new Date(e.createdAt).toLocaleDateString(),
    type: e.category || 'Exam',
  }));

  // Resolve all assigned teachers for class teacher card slider
  interface TeacherProfile {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    isLead?: boolean;
  }

  const assignedTeachers = React.useMemo<TeacherProfile[]>(() => {
    const list: TeacherProfile[] = [];
    const seenNames = new Set<string>();

    if (Array.isArray(classData?.teachers)) {
      classData.teachers.forEach((item: any) => {
        const t = item?.teacher;
        const name = t?.name || t?.fullName;
        if (name && !seenNames.has(name.toLowerCase().trim())) {
          seenNames.add(name.toLowerCase().trim());
          list.push({
            id: t?.id || item?.id,
            name,
            email: t?.email,
            phone: t?.phone,
            isLead: Boolean(item?.isLead),
          });
        }
      });
    }

    if (classData?.teacher?.name) {
      const name = classData.teacher.name;
      if (!seenNames.has(name.toLowerCase().trim())) {
        seenNames.add(name.toLowerCase().trim());
        list.push({
          id: classData.teacher.id,
          name,
          email: classData.teacher.email,
          phone: classData.teacher.phone,
          isLead: true,
        });
      }
    }

    // Sort so lead teacher comes first
    return list.sort((a, b) => (b.isLead ? 1 : 0) - (a.isLead ? 1 : 0));
  }, [classData]);

  const [currentTeacherIndex, setCurrentTeacherIndex] = useState(0);
  const [isTeacherSliderHovered, setIsTeacherSliderHovered] = useState(false);

  // Reset slider index when class changes
  useEffect(() => {
    setCurrentTeacherIndex(0);
  }, [classId]);

  // Auto-slide every 3.5s if more than 1 teacher and not hovered
  useEffect(() => {
    if (assignedTeachers.length <= 1 || isTeacherSliderHovered) return;
    const interval = setInterval(() => {
      setCurrentTeacherIndex((prev) => (prev + 1) % assignedTeachers.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [assignedTeachers.length, isTeacherSliderHovered]);

  const leadTeacherRel = assignedTeachers.find((t) => t.isLead) || assignedTeachers[0];
  const leadTeacherName = leadTeacherRel?.name || "Homeroom Teacher";
  const currentTeacher = assignedTeachers[currentTeacherIndex] || assignedTeachers[0];

  // Statistics
  const enrolledCount = classData?.enrollments?.length ?? classData?.students?.length ?? 0;
  const subjectsList = (classData?.subjects || []) as SubjectItem[];
  const subjectsCount = subjectsList.length;

  const isLoadingOverall = isChildrenLoading || (isDashboardLoading && isChildDetailsLoading) || (!!classId && isClassLoading);

  // 1. Loading State
  if (isLoadingOverall) {
    return <ClassPageSkeleton />;
  }

  // 2. Empty State: Parent Has 0 Children Linked
  if (!isChildrenLoading && children.length === 0) {
    return <NoChildrenLinkedState />;
  }

  // 3. Empty State: Selected Child Has No Class Assigned Yet
  if (!classId) {
    return (
      <NoClassAssignedState
        childName={childName}
        studentCode={studentCode}
        schoolName={schoolName}
        avatarUrl={avatarUrl}
        allChildren={children.map((c) => ({ id: c.id, name: c.name }))}
        selectedChildId={selectedChildId}
        onSelectChild={setSelectedChildId}
        onRefresh={handleManualRefresh}
      />
    );
  }

  // 4. Main State: Class Data Available
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      
      {/* Multi-Child Switcher Banner if Parent Has More than 1 Child */}
      {children.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            Cohort Student:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {children.map((child) => {
              const isSelected = selectedChildId === child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildId(child.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 active:scale-95",
                    isSelected
                      ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-500/20"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500/40"
                  )}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#fff' : '#ea580c' }} />
                  <span>{child.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero Classroom Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-72 rounded-full bg-gradient-to-bl from-orange-400/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Badges & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold uppercase tracking-wider">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Cohort
              </span>

              {schoolName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                  <Building size={12} className="text-slate-400" />
                  {schoolName}
                </span>
              )}

              {classData?.level && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100/70 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-[11px] font-bold uppercase tracking-wider">
                  Level {classData.level}
                </span>
              )}
            </div>

            {/* Viewing for child badge & Switch Class button */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsSwitchClassModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black shadow-sm shadow-orange-500/20 transition-all active:scale-95 group cursor-pointer"
              >
                <Layers size={14} className="text-orange-200 group-hover:rotate-12 transition-transform" />
                <span>Switch Class</span>
                {availableClasses.length > 1 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                    {availableClasses.length}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Child:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{childName}</span>
                {studentCode && (
                  <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-semibold bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 rounded">
                    {studentCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Title & Header Tooltip */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {classData?.name || "Classroom Overview"} {classData?.section ? `• Section ${classData.section}` : ""}
              </h1>
              <HeaderTooltip
                content="Comprehensive overview of the classroom cohort your child is currently enrolled in. Use this hub to track cohort-wide academic averages, monitor daily attendance consistency, review assigned subject syllabi, inspect weekly timetable periods, and reach out to designated class instructors."
                size={18}
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Real-time academic intelligence, assigned course instructors, and weekly timetable schedules for {childName}&apos;s cohort.
            </p>
          </div>

          {/* Metadata Pills Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
            {classData?.classCode && (
              <button
                type="button"
                onClick={() => handleCopyClassCode(classData.classCode)}
                title="Click to copy Class Code"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-orange-500/50 hover:text-orange-600 transition-all shadow-xs group"
              >
                <span className="text-slate-400 group-hover:text-orange-500 text-[10px] uppercase font-bold tracking-wider">Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{classData.classCode}</span>
                {copiedCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-slate-400 group-hover:text-orange-500" />}
              </button>
            )}

            {classData?.session && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Session:</span>
                <span className="text-slate-900 dark:text-white">{classData.session}</span>
              </div>
            )}

            {classData?.term && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Term:</span>
                <span className="text-slate-900 dark:text-white">{classData.term}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
              <UserCheck size={13} className="text-orange-500" />
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Lead:</span>
              <span className="text-slate-900 dark:text-white truncate max-w-[150px]">{leadTeacherName}</span>
              {assignedTeachers.length > 1 && (
                <span className="text-slate-400 text-[10px] font-medium">
                  (+{assignedTeachers.length - 1})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Quick-Insight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* Card 1: Enrolled Cohort Size */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Class Roster
            </span>
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {enrolledCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Enrolled students in cohort
            </p>
          </div>
        </div>

        {/* Card 2: Curriculum Subjects */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Curriculum
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen size={16} />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {subjectsCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Accredited courses assigned
            </p>
          </div>
        </div>

        {/* Card 3: Class Teacher Card / Interactive Slider */}
        <div 
          className="p-4 sm:p-5 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300 relative group/card"
          onMouseEnter={() => setIsTeacherSliderHovered(true)}
          onMouseLeave={() => setIsTeacherSliderHovered(false)}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Class Teacher{assignedTeachers.length > 1 ? "s" : ""}
              </span>
              {assignedTeachers.length > 1 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                  {currentTeacherIndex + 1}/{assignedTeachers.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {assignedTeachers.length > 1 && (
                <div className="flex items-center gap-0.5 opacity-80 group-hover/card:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTeacherIndex((prev) => (prev - 1 + assignedTeachers.length) % assignedTeachers.length);
                    }}
                    className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-500 hover:text-purple-600 dark:hover:text-purple-300 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Previous teacher"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTeacherIndex((prev) => (prev + 1) % assignedTeachers.length);
                    }}
                    className="size-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-500 hover:text-purple-600 dark:hover:text-purple-300 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Next teacher"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
              <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <UserCheck size={16} />
              </div>
            </div>
          </div>

          <div>
            <div className="relative overflow-hidden min-h-[38px]">
              <div 
                key={currentTeacherIndex}
                className="animate-in fade-in slide-in-from-right-3 duration-300 transition-all"
              >
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {currentTeacher?.name || leadTeacherName}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 truncate">
                  <span className={cn(
                    "size-1.5 rounded-full shrink-0",
                    currentTeacher?.isLead ? "bg-emerald-500" : "bg-purple-500"
                  )} />
                  <span>
                    {currentTeacher?.isLead ? "Designated homeroom lead" : "Assigned class teacher"}
                  </span>
                </p>
              </div>
            </div>

            {/* Slider Dots Indicator */}
            {assignedTeachers.length > 1 && (
              <div className="flex items-center gap-1.5 pt-2">
                {assignedTeachers.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentTeacherIndex(idx);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300 cursor-pointer",
                      idx === currentTeacherIndex
                        ? "w-5 bg-purple-600 dark:bg-purple-400"
                        : "w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-400"
                    )}
                    aria-label={`View teacher ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Section & Code */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Class Section
            </span>
            <div className="size-8 rounded-xl bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Layers size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {classData?.section ? `Arm ${classData.section}` : "Main Section"}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 font-mono">
              {classData?.classCode || "Code N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Modern Interactive Tab Selector */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200",
              activeTab === "overview"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <LayoutDashboard size={15} />
            <span>Class Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("subjects")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200",
              activeTab === "subjects"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <BookOpen size={15} />
            <span>Subjects</span>
            <span className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded-full",
              activeTab === "subjects" 
                ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            )}>
              {subjectsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200",
              activeTab === "schedule"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <CalendarDays size={15} />
            <span>Class Schedule</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          title="Refresh classroom data"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Dynamic Tab Content Area */}
      <div className="w-full animate-in fade-in-50 duration-300">
        {activeTab === "overview" && (
          <Overview
            behaviourAlerts={behaviourAlerts}
            upcomingExams={upcomingExams}
            classData={classData}
          />
        )}

        {activeTab === "subjects" && (
          <ParentClassSubjects classSubjects={subjectsList} />
        )}

        {activeTab === "schedule" && (
          <ParentClassTimetable
            classId={classId}
            schoolId={classData?.schoolId || dashboardData?.child?.school?.id}
          />
        )}
      </div>

      {/* Switch Class Modal Popup */}
      <SwitchClassModal
        isOpen={isSwitchClassModalOpen}
        onClose={() => setIsSwitchClassModalOpen(false)}
        classes={availableClasses}
        currentClassId={classId}
        onSelectClass={(newClassId) => {
          setSelectedClassId(newClassId);
          const found = availableClasses.find((c) => c.id === newClassId);
          toast.success(`Switched view to ${found?.name || "selected class"}`);
        }}
        childName={childName}
      />
    </div>
  );
}
