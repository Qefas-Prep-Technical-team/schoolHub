'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import UploadedFilesList from '../components/UploadedFilesList';
import CommentsSection from '../components/CommentsSection';
import SubmissionChecklist from '../components/SubmissionChecklist';
import ActionFooter from '../components/ActionFooter';
import { UploadedFile, ChecklistItem } from '../components/types';
import FilePreviewModal from '../components/FilePreviewModal';
import Breadcrumbs from '../components/Breadcrumbs';

// Mock data
const mockBreadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Assignments', href: '/assignments' },
  { label: 'Calculus I - Problem Set 3', href: '#', current: true },
];

const mockAssignment = {
  id: '1',
  title: 'Calculus I - Problem Set 3',
  dueDate: '2023-12-15T23:59:00',
  points: 100,
  instructor: 'Prof. David Miller',
  course: 'Calculus I',
  instructions: '#',
};

const mockChecklistItems: ChecklistItem[] = [
  { id: '1', label: 'At least one file is attached.', checked: true },
  { id: '2', label: 'I have read all the assignment instructions.', checked: false },
  { id: '3', label: 'My submission adheres to the academic integrity policy.', checked: true },
];

export default function SubmissionPage() {
    // Add state for preview modal
const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'final_problem_set_calculus.pdf',
      size: '12.8 MB',
      type: 'pdf',
      status: 'completed',
      progress: 100,
      url: '#',
    },
    {
      id: '2',
      name: 'graph_visualization.jpg',
      size: '2.1 MB',
      type: 'image',
      status: 'uploading',
      progress: 75,
      url: '#',
    },
  ]);
  
  const [comments, setComments] = useState('');
  const [checklistItems, setChecklistItems] = useState(mockChecklistItems);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const dueDate = new Date(mockAssignment.dueDate);
      const now = new Date();
      const diff = dueDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (files: File[]) => {
    files.forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file),
        status: 'uploading',
        progress: 0,
        file,
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      simulateUpload(newFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'completed', progress: 100 }
            : file
        ));

        // Update checklist
        setChecklistItems(prev => prev.map(item => 
          item.id === '1' ? { ...item, checked: true } : item
        ));
      } else {
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, progress } : file
        ));
      }
    }, 300);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Update checklist if no files left
    if (uploadedFiles.length === 1) {
      setChecklistItems(prev => prev.map(item => 
        item.id === '1' ? { ...item, checked: false } : item
      ));
    }
  };

//   const handlePreviewFile = (fileId: string) => {
//     const file = uploadedFiles.find(f => f.id === fileId);
//     if (file?.url) {
//       window.open(file.url, '_blank');
//     }
//   };

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklistItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, checked } : item)
    );
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const draftData = {
        files: uploadedFiles,
        comments,
        checklist: checklistItems,
        lastSaved: new Date().toISOString(),
      };
      
      localStorage.setItem(`assignment_draft_${assignmentId}`, JSON.stringify(draftData));
      
      console.log('Draft saved:', draftData);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate checklist
    const allChecked = checklistItems.every(item => item.checked);
    if (!allChecked) {
      alert('Please complete all checklist items before submitting.');
      return;
    }

    // Validate files
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file.');
      return;
    }

    const allUploaded = uploadedFiles.every(file => file.status === 'completed');
    if (!allUploaded) {
      alert('Please wait for all files to finish uploading.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        assignmentId,
        files: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
        comments,
        submittedAt: new Date().toISOString(),
      };
      
      console.log('Submission successful:', submissionData);
      
      // Clear draft
      localStorage.removeItem(`assignment_draft_${assignmentId}`);
      
      // Redirect to success page or assignment list
      router.push('/assignments?submitted=true');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  // Update handlePreviewFile function
const handlePreviewFile = (fileId: string) => {
  const file = uploadedFiles.find(f => f.id === fileId);
  if (file?.url) {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  }
};

  const getFileType = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['doc', 'docx'].includes(extension || '')) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    if (['mp4', 'avi', 'mov'].includes(extension || '')) return 'video';
    if (['zip', 'rar'].includes(extension || '')) return 'archive';
    return 'document';
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-12">
          <div className="layout-content-container flex w-full max-w-4xl flex-col gap-8">
            <Breadcrumbs items={mockBreadcrumbs} />
            
            <Header 
              assignment={mockAssignment}
              onViewInstructions={() => router.push(`/assignments/${assignmentId}`)}
            />
            
            {/* Submission Area */}
            <div className="flex flex-col gap-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-background-dark/50 p-6 shadow-sm">
              <h2 className="text-[#0e121b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                Submit Your Work
              </h2>
              
              <FileUploader
                onFileUpload={handleFileUpload}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                fileInputRef={fileInputRef}
              />
              
              {uploadedFiles.length > 0 && (
                <UploadedFilesList
                  files={uploadedFiles}
                  onRemove={handleRemoveFile}
                  onPreview={handlePreviewFile}
                />
              )}
            </div>
            
            <CommentsSection
              value={comments}
              onChange={setComments}
              placeholder="Type any notes for your teacher here..."
            />
            
            <SubmissionChecklist
              items={checklistItems}
              onChange={handleChecklistChange}
            />
          </div>
        </main>
      </div>
      
      <ActionFooter
        timeRemaining={timeRemaining}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSaving={isSaving}
        disabled={!checklistItems.every(item => item.checked) || uploadedFiles.length === 0}
      />
      <FilePreviewModal
      file={previewFile}
      isOpen={isPreviewOpen}
      onClose={() => {
        setIsPreviewOpen(false);
        setPreviewFile(null);
      }}
    />
    </div>
  );
}