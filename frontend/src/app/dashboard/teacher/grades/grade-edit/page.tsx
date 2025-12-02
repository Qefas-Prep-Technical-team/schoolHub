'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentScore, GradeSummary, ScoreHistoryT, Student, Teacher } from './components/types';
import BackButton from './components/BackButton';
import StudentInfoCard from './components/StudentInfoCard';
import AssessmentBreakdown from './components/AssessmentBreakdown';
import TeacherFeedback from './components/TeacherFeedback';
import ScoreHistory from './components/ScoreHistory';
import FormActions from './components/FormActions';
import SuccessModal from './components/SuccessModal';


// Mock data
const teacher: Teacher = {
  id: '1',
  name: 'Mr. Harrison',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHdQXFaZWwcULd2CKZgF4n0PQyPknFNoc2oonkfcWlWgfZG1SuSx7rJXbLXcbeedDz_hPSstLw1tXf7NhbbSy0W93ahMd8GaIRASupKZ0ztdbx9vLiVkwdyVi-bGP1ejxVhRoyXm6c0gL9N_dfxW2Sfy3g1kJGQuipkp8OG0vSUESVM_NIHfiA-pw9J76osapJLoUwdcNwjR__9CHdijXZoo8L1gOb3vcfP71YzzK99fzpXmU_6xpKff-3k8pTVGvyNS-OoL4rE7Q',
};

const student: Student = {
  id: '1',
  name: 'Olivia Chen',
  admissionNumber: 'S-2041',
  className: 'Grade 10-A',
  subject: 'Mathematics',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoJIFEsNHzQKhSvENfE4AC-3X5e-j0jqOi-NWuNBZB7RsgJOjigaK77c0IGNViB2gbHRBJBkEz7nHbHiZ3iZxvd_UMgzq9C10PL9OlnTufPhw51V69aIds63D_tGwTCT__I9kJfeXSgsjNWrfw9G-NNKhYv5b2Rr3SRYBBiKx4jnnMwCpG_wfi_Wi_3wlTxzF0btxr_HK358mDLdpd-DEQfYbRU1Jt1DA5lD8kO0wAgTDz-XlQAY6syQrfvDlQMJZUnkrH5qv6C3g',
  overallGrade: 'A',
  overallPerformance: 'Excellent',
};

const initialScores: AssessmentScore[] = [
  {
    component: 'classwork',
    label: 'Classwork',
    maxScore: 20,
    score: 18,
    oldScore: 16,
    percentage: 90,
  },
  {
    component: 'assignment',
    label: 'Assignment',
    maxScore: 50,
    score: 45,
    oldScore: 40,
    percentage: 90,
  },
  {
    component: 'exam',
    label: 'Exam',
    maxScore: 100,
    score: 88,
    oldScore: 85,
    percentage: 88,
  },
];

const scoreHistory: ScoreHistoryT[] = [
  { component: 'Classwork', oldScore: '16/20', newScore: '18/20' },
  { component: 'Assignment', oldScore: '40/50', newScore: '45/50' },
  { component: 'Exam', oldScore: '85/100', newScore: '88/100' },
];

export default function EditStudentGradePage() {
  const router = useRouter();
  const [scores, setScores] = useState<AssessmentScore[]>(initialScores);
  const [comment, setComment] = useState('');
  const [notifyParent, setNotifyParent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const calculateGradeSummary = (): GradeSummary => {
    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const totalMaxScore = scores.reduce((sum, score) => sum + score.maxScore, 0);
    const percentage = (totalScore / totalMaxScore) * 100;

    let finalGrade = 'F';
    let performance = 'Needs Improvement';

    if (percentage >= 90) {
      finalGrade = 'A';
      performance = 'Excellent';
    } else if (percentage >= 80) {
      finalGrade = 'B';
      performance = 'Good';
    } else if (percentage >= 70) {
      finalGrade = 'C';
      performance = 'Average';
    } else if (percentage >= 60) {
      finalGrade = 'D';
      performance = 'Below Average';
    }

    return {
      totalScore,
      totalMaxScore,
      finalGrade,
      performance,
    };
  };

  const gradeSummary = calculateGradeSummary();

  const handleScoreChange = (component: AssessmentScore['component'], value: number) => {
    setScores(prev =>
      prev.map(score =>
        score.component === component
          ? {
              ...score,
              score: value,
              percentage: (value / score.maxScore) * 100,
            }
          : score
      )
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving grade data:', {
        scores,
        comment,
        notifyParent,
        gradeSummary,
      });

      setShowSuccessModal(true);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirm) return;
    }
    router.back();
  };

  const handleBack = () => {
    handleCancel();
  };

  return (
  
     <>
     <main className="px-6 lg:px-10 py-8 pb-28">
        <div className="layout-content-container flex flex-col max-w-7xl mx-auto flex-1">
          {/* Page Header */}
          <div className="mb-6">
            <BackButton onClick={handleBack} />
            <div>
              <h1 className="text-slate-900 dark:text-slate-50 text-3xl lg:text-4xl font-black leading-tight tracking-[-0.033em]">
                Edit Student Grade
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                <span>Dashboard</span>
                <span className="mx-1">→</span>
                <span>Grades</span>
                <span className="mx-1">→</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Edit Score
                </span>
              </p>
            </div>
          </div>

          {/* Student Info Card */}
          <StudentInfoCard student={student} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
            {/* Left Column - Assessment and Feedback */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <AssessmentBreakdown
                scores={scores}
                onScoreChange={handleScoreChange}
                gradeSummary={gradeSummary}
              />
              
              <TeacherFeedback
                comment={comment}
                onCommentChange={setComment}
                notifyParent={notifyParent}
                onNotifyParentChange={setNotifyParent}
              />
            </div>

            {/* Right Column - Score History */}
            <div className="lg:col-span-1">
              <ScoreHistory history={scoreHistory} />
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Action Buttons */}
      <FormActions
        onCancel={handleCancel}
        onSave={handleSave}
        isSaving={isSaving}
        isDirty={isDirty}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        student={student}
        gradeSummary={gradeSummary}
        parentNotified={notifyParent}
      />
</>
  );
}