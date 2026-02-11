'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GradingFormData, Submission } from '../components/types';
import PDFPreview from '../components/ui/PDFPreview';
import StudentInfoCard from '../components/StudentInfoCard';
import GradingForm from '../components/GradingForm';
import ActionBar from '../components/ActionBar';


// Mock data - in a real app, fetch from API
const mockSubmission: Submission = {
  id: 'sub123',
  student: {
    id: 'stu789',
    name: 'Amelia Rodriguez',
    studentId: '789123',
    grade: 'Grade 10',
    subject: 'Biology',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/png?seed=Amelia', 
    submittedAt: 'Oct 26, 2:15 PM'
  },
  assignment: {
    id: 'asgn456',
    title: 'Physics 101: Gravity Lab Report - Grading',
    subject: 'Physics',
    dueDate: 'October 28, 2023, 11:59 PM',
    maxScore: 100,
    description: 'Lab report on gravity experiments'
  },
  fileUrl: '/files/lab-report.pdf',
  previewUrl: 'https://api.dicebear.com/7.x/initials/png?seed=LabReport', 
  submittedAt: '2023-10-26T14:15:00',
  status: 'submitted',
  score: 85,
  feedback: 'Good analysis, but needs more detailed methodology section.',
  allowResubmission: true,
  notifyParent: true
};


export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<GradingFormData>({
    score: 0,
    feedback: '',
    allowResubmission: false,
    notifyParent: false
  });

  useEffect(() => {
    const fetchSubmission = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from API
        // const response = await fetch(`/api/assignments/${params.id}/submissions/${params.submissionId}`);
        // const data = await response.json();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSubmission(mockSubmission);
        if (mockSubmission.score !== undefined) {
          setFormData({
            score: mockSubmission.score,
            feedback: mockSubmission.feedback || '',
            allowResubmission: mockSubmission.allowResubmission || false,
            notifyParent: mockSubmission.notifyParent || false
          });
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [params.id, params.submissionId]);

  const handleSaveGrade = async (data: GradingFormData) => {
    setIsSaving(true);
    try {
      // Save to API
      const response = await fetch(`/api/assignments/${params.id}/submissions/${params.submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save grade');
      }

      // Redirect back to assignment page
      router.push(`/assignments/${params.id}`);
      router.refresh(); // Refresh page data
      
    } catch (error) {
      console.error('Error saving grade:', error);
      alert('Failed to save grade. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadFile = () => {
    // Implement file download logic
    console.log('Downloading file:', submission?.fileUrl);
    // In a real app, trigger file download
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">
            error
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Submission Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The submission you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Heading */}
          <div className="mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {submission.assignment.title}
                </h1>
                <p className="text-base text-slate-500 dark:text-slate-400">
                  Due: {submission.assignment.dueDate}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Assignment ID: {submission.assignment.id}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">•</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Submission ID: {submission.id}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Left Column: Submission Preview */}
            <div className="lg:col-span-3">
              <PDFPreview
                previewUrl={submission.previewUrl}
                fileUrl={submission.fileUrl}
                fileName={`${submission.student.name}_lab_report.pdf`}
                onDownload={handleDownloadFile}
              />
            </div>

            {/* Right Column: Grading Panel */}
            <div className="lg:col-span-2">
              <div className="sticky top-8 flex flex-col gap-6">
                <StudentInfoCard student={submission.student} />
                
                <GradingForm
                  assignment={submission.assignment}
                  initialData={formData}
                  onSubmit={handleSaveGrade}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ActionBar
        onCancel={handleCancel}
        onSave={() => handleSaveGrade(formData)}
        isLoading={isSaving}
        isValid={formData.score >= 0 && formData.score <= submission.assignment.maxScore}
      />
    </div>
  );
}