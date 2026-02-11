
import PageHeading from './components/PageHeading';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import SuggestedImprovements from './components/SuggestedImprovements';
import { stats, deadlines, improvementTips } from './components/data';

export default function Home() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col">
      <div className="flex flex-1">
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <PageHeading />
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PerformanceChart />
                <UpcomingDeadlines deadlines={deadlines} />
              </div>
              <div className="lg:col-span-1">
                <SuggestedImprovements tips={improvementTips} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}