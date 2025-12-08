// src/app/page.tsx
import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import ExamHeader from '../components/ExamHeader';
import StatCard from '../components/StatCard';
import ExamSchedule from '../components/ExamSchedule';
import InstructionsList from '../components/InstructionsList';
import TechnicalRequirements from '../components/TechnicalRequirements';
import ExamProgress from '../components/ExamProgress';

export default function Home() {
  const examStats = [
    { label: 'Total Questions', value: '50' },
    { label: 'Total Score', value: '100 Marks' },
    { label: 'Difficulty', value: 'Medium' },
    { label: 'Exam Type', value: 'Objective' },
    { label: 'Time Limit', value: '90 Minutes' },
    { label: 'Attempts', value: '1' },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            <Breadcrumbs />
            <ExamHeader />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {examStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <ExamSchedule />

            {/* Instructions and Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InstructionsList />
              <TechnicalRequirements />
            </div>

            <ExamProgress />
          </div>
        </main>
      </div>
    </div>
  );
}