import Breadcrumbs from "./components/Breadcrumbs";
import PerformanceChart from "./components/PerformanceChart";
import ProfileHeader from "./components/ProfileHeader";
import QuickActions from "./components/QuickActions";
import StatsGrid from "./components/StatsGrid";


export default function DashboardPage() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8">
      <Breadcrumbs />

      <ProfileHeader />

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Subject Breakdown</h3>
              <p className="text-blue-100 text-sm mb-4">
                View detailed analysis of performance across all subjects.
              </p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors w-full">
                View Subjects
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white opacity-10 rotate-12 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">library_books</span>
            </div>
          </div>

          <QuickActions />
        </div>
      </div>
    </main>
  );
}