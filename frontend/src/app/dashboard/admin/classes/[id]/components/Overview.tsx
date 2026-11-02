/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PerformanceChart from "./PerformanceChart";
import BehaviourAlert from "./BehaviourAlert";
import StatsCard from "./StatsCard";
import UpcomingExams from "./UpcomingExams";

interface OverviewProps {
  behaviourAlerts: any[];
  upcomingExams?: any[];
  classData: any;
}

import { useClassAttendanceSummary, useClassStats } from "@/lib/api/hooks/useClasses";
import { useParams } from "next/navigation";

const Overview: React.FC<OverviewProps> = ({ behaviourAlerts, classData, upcomingExams }) => {
  const params = useParams();
  const classId = (params.id as string) || classData?.id;
  const { data: attendanceSummary, isLoading: isAttendanceSummaryLoading } = useClassAttendanceSummary(classId);
  const { data: stats, isLoading: isStatsLoading } = useClassStats(classId);

  // Derived data
  const realUpcomingExams = upcomingExams !== undefined
    ? upcomingExams
    : (classData?.exams || [])
        .filter((e: any) => e.status !== 'ARCHIVED' && e.status !== 'DRAFT')
        .slice(0, 5)
        .map((e: any) => {
          const subjectName = e.subject?.name || (e.subjectExamPapers?.[0]?.subjectPaper?.subject?.name) || e.title || 'General';
          const targetDate = e.startDate ? new Date(e.startDate) : (e.endDate ? new Date(e.endDate) : (e.createdAt ? new Date(e.createdAt) : null));
          const displayDate = targetDate && !isNaN(targetDate.getTime())
            ? targetDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'TBA';

          return {
            id: e.id,
            title: e.title || subjectName,
            subject: subjectName,
            date: displayDate,
            type: e.category || e.type || 'EXAM',
            scope: e.scope || 'CLASS',
            totalMarks: e.totalMarks,
            durationMinutes: e.durationMinutes,
          };
        });

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
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
      <div className="lg:col-span-1 flex flex-col gap-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
          <StatsCard 
            title="Class Average Score" 
            value={stats ? `${stats.overallAvgScore}%` : "0%"} 
            isLoading={isStatsLoading}
            info="Displays the aggregate average score of all students in this class across all recorded assessments. Use this to quickly gauge the overall academic health and performance level of the class."
          />
          <StatsCard 
            title="Attendance Summary" 
            value={attendanceSummary ? `${Math.round(attendanceSummary.rate)}%` : "0%"} 
            isLoading={isAttendanceSummaryLoading}
            info="Shows the overall attendance rate for the class across the current session. A low percentage may indicate systemic issues requiring teacher or administrative intervention."
          />
        </div>

        {/* Upcoming Exams */}
        <UpcomingExams exams={realUpcomingExams} />
      </div>
    </div>
  );
};

export default Overview;
