'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import SuccessMessage from '../components/SuccessMessage';
import SubmissionDetails from '../components/SubmissionDetails';
import SubmittedFiles from '../components/SubmittedFiles';
import ActionButtons from '../components/ActionButtons';
import { Submission, SubmittedFile, BreadcrumbItem } from '../components/types';
import FeedbackSection from '../components/FeedbackSection';
import CountdownTimer from '../components/CountdownTimer';

// Mock data
const mockSubmission: Submission = {
  id: '1',
  assignment: 'Lab Report 1: The Laws of Motion',
  course: 'Introduction to Physics',
  submittedAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
  status: 'awaiting_grade',
  points: 100,
  dueDate:  new Date(Date.now() + 1000 * 60 * 5).toISOString()
};

const mockSubmittedFiles: SubmittedFile[] = [
  {
    id: '1',
    name: 'Newton_Laws_Report_Final.pdf',
    size: '1.2 MB',
    type: 'pdf',
    iconColor: 'red',
    url: '#',
  },
  {
    id: '2',
    name: 'Lab_Data_Analysis.docx',
    size: '876 KB',
    type: 'document',
    iconColor: 'blue',
    url: '#',
  },
];

const mockBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Courses', href: '/courses' },
  { label: 'Introduction to Physics', href: '/courses/physics-101' },
  { label: 'Assignments', href: '/courses/physics-101/assignments' },
  { label: 'Lab Report 1 Submission', href: '#', current: true },
];

export default function SubmissionConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;
  
  const [submission, setSubmission] = useState<Submission>(mockSubmission);
  const [files, setFiles] = useState<SubmittedFile[]>(mockSubmittedFiles);
  const [isLoading, setIsLoading] = useState(true);
  const [timeUntilDue, setTimeUntilDue] = useState('');

  useEffect(() => {
    // Fetch submission data
    const fetchSubmissionData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        // In real app, fetch data based on submissionId
        console.log('Fetching submission:', submissionId);
      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissionData();
  }, [submissionId]);

  useEffect(() => {
    // Calculate time until due
    const calculateTimeUntilDue = () => {
      const dueDate = new Date(submission.dueDate);
      const now = new Date();
      const diff = dueDate.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setTimeUntilDue(`${days} day${days !== 1 ? 's' : ''} remaining`);
        } else if (hours > 0) {
          setTimeUntilDue(`${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`);
        } else {
          setTimeUntilDue(`${minutes} minute${minutes !== 1 ? 's' : ''} remaining`);
        }
      } else {
        setTimeUntilDue('Assignment is now closed');
      }
    };

    calculateTimeUntilDue();
    const timer = setInterval(calculateTimeUntilDue, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [submission.dueDate]);

  const handleBackToAssignments = () => {
    router.push('/assignments');
  };

  const handleResubmit = () => {
    router.push(`/submit/${submission.id}`);
  };

  const handleViewSubmission = () => {
    router.push(`/submission/${submission.id}`);
  };

  const handleDownloadFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.url) {
      window.open(file.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Header />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
              <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <Header />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <Breadcrumbs items={mockBreadcrumbs} />
          <CountdownTimer dueDate={submission.dueDate} />
          
            
          
          <div className="bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
            <SuccessMessage 
              status={submission.status}
              title="Submission Successful!"
              message="Your files have been submitted successfully and are now awaiting grading. You will be notified once your grade is available."
            />
            
            <div className="w-full max-w-2xl border-t border-gray-200 dark:border-white/10 pt-8">
              <SubmissionDetails submission={submission} />
              
              <SubmittedFiles 
                files={files}
                onDownload={handleDownloadFile}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full">
              <ActionButtons
                onBackToAssignments={handleBackToAssignments}
                onResubmit={handleResubmit}
                onViewSubmission={handleViewSubmission}
                timeUntilDue={timeUntilDue}
                submission={submission}
              />
            </div>
          </div>
        </div>
        <FeedbackSection submission={submission} />
      </main>
    </div>
  );
}