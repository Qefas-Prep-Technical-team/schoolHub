/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PerformanceChart from "./PerformanceChart";
import BehaviourAlert from "./BehaviourAlert";
import StatsCard from "./StatsCard";
import UpcomingExams from "./UpcomingExams";

interface OverviewProps {
  behaviourAlerts: any[];
  upcomingExams: any[];
}

const Overview: React.FC<OverviewProps> = ({ behaviourAlerts, upcomingExams }) => {
  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        {/* Performance Chart */}
        <PerformanceChart />

        {/* Behaviour Alerts */}
        <BehaviourAlert alerts={behaviourAlerts} />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
          <StatsCard title="Class Average Score" value="85%" />
          <StatsCard title="Attendance Summary" value="96%" />
        </div>

        {/* Upcoming Exams */}
        <UpcomingExams exams={upcomingExams} />
      </div>
    </div>
  );
};

export default Overview;
