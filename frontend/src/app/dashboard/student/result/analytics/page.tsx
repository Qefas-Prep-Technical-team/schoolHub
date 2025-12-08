'use client';

import { useState } from 'react';
import PageHeader from './components/PageHeader';
import TermFilters from './components/TermFilters';
import StatsCards from './components/StatsCards';
import PerformanceChart from './components/PerformanceChart';
import StrengthsWeaknesses from './components/StrengthsWeaknesses';
import ImprovementGoals from './components/ImprovementGoals';
import ClassComparison from './components/ClassComparison';
import {
  termFilters,
  stats,
  strengths,
  weaknesses,
  goals,
  comparisonSubjects
} from './components/data';


export default function Home() {
  const [selectedTerm, setSelectedTerm] = useState(termFilters[1]);

  const handleTermChange = (term: { id: string; label: string }) => {
    setSelectedTerm(term);
    // Here you would fetch data for the selected term
    console.log('Selected term:', term);
  };

  return (
    <div className="relative flex min-h-screen w-full">

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <PageHeader />
          <TermFilters terms={termFilters} onTermChange={handleTermChange} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards stats={stats} />
            <PerformanceChart />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 lg:col-span-3 gap-6">
              <StrengthsWeaknesses
                title="Strengths"
                icon="emoji_events"
                iconBgColor="bg-green-100 dark:bg-green-900/50"
                iconColor="text-green-600 dark:text-green-400"
                subjects={strengths}
              />

              <StrengthsWeaknesses
                title="Areas for Improvement"
                icon="track_changes"
                iconBgColor="bg-amber-100 dark:bg-amber-900/50"
                iconColor="text-amber-600 dark:text-amber-400"
                subjects={weaknesses}
              />

              <ImprovementGoals goals={goals} />
            </div>

            <ClassComparison subjects={comparisonSubjects} />
          </div>
        </div>
      </main>
    </div>
  );
}