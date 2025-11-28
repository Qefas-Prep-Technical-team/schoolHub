
"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from './components/Header';
import ExamHeader from './components/ExamHeader';
import InstructionsCard from './components/InstructionsCard';
import QuestionList from './components/QuestionList';
import Sidebar from './components/Sidebar';



const mockExamData = {
  id: '1',
  title: 'Mid-Term Physics Examination',
  subject: 'Physics',
  className: '10-B',
  duration: 90,
  totalMarks: 100,
  status: 'draft' as const,
  type: 'cbt' as const,
  assignedTeacher: 'Dr. Aris',
  instructions: [
    'Allowed Attempts: <strong>1</strong>.',
    'Negative Marking: <strong class="text-red-500">Yes (-0.25 for wrong answers)</strong>.',
    'Allowed Devices: <strong>Desktop Only</strong>.',
    'Ensure you have a stable internet connection before starting.'
  ],
  questions: [
    {
      id: '1',
      number: 1,
      type: 'multiple_choice' as const,
      question: 'What is the SI unit of force?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      correctAnswer: 'B',
      marks: 5,
      difficulty: 'easy' as const,
      topic: 'Mechanics'
    },
    {
      id: '2',
      number: 2,
      type: 'true_false' as const,
      question: 'The acceleration due to gravity on Earth is approximately 12.2 m/s².',
      options: ['True', 'False'],
      correctAnswer: 'False',
      marks: 2,
      difficulty: 'easy' as const,
      topic: 'Gravity'
    },
    {
      id: '3',
      number: 3,
      type: 'essay' as const,
      question: 'Explain Newton\'s First Law of Motion and provide a real-world example.',
      marks: 10,
      difficulty: 'medium' as const,
      topic: 'Laws of Motion'
    }
  ],
  statistics: {
    totalQuestions: 25,
    multipleChoice: 15,
    trueFalse: 5,
    essayQuestions: 5,
    totalPoints: 100,
    estimatedTime: 90
  }
};

export default function ExamPreview() {
  const router = useRouter();
  const id = "566"
  const [showAnswers, setShowAnswers] = useState(false);

  const handleEdit = () => {
    router.push(`/exams/${id}/edit`);
  };

  const handleDownload = () => {
    console.log('Download exam');
    // Implement download logic
  };

  const handleShare = () => {
    console.log('Share exam');
    // Implement share logic
  };

  const handlePublish = () => {
    console.log('Publish exam');
    // Implement publish logic
  };

  const handleEditQuestion = (questionId: number) => {
    console.log('Edit question:', questionId);
    // Navigate to question editor
  };

  if (!id) {
    return <div>Loading...</div>;
  }

  function handlePreview(): void {
    const examId = Array.isArray(id) ? id[0] : id;
    if (!examId) return;

    const previewUrl = `/exams/${examId}/preview`;

    try {
      if (typeof window !== 'undefined') {
        // Open preview in a new tab for a quick glance without navigating away
        window.open(previewUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback for environments without window (SSR/testing)
        router.push(previewUrl);
      }
    } catch (error) {
      console.error('Failed to open exam preview:', error);
      // Always try to navigate as a fallback
      router.push(previewUrl);
    }
  }

  return (
    <>
      <Header
        onEdit={handleEdit}
        onDownload={handleDownload}
        onShare={handleShare}
        onPublish={handlePublish}
        onPreview={handlePreview}
      />

      <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
        <div className="layout-content-container grid grid-cols-12 gap-8 w-full max-w-screen-xl">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <ExamHeader exam={mockExamData} />

            <InstructionsCard instructions={mockExamData.instructions} />

            <h2 className="text-gray-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-0 pt-5">
              Question List Preview
            </h2>

            <QuestionList
              questions={mockExamData.questions}
              onEditQuestion={handleEditQuestion}
              showAnswers={showAnswers}
            />
          </div>

          {/* Sidebar */}
          <Sidebar
            statistics={mockExamData.statistics}
            totalQuestions={mockExamData.statistics.totalQuestions}
            showAnswers={showAnswers}
            onToggleAnswers={setShowAnswers}
          />
        </div>
      </main>
    </>
  );
}