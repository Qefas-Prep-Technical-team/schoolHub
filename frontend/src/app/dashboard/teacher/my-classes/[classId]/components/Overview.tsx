/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PerformanceChart from "./PerformanceChart";
import BehaviourAlert from "./BehaviourAlert";
import StatsCard from "./StatsCard";
import UpcomingExams from "./UpcomingExams";
import { useClassAttendanceSummary, useClassStats } from "@/lib/api/hooks/useClasses";
import { useParams } from "next/navigation";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { computeGradePill } from "@/utils/gradingSystem";

interface OverviewProps {
  behaviourAlerts: any[];
  upcomingExams?: any[];
  classData: any;
  teacherClassDetail?: any;
}

const Overview: React.FC<OverviewProps> = ({ behaviourAlerts, classData, upcomingExams, teacherClassDetail }) => {
  const params = useParams();
  const classId = (params.classId as string) || (params.id as string) || classData?.id;
  const { data: attendanceSummary, isLoading: isAttendanceSummaryLoading } = useClassAttendanceSummary(classId);
  const { data: stats, isLoading: isStatsLoading } = useClassStats(classId);

  const { user } = useAuthStore();
  const { selectedSchoolId } = useDashboardStore();
  const currentTeacherId = (user as any)?.id as string | undefined;
  const effectiveSchoolId = (selectedSchoolId && selectedSchoolId !== currentTeacherId)
    ? selectedSchoolId
    : (classData?.schoolId || (user as any)?.schools?.[0]?.schoolId || (user as any)?.schoolId);
  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);

  // Derived data: prioritize teacher's subject-focused upcoming activities
  const realUpcomingExams = upcomingExams !== undefined
    ? upcomingExams
    : (teacherClassDetail?.upcomingActivities && teacherClassDetail.upcomingActivities.length > 0)
    ? teacherClassDetail.upcomingActivities.slice(0, 4).map((act: any) => ({
        id: act.id,
        title: act.title || 'Assessment',
        subject: act.description || teacherClassDetail?.classInfo?.subject || 'Exam',
        date: act.date,
        rawDate: act.date,
        type: act.type || 'EXAM',
        status: act.status || 'upcoming',
        totalMarks: act.totalMarks,
        durationMinutes: act.durationMinutes,
      }))
    : (classData?.exams || []).slice(0, 4).map((e: any) => {
        const resolvedSubject = e.subject?.name 
          || e.subjectExamPapers?.[0]?.subjectPaper?.subject?.name 
          || e.title.replace(/exam|quiz|assessment/gi, '').trim() 
          || 'General';
        const formattedDate = e.startDate
          ? new Date(e.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return {
          id: e.id,
          title: e.title,
          subject: resolvedSubject,
          date: formattedDate,
          rawDate: e.startDate || e.createdAt,
          type: e.category || 'EXAM',
          status: e.status?.toLowerCase() || 'scheduled',
          totalMarks: e.totalMarks,
          durationMinutes: e.durationMinutes,
        };
      });

  const subjectAverageVal = teacherClassDetail?.stats?.averageGrade !== undefined
    ? teacherClassDetail.stats.averageGrade
    : stats?.overallAvgScore;
  const avgNum = subjectAverageVal !== undefined && !isNaN(Number(subjectAverageVal)) ? Number(subjectAverageVal) : null;
  const avgPill = avgNum !== null ? computeGradePill(avgNum, schoolProfile?.gradingSystem) : null;

  return (
    <div className="mt-4 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
      
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 lg:gap-8">
        {/* Performance Chart */}
        <PerformanceChart 
          performanceTrend={stats?.performanceTrend} 
          attendanceTrend={stats?.attendanceTrend}
          isLoading={isStatsLoading}
        />

        {/* Behaviour Alerts */}
        <BehaviourAlert alerts={behaviourAlerts} />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6 lg:gap-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          <StatsCard 
            title="Subject Average Score" 
            value={avgNum !== null ? `${avgNum}%` : "0%"} 
            isLoading={isStatsLoading && !teacherClassDetail}
            badge={avgPill ? (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${avgPill.bg} ${avgPill.color}`}>
                {avgPill.label}
              </span>
            ) : undefined}
          />
          <StatsCard 
            title="Attendance Summary" 
            value={teacherClassDetail?.attendance?.overallPercentage !== undefined
              ? `${Math.round(teacherClassDetail.attendance.overallPercentage)}%`
              : attendanceSummary ? `${Math.round(attendanceSummary.rate)}%` : "0%"} 
            isLoading={isAttendanceSummaryLoading && !teacherClassDetail}
          />
        </div>

        {/* Upcoming Exams */}
        <UpcomingExams exams={realUpcomingExams} />
      </div>
    </div>
  );
};

export default Overview;
