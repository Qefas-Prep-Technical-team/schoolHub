'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ExamPaperRedirect() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;

  useEffect(() => {
    if (examId) {
      router.replace(`/dashboard/teacher/exams&quizzes/${examId}/papers`);
    }
  }, [examId, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>
  );
}
