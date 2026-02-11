export interface ExamFormData {
  // Basic Information
  title: string;
  description: string;
  class: string;
  subject: string;
  
  // Configuration
  duration: string;
  totalMarks: string;
  gradingMethod: string;
  
  // Scheduling
  startDateTime: string;
  endDateTime: string;
  visibility: 'immediate' | 'scheduled' | 'manual';
  
  // Advanced Options
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  
  // Type
  type?: 'exam' | 'quiz';
}