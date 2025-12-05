'use client';

import { useState } from 'react';
import Breadcrumbs from './components/Breadcrumbs';
import PageHeader from './components/PageHeader';
import StatsCards from './components/StatsCards';
import RubricBreakdown from './components/RubricBreakdown';
import TeacherFeedback from './components/TeacherFeedback';
import Attachments from './components/Attachments';
import StrengthsWeaknesses from './components/StrengthsWeaknesses';
import {
  breadcrumbs,
  assessmentInfo,
  stats,
  rubricItems,
  teacherFeedback,
  attachments,
  strengths,
  improvements,
} from './components/data';

export default function Home() {
  const [showCorrectedAnswers, setShowCorrectedAnswers] = useState(false);

  const handleViewAnswers = () => {
    setShowCorrectedAnswers(!showCorrectedAnswers);
    // In a real app, you would fetch or show the corrected answers
    alert('Showing corrected answers...');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col">
      <div className="flex h-full min-h-screen">
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-4xl">
            <Breadcrumbs items={breadcrumbs} />
            <PageHeader
              title={assessmentInfo.title}
              submittedDate={assessmentInfo.submittedDate}
              teacher={assessmentInfo.teacher}
              onViewAnswers={handleViewAnswers}
            />
            <StatsCards stats={stats} />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 flex flex-col gap-8">
                <RubricBreakdown items={rubricItems} />
                <TeacherFeedback feedback={teacherFeedback} />
                <Attachments attachments={attachments} />
              </div>
              <div className="lg:col-span-1">
                <StrengthsWeaknesses
                  strengths={strengths}
                  improvements={improvements}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}