import Breadcrumbs from "./components/Breadcrumbs";
import PerformanceChart from "./components/PerformanceChart";
import ProfileHeader from "./components/ProfileHeader";
import QuickActions from "./components/QuickActions";
import StatsGrid from "./components/StatsGrid";
import SubjectPerformanceList from "./components/SubjectPerformanceList";
import Link from 'next/link';
import { ArrowRight, BarChart3, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  return (
    <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-5 sm:space-y-6 md:space-y-8 font-sans animate-in fade-in duration-500">
      {/* Breadcrumb Navigation & Live Telemetry Pill */}
      <Breadcrumbs />

      {/* Student Profile Hero Banner */}
      <ProfileHeader />

      {/* 4-Metric Key Performance KPI Grid */}
      <StatsGrid />

      {/* Interactive Trend Chart + Subject Quick Banner & Portals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-stretch">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 justify-between">
          {/* Subject Analysis Callout Card */}
          <div className="group bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 p-5 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl shadow-lg shadow-orange-600/20 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-3 backdrop-blur-xs">
                <Sparkles className="w-3 h-3" />
                <span>Deep Curriculum Analysis</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mb-1.5 uppercase tracking-tight">
                Subject Breakdown
              </h3>
              <p className="text-orange-50 text-xs font-medium leading-relaxed mb-5 opacity-90">
                Detailed topic-by-topic performance metrics and syllabus mastery for all registered subjects.
              </p>
              <Link href="/dashboard/parent/performance/subject-performance" className="block">
                <button 
                  type="button"
                  className="bg-white text-orange-600 px-5 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-50 transition-all w-full shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  <span>View Full Breakdown</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            </div>
            
            {/* Ambient Background Graphic */}
            <div className="absolute -bottom-6 -right-6 text-white/10 -rotate-12 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0">
              <BarChart3 className="w-44 h-44" />
            </div>
          </div>

          {/* Quick Portals & Shortcuts */}
          <QuickActions />
        </div>
      </div>

      {/* Enrolled Subjects Mastery Breakdown (Responsive Grid / List Perspective) */}
      <section className="pt-2">
        <SubjectPerformanceList />
      </section>
    </main>
  );
}
