import StudentHero from './components/dashboard/StudentHero'
import InsightsGrid from './components/dashboard/InsightsGrid'
import Announcements from './components/dashboard/Announcements'
import FinancialSummaryCard from './components/dashboard/FinancialSummaryCard'
import UsageLimitsCard from '@/components/subscription/UsageLimitsCard';


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

            
            {/* Quick Helper Card */}
            <div className="p-8 rounded-[2rem] bg-slate-900 dark:bg-orange-600 shadow-2xl relative overflow-hidden group border border-white/10">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
               <h4 className="text-white text-xl font-black uppercase tracking-tight relative z-10">Need Assistance?</h4>
               <p className="text-white/70 text-[12px] font-medium mt-2 mb-6 relative z-10 leading-relaxed">Our support team is available 24/7 to help you with any questions regarding your child's education.</p>
               <button className="w-full py-3.5 rounded-2xl bg-white text-slate-900 font-black text-[11px] uppercase tracking-widest hover:bg-orange-50 transition-all relative z-10 shadow-xl active:scale-95">
                 Live Support Chat
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
