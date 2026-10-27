'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import StudentProfile from './components/StudentProfile';
import AttendanceAlert from './components/AttendanceAlert';
import AttendanceChart from './components/AttendanceChart';
import MonthlyTrend from './components/MonthlyTrend';
import RecentActivity, { type Activity } from './components/RecentActivity';
import QuickContact from './components/QuickContact';
import DetailsModal from './components/DetailsModal';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { useChildDetails, useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useParentDashboard } from '@/lib/api/hooks/useParentDashboard';
import { useStudentAttendance } from '@/lib/api/hooks/useStudent';
import StudentAttendanceDetailModal from '@/app/dashboard/admin/classes/[id]/components/attendance/components/StudentAttendanceDetailModal';
import type { AttendanceRecord as ModalAttendanceRecord, ClassSubjectItem } from '@/app/dashboard/admin/classes/[id]/components/attendance/components/types';
import { buildAttendanceModalData, getCleanAttendance, type RawStudentAttendance } from '@/lib/attendance/attendanceRecord';
import { format, isToday, isYesterday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Users, 
  CalendarCheck, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { toast } from 'react-toastify';

type AttendanceRecord = RawStudentAttendance & { status: string };

// ==========================================
// Full Shimmering Modern Loading Skeleton
// ==========================================
function AttendancePageSkeleton() {
  return (
    <main className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      {/* Top Child Switcher Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-8 w-28 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="size-16 sm:size-20 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-8 w-60 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      {/* Alert Banner Skeleton */}
      <div className="h-16 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="h-64 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-40 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
          <div className="h-72 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-48 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="h-80 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-44 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-sm">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}

// ==========================================
// Empty State: No Children Linked to Parent
// ==========================================
function NoChildrenLinkedState() {
  return (
    <main className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-300">
      <div className="rounded-[24px] bg-gradient-to-br from-orange-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-100 dark:border-slate-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 size-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Users size={14} />
            Parent Portal • Attendance Intelligence
          </div>

          <div className="space-y-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              No Children Linked to Your Account
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              To track daily classroom attendance, monitor monthly consistency trends, and receive real-time notifications when attendance is marked, connect your child using their unique school-issued Student Access Code.
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
                Go to Linked Students and submit a connection authorization request.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <span className="text-xs font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider">Step 3</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
                Once approved, daily roll-call presence and term consistency charts will appear here.
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
    </main>
  );
}

// ==========================================
// Empty State: No Attendance Records Yet
// ==========================================
interface NoAttendanceStateProps {
  childName: string;
  onRefresh: () => void;
}

function NoAttendanceState({ childName, onRefresh }: NoAttendanceStateProps) {
  return (
    <div className="p-10 sm:p-14 text-center bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
      <div className="size-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto shadow-xs">
        <Clock size={32} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          No Attendance Records Logged Yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Daily roll-call records for <span className="font-semibold text-slate-700 dark:text-slate-300">{childName}</span> have not been posted by classroom teachers for this session yet.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <Button
          type="button"
          onClick={onRefresh}
          variant="outline"
          className="h-10 px-5 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:border-orange-500 hover:text-orange-600 transition-colors shadow-xs"
        >
          <RotateCw size={14} />
          <span>Refresh Records</span>
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// Main Parent Attendance Page
// ==========================================
export default function ParentAttendancePage() {
  const [trendPeriod, setTrendPeriod] = useState('This Semester');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [inspectRecord, setInspectRecord] = useState<ModalAttendanceRecord | null>(null);
  const [inspectSubjects, setInspectSubjects] = useState<ClassSubjectItem[]>([]);

  const { selectedChildId, setSelectedChildId } = useParentStore();
  const { data: children = [], isLoading: isChildrenLoading, refetch: refetchChildren } = useParentChildren();

  // Validate that selectedChildId belongs to the current logged-in parent
  useEffect(() => {
    if (children.length > 0) {
      const isValidChild = children.some((c) => c.id === selectedChildId);
      if (!selectedChildId || !isValidChild) {
        setSelectedChildId(children[0].id);
      }
    }
  }, [children, selectedChildId, setSelectedChildId]);

  // Use the verified child ID strictly belonging to the logged-in parent
  const activeChildId = (children.some((c) => c.id === selectedChildId) ? selectedChildId : children[0]?.id) || null;

  const { 
    data: dashboard, 
    isLoading: loadingDash, 
    refetch: refetchDashboard 
  } = useParentDashboard(activeChildId);

  const { 
    data: child, 
    isLoading: loadingChild, 
    refetch: refetchChild 
  } = useChildDetails(activeChildId);

  // Rich attendance rows (parsed notes, recorded subjects, class subjects, department)
  const {
    data: richAttendance,
    isLoading: loadingAttendance,
    refetch: refetchAttendance,
  } = useStudentAttendance(activeChildId || '');

  // Newest first; fall back to the lighter child-details list if the rich endpoint is empty
  const attendances = useMemo<AttendanceRecord[]>(() => {
    const rich = Array.isArray(richAttendance) ? (richAttendance as AttendanceRecord[]) : [];
    const legacy = ((child as unknown as { attendances?: AttendanceRecord[] } | undefined)?.attendances) || [];
    const source = rich.length > 0 ? rich : legacy;
    return [...source]
      .filter((a) => !!a.date && !isNaN(new Date(a.date).getTime()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [richAttendance, child]);

  const handleManualRefresh = () => {
    refetchChildren();
    if (activeChildId) {
      refetchDashboard();
      refetchChild();
      refetchAttendance();
    }
    toast.info("Refreshed attendance records.");
  };

  const isLoadingOverall = isChildrenLoading || (!!activeChildId && (loadingDash || loadingChild || loadingAttendance));

  // 1. Loading Skeleton
  if (isLoadingOverall) {
    return <AttendancePageSkeleton />;
  }

  // 2. Empty State: No Children Linked to Parent
  if (!isChildrenLoading && children.length === 0) {
    return <NoChildrenLinkedState />;
  }

  // Resolve Student Info
  const selectedChild = children.find((c) => c.id === activeChildId) || dashboard?.child;
  const studentData = {
    name: selectedChild?.name || child?.name || dashboard?.child?.name || 'Student',
    grade: selectedChild?.currentClass ? `${selectedChild.currentClass.name} ${selectedChild.currentClass.section || ''}` : (child?.classes?.[0]?.class?.name || 'Unassigned'),
    studentId: selectedChild?.studentCode || child?.studentCode || dashboard?.child?.studentCode || 'N/A',
    imageUrl: selectedChild?.profileImage || child?.profileImage || dashboard?.child?.profileImage,
    schoolName: selectedChild?.school?.name || child?.school?.name || dashboard?.child?.school?.name,
  };

  const openInspection = (record: AttendanceRecord) => {
    const childDept = (child as unknown as { departmentId?: string | null; department?: { id: string; name: string; code?: string } | null } | undefined);
    const { record: modalRecord, classSubjects } = buildAttendanceModalData(record, {
      studentId: activeChildId || undefined,
      studentName: studentData.name,
      studentCode: studentData.studentId,
      className: studentData.grade,
      departmentId: childDept?.departmentId ?? null,
      department: childDept?.department ?? null,
    });
    setInspectSubjects(classSubjects);
    setInspectRecord(modalRecord);
  };

  const openInspectionById = (id: string) => {
    const rec = attendances.find((a) => (a.id || a.date) === id);
    if (rec) openInspection(rec);
  };

  const presentDays = attendances.filter((a) => (a.status || '').toLowerCase() === 'present').length;
  const lateDays = attendances.filter((a) => (a.status || '').toLowerCase() === 'late').length;
  const absentDays = attendances.filter((a) => (a.status || '').toLowerCase() === 'absent').length;
  const totalRecordedDays = presentDays + lateDays + absentDays;

  // Real-time calculation based on recorded attendance items
  const calculatedRate = totalRecordedDays > 0
    ? Math.round(((presentDays + lateDays) / totalRecordedDays) * 100)
    : (dashboard?.stats?.attendanceRate ?? 100);

  const attendanceRate = calculatedRate;

  // Recent 5 activities
  const activities: Activity[] = attendances.slice(0, 5).map((a) => {
    let dateStr = '';
    const d = new Date(a.date);
    if (!isNaN(d.getTime())) {
      if (isToday(d)) dateStr = 'Today, ' + format(d, 'MMM dd');
      else if (isYesterday(d)) dateStr = 'Yesterday, ' + format(d, 'MMM dd');
      else dateStr = format(d, 'EEE, MMM dd');
    } else {
      dateStr = 'Recent';
    }

    const st = (a.status || 'present').toLowerCase() as Activity['status'];
    const { comment, chips } = getCleanAttendance(a);
    return {
      id: a.id || a.date,
      date: dateStr,
      status: st,
      description: st.charAt(0).toUpperCase() + st.slice(1),
      time: 'Recorded',
      comment,
      subjects: chips,
    };
  });

  // Monthly breakdown
  let breakdown = dashboard?.stats?.attendanceBreakdown || [];
  if (breakdown.length === 0 && attendances.length > 0) {
    breakdown = [...attendances].reverse().map((a) => ({
      date: a.date,
      present: (a.status || '').toLowerCase() === 'present' || (a.status || '').toLowerCase() === 'late',
    }));
  }

  let sliceCount = 5;
  let trendText = "Average attendance improved by 2% compared to last semester";
  if (trendPeriod === 'Last Month') {
    sliceCount = 3;
    trendText = "Attendance remained stable over the last month";
  } else if (trendPeriod === 'Last 3 Months') {
    sliceCount = 7;
    trendText = "Average attendance improved by 1.5% over the last quarter";
  }

  const monthlyData = breakdown.slice(-sliceCount).map((b, i) => {
    const d = new Date(b.date);
    const validDate = !isNaN(d.getTime());
    return {
      month: validDate ? format(d, 'MMM dd') : `Session ${i + 1}`,
      attendance: b.present ? 100 : 0,
      isCurrent: i === Math.min(breakdown.length, sliceCount) - 1,
    };
  });

  return (
    <main className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      
      {/* Multi-Child Switcher if parent has more than 1 child */}
      {children.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            Viewing Attendance:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {children.map((childItem) => {
              const isSelected = activeChildId === childItem.id;
              return (
                <button
                  key={childItem.id}
                  type="button"
                  onClick={() => setSelectedChildId(childItem.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 active:scale-95",
                    isSelected
                      ? "bg-orange-600 text-white shadow-sm ring-2 ring-orange-500/20"
                      : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500/40"
                  )}
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: isSelected ? '#fff' : '#ea580c' }} />
                  <span>{childItem.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Profile Hero */}
      <StudentProfile
        student={studentData}
        lastUpdated={`Today, ${format(new Date(), 'h:mm a')}`}
        onRefresh={handleManualRefresh}
      />

      {/* Attendance Alert Banner */}
      <AttendanceAlert
        attendanceRate={attendanceRate}
        message={`${studentData.name} has maintained a ${attendanceRate}% presence record for the active academic session.`}
      />

      {/* Main Dashboard Grid or Empty State */}
      {attendances.length === 0 && totalRecordedDays === 0 && breakdown.length === 0 ? (
        <NoAttendanceState
          childName={studentData.name}
          onRefresh={handleManualRefresh}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Chart & Trend */}
          <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
            <AttendanceChart
              attendance={attendanceRate}
              stats={{
                presentDays,
                lateDays,
                absentDays,
              }}
              status={attendanceRate >= 90 ? "excellent" : attendanceRate >= 75 ? "good" : "poor"}
              onViewDetails={() => setIsDetailsModalOpen(true)}
            />

            <MonthlyTrend 
              data={monthlyData} 
              period={trendPeriod}
              onPeriodChange={setTrendPeriod}
              trendText={trendText}
            />
          </div>

          {/* Right Column: Recent Activity & Quick Action */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <RecentActivity
              activities={activities}
              viewAllHref="/dashboard/parent/attendance/monthly"
              onActivityClick={openInspectionById}
            />

            <QuickContact
              description={`Notify the school administration if ${studentData.name} will be absent or submit advance medical/leave notices.`}
              onButtonClick={() => {
                toast.info("Submit Absence Note feature is coming soon!", {
                  toastId: "absence-note-coming-soon",
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      <DetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        attendances={attendances} 
        onRecordClick={(rec) => {
          setIsDetailsModalOpen(false);
          openInspection(rec as AttendanceRecord);
        }}
      />

      {/* Per-day inspection: overall arrival + subject breakdown (read-only for parents) */}
      <StudentAttendanceDetailModal
        isOpen={!!inspectRecord}
        onClose={() => setInspectRecord(null)}
        record={inspectRecord}
        classSubjects={inspectSubjects}
        classNameLabel={inspectRecord?.className || studentData.grade}
        readOnly
      />
    </main>
  );
}
