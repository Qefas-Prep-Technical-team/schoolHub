import StudentHero from './components/dashboard/StudentHero'
import InsightsGrid from './components/dashboard/InsightsGrid'
import Announcements from './components/dashboard/Announcements'
import FinancialSummaryCard from './components/dashboard/FinancialSummaryCard'
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';
import RecentPerformanceChart from './components/dashboard/RecentPerformanceChart';


export default function Home() {
  return (
    <div className="p-4 md:p-0">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-10">
        {/* Top Section: Student Profile Hero */}
        <StudentHero />
        
        {/* Middle Section: Analytics & Insights */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Academic Insights</h2>
              <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest mt-1">Real-time performance monitoring</p>
            </div>
            <button className="px-6 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-orange-500/30 hover:text-orange-600 transition-all shadow-sm">
                View All Metrics
            </button>
          </div>
          <InsightsGrid />
          <RecentPerformanceChart />
        </div>
        
        {/* Bottom Section: Feed & Financials */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="flex flex-col gap-2 px-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">School Activity</h2>
              <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest">Latest updates and event feed</p>
            </div>
            <Announcements />
          </div>
          
          <div className="xl:col-span-1 space-y-8">
             <div className="flex flex-col gap-2 px-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Status</h2>
              <p className="text-[11px] text-orange-500 font-bold uppercase tracking-widest">Fee management & receipts</p>
            </div>
             <FinancialSummaryCard />
             <UsageLimitsCard 
                role="PARENT"
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
