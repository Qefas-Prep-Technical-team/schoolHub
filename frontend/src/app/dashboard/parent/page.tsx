import StudentHero from './components/dashboard/StudentHero'
import InsightsGrid from './components/dashboard/InsightsGrid'
import Announcements from './components/dashboard/Announcements'
import FinancialSummaryCard from './components/dashboard/FinancialSummaryCard'
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';
import RecentPerformanceChart from './components/dashboard/RecentPerformanceChart';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { HeaderTooltip } from './components/dashboard/HeaderTooltip';

export default function Home() {
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      {/* Top Section: Student Profile Hero */}
      <StudentHero />
      
      {/* Middle Section: Analytics & Insights */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 sm:px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Academic Insights
              </h2>
              <HeaderTooltip content="Aggregated overview of your child's attendance consistency, overall GPA/average scores, scheduled assessments, and recent continuous assessment grades." />
            </div>
            <p className="text-[10px] sm:text-[11px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
              Real-time performance monitoring
            </p>
          </div>
          <Link 
            href="/dashboard/parent/performance" 
            className="w-fit px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm flex items-center gap-1.5 active:scale-[0.99]"
          >
            <span>View All Metrics</span>
            <ChevronRight size={13} />
          </Link>
        </div>
        <InsightsGrid />
        <RecentPerformanceChart />
      </div>
      
      {/* Bottom Section: Feed & Financials */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 items-start">
        <div className="xl:col-span-2 space-y-4 sm:space-y-6 flex flex-col w-full">
          <div className="flex items-center justify-between px-1 sm:px-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  School Activity
                </h2>
                <HeaderTooltip content="Direct feed of classroom updates, event announcements, and institutional notifications for your student." />
              </div>
              <p className="text-[10px] sm:text-[11px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
                Latest updates & announcements
              </p>
            </div>
          </div>
          <Announcements />
        </div>
        
        <div className="xl:col-span-1 space-y-4 sm:space-y-6 flex flex-col w-full">
          <div className="flex items-center justify-between px-1 sm:px-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Financial Status
                </h2>
                <HeaderTooltip content="Monitor fee schedules, payment clearances, family subscription allowances, and transaction status." />
              </div>
              <p className="text-[10px] sm:text-[11px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
                Fee management & family limits
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <FinancialSummaryCard />
            <UsageLimitsCard 
              role="PARENT"
              primaryColor="#f97316"
              title="Family Management"
              description="Managing your student accounts and educational capacity."
              upgradeLink="/dashboard/parent/billing"
              upgradeLabel="Manage Family Plan"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
