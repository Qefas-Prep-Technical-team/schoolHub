import ActivityFeed from "./components/dashboard/ActivityFeed";
import Announcements from "./components/dashboard/Announcements";
import EnrollmentChart from "./components/dashboard/EnrollmentChart";
import FinanceOverview from "./components/dashboard/FinanceOverview";
import OverviewHeader from "./components/dashboard/OverviewHeader";
import PerformanceChart from "./components/dashboard/PerformanceChart";
import StatCard from "./components/dashboard/StatCard";


export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <OverviewHeader />

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Students" value="1,250" change="+1.5% this month" />
                <StatCard title="Total Teachers" value="74" change="+2 new hires" />
                <StatCard title="Active Classes" value="48" change="All classes running" />
                <StatCard title="Attendance Rate" value="92.5%" change="-0.2% from yesterday" negative />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <EnrollmentChart />
                <PerformanceChart />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="space-y-4">
                    <FinanceOverview />
                    <Announcements />
                </div>
                <div className="xl:col-span-2">
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}
