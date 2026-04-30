import Breadcrumbs from "./components/Breadcrumbs";
import PerformanceChart from "./components/PerformanceChart";
import ProfileHeader from "./components/ProfileHeader";
import QuickActions from "./components/QuickActions";
import StatsGrid from "./components/StatsGrid";
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8 space-y-8">
      <Breadcrumbs />

      <ProfileHeader />

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>

        <div className="flex flex-col gap-6">
          <div className="group bg-orange-600 p-8 rounded-[2rem] shadow-xl shadow-orange-600/20 relative overflow-hidden transition-all duration-500 hover:-translate-y-1">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Subject Analysis</h3>
              <p className="text-orange-100 text-[12px] font-bold uppercase tracking-widest mb-6 opacity-80 leading-relaxed">
                Detailed performance breakdown across all registered subjects.
              </p>
              <Link href="/dashboard/parent/performance/subject-performance" className="block">
                <button className="bg-white text-orange-600 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all w-full shadow-lg active:scale-95">
                  View Full Breakdown
                </button>
              </Link>
            </div>
            <div className="absolute -bottom-6 -right-6 text-white opacity-10 -rotate-12 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0">
              <span className="material-symbols-outlined text-[140px]">analytics</span>
            </div>
          </div>

          <QuickActions />
        </div>
      </div>
    </main>
  );
}

