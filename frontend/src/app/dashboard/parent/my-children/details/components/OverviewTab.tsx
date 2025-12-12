"use client";

import UpcomingAssignments from "./UpcomingAssignments";
import AcademicProgress from "./AcademicProgress";
import RecentGrades from "./RecentGrades";
import TeacherContact from "./TeacherContact";
import NoticeBanner from "./NoticeBanner";

export default function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <UpcomingAssignments />
        <AcademicProgress />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        <RecentGrades />
        <TeacherContact />
        <NoticeBanner />
      </div>
    </div>
  );
}
