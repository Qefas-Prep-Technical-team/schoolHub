'use client';

import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import AssessmentTable from '../components/AssessmentTable';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { subjectInfo, terms, assessments } from '../components/data';

export default function Home() {
  const [selectedTerm, setSelectedTerm] = useState(terms[0]);

  const handleTermChange = (term: { id: string; label: string }) => {
    setSelectedTerm(term);
    // Here you would typically fetch data for the selected term
    console.log('Selected term:', term);
  };

  // Filter assessments by term if needed
  const filteredAssessments = assessments; // In a real app, filter by selectedTerm

  return (
    <div className="relative flex min-h-screen w-full">
     
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <PageHeader
            subject={subjectInfo}
            terms={terms}
            onTermChange={handleTermChange}
          />
          
          <AssessmentTable assessments={filteredAssessments} />
          
          <AnalyticsCharts />
        </div>
      </main>
    </div>
  );
}