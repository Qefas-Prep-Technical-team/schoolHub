'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import InstructionsPanel from './components/InstructionsPanel';
import AttachmentsPanel from './components/AttachmentsPanel';
import RubricPanel from './components/RubricPanel';
import MaterialsPanel from './components/MaterialsPanel';
import ActionFooter from './components/ActionFooter';
import { Assignment, Attachment, RubricItem, Material } from './components/types';
import SubmissionModal from './components/SubmissionModal';

// Mock data
const mockAssignment: Assignment = {
  id: '1',
  title: 'Mid-Term Essay: The Symbolism in The Great Gatsby',
  subject: 'English 101',
  instructor: {
    name: 'Ms. Eleanor Vance',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpvZ6Nqx2HFUIYnbU5GbaG6BM9JWASzFfvsIRMbEhB7m61yFmXKwIjUr2UbppkpiCZm50WGblRILhBdU0Nmufdefhtg-2CvFOpSqDpPayC7TPR9I5hm9GPwbY5-ObyR5DU6u9PC8_Y6Idv0XWBl_Oh5VycNrgWOaM5z-YqqCGfpOrDmFqp5CTu2Vz5n0TK2zrJgj7cBShHKbk9I6w44X3RGXPL_oh2vSgsAGNtS7JeG6SVK-m7salJc9_xKfjQUOeN9RBlmNbWVl4',
  },
  status: 'not_started',
  dueDate: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // 24 hours from now
  description: 'Analyze the use of symbolism in F. Scott Fitzgerald\'s novel, "The Great Gatsby."',
  instructions: {
    objective: 'The purpose of this essay is to analyze the use of symbolism in F. Scott Fitzgerald\'s novel, "The Great Gatsby." Students should identify key symbols, explain their significance, and argue how they contribute to the novel\'s major themes, such as the American Dream, wealth, and the past.',
    requirements: [
      { label: 'Length', value: '1,200 - 1,500 words' },
      { label: 'Format', value: 'MLA 9th Edition. Double-spaced, 12-point Times New Roman font' },
      { label: 'Sources', value: 'Minimum of three credible academic sources must be cited. The novel itself does not count as one of these sources' },
      { label: 'Thesis Statement', value: 'Your essay must have a clear, arguable thesis statement in the introductory paragraph' },
    ],
    guidingQuestions: [
      'The Green Light at the end of Daisy\'s dock',
      'The Valley of Ashes and the eyes of Dr. T.J. Eckleburg',
      'The contrast between East Egg and West Egg',
      'Weather patterns and their correlation with key events',
    ],
    additionalNotes: 'Your analysis should go beyond simple identification and explore the deeper meanings and connections these symbols have to the characters\' motivations and the novel\'s overarching message.',
  },
  points: 100,
  submissionType: 'file_upload',
  allowedFormats: ['.doc', '.docx', '.pdf'],
  maxFileSize: '10MB',
};

const mockAttachments: Attachment[] = [
  {
    id: '1',
    name: 'MLA_Formatting_Guide.pdf',
    type: 'pdf',
    size: '1.2 MB',
    url: '#',
    iconColor: 'red',
  },
  {
    id: '2',
    name: 'Essay_Template.docx',
    type: 'document',
    size: '45 KB',
    url: '#',
    iconColor: 'blue',
  },
  {
    id: '3',
    name: 'Symbolism_Lecture.mp4',
    type: 'video',
    size: '150 MB',
    url: '#',
    iconColor: 'green',
  },
];

const mockRubric: RubricItem[] = [
  {
    id: '1',
    category: 'Thesis Statement',
    description: 'Clarity and strength of argument',
    points: 25,
    criteria: 'Must be clear, arguable, and present in the introduction',
  },
  {
    id: '2',
    category: 'Symbolism Analysis',
    description: 'Depth of analysis and evidence',
    points: 40,
    criteria: 'Identify at least three symbols and explain their significance with textual evidence',
  },
  {
    id: '3',
    category: 'Structure & Organization',
    description: 'Logical flow and paragraph structure',
    points: 20,
    criteria: 'Clear introduction, body paragraphs with topic sentences, and conclusion',
  },
  {
    id: '4',
    category: 'Grammar & Format',
    description: 'MLA formatting and language use',
    points: 15,
    criteria: 'Proper citations, formatting, and error-free writing',
  },
];

const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'The Great Gatsby Full Text',
    type: 'book',
    description: 'Complete PDF version of the novel',
    url: '#',
  },
  {
    id: '2',
    title: 'Symbolism in Literature - Lecture Notes',
    type: 'notes',
    description: 'Comprehensive notes on literary symbolism',
    url: '#',
  },
  {
    id: '3',
    title: 'MLA Citation Examples',
    type: 'guide',
    description: 'Examples of proper MLA 9th edition citations',
    url: '#',
  },
  {
    id: '4',
    title: 'Essay Writing Workshop Recording',
    type: 'video',
    description: 'Recorded workshop on analytical essay writing',
    url: '#',
  },
];

const breadcrumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'English 101', href: '/courses/english-101' },
  { label: 'Assignments', href: '/courses/english-101/assignments' },
  { label: 'Mid-Term Essay', href: '#', current: true },
];

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'instructions' | 'attachments' | 'rubric' | 'materials'>('instructions');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(true);
  // In the main page component, add state for modal
const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch assignment data
    const fetchAssignmentData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In real app, fetch data based on assignmentId
        console.log('Fetching assignment:', assignmentId);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentData();
  }, [assignmentId]);

  useEffect(() => {
    // Countdown timer
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

  const handleSubmit = () => {
    console.log('Submitting assignment');
    // Handle submission logic
  };

  const handleDownload = (attachment: Attachment) => {
    console.log('Downloading:', attachment.name);
    // Handle download logic
  };

  // Update handleSubmit function


// Update submit handler
const handleSubmission = async (files: File[], text: string) => {
  console.log('Submitting:', { files, text });
  // Handle actual submission logic
  await new Promise(resolve => setTimeout(resolve, 1000));
  setIsModalOpen(false);
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-8">
        <div className="max-w-5xl mx-auto">
          {/* Skeleton loading */}
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-8"></div>
            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="flex-grow">
        <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
          
          <Header 
            assignment={mockAssignment}
         
          />
          
          <TabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            attachmentsCount={mockAttachments.length}
          />
          
          <div className="mt-6">
            {activeTab === 'instructions' && (
              <InstructionsPanel instructions={mockAssignment.instructions} />
            )}
            
            {activeTab === 'attachments' && (
              <AttachmentsPanel 
                attachments={mockAttachments}
                onDownload={handleDownload}
              />
            )}
            
            {activeTab === 'rubric' && (
              <RubricPanel 
                rubric={mockRubric}
                totalPoints={mockAssignment.points}
              />
            )}
            
            {activeTab === 'materials' && (
              <MaterialsPanel materials={mockMaterials} />
            )}
          </div>
        </main>
      </div>
      
      <ActionFooter 
        onSubmit={handleSubmit}
        onViewHistory={() => console.log('View history')}
      />
        <SubmissionModal
      assignment={mockAssignment}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmission}
    />
    </div>
  );
}