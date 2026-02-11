
import Breadcrumbs from '../components/Breadcrumbs';
import AssignmentHeader from '../components/AssignmentHeader';
import GradeStats from '../components/GradeStats';
import FeedbackCard from '../components/FeedbackCard';
import StrengthsImprovements from '../components/StrengthsImprovements';
import RubricTable from '../components/RubricTable';
import PerformanceChart from '../components/PerformanceChart';

export default function Home() {
  const breadcrumbItems = [
    { label: 'Dashboard', href: '#' },
    { label: 'English 101', href: '#' },
    { label: 'Assignments', href: '#' },
    { label: 'The Great Gatsby Analysis' },
  ];

  const gradeStats = [
    { label: 'Final Score', value: '92/100' },
    { label: 'Grade', value: 'A-', color: 'text-[#333333] dark:text-white' },
    { label: 'Class Average', value: '85/100', color: 'text-[#333333] dark:text-white' },
  ];

  const feedback = `Excellent work on analyzing the symbolism of the green light. Your thesis was strong and well-supported throughout the essay. You effectively integrated quotes to back up your claims.

For future assignments, focus on expanding your conclusion to not only summarize but also to touch upon the broader implications of your analysis. Also, double-check your citations for MLA formatting consistency. Overall, a very solid and insightful paper.`;

  const rubricItems = [
    {
      criteria: 'Thesis Statement & Argument',
      score: '28 / 30',
      comments: 'Very clear and focused thesis. Well done.',
    },
    {
      criteria: 'Analysis & Evidence',
      score: '29 / 30',
      comments: 'Excellent use of textual evidence.',
    },
    {
      criteria: 'Organization & Structure',
      score: '20 / 20',
      comments: 'Logical flow, smooth transitions.',
    },
    {
      criteria: 'Grammar & Mechanics',
      score: '15 / 20',
      comments: 'A few minor typos and citation errors.',
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col">
     
      <main className="flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 md:px-8">
        <div className="w-full max-w-5xl">
          <Breadcrumbs items={breadcrumbItems} />
          <AssignmentHeader
            title="Essay 1: The Great Gatsby Analysis"
            submittedDate={new Date('2023-10-26')}
            gradedDate={new Date('2023-11-02')}
            status="graded"
          />
          <GradeStats stats={gradeStats} />
          <div className="space-y-8">
            <FeedbackCard feedback={feedback} />
            <StrengthsImprovements />
            <RubricTable items={rubricItems} total="92 / 100" />
            <PerformanceChart />
          </div>
        </div>
      </main>
    </div>
  );
}