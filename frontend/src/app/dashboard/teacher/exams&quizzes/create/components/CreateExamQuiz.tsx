'use client';

import { useState } from 'react';
import { ArrowRight, Save, X } from 'lucide-react';
import PageHeader from './PageHeader';
import BasicInfoSection from './BasicInfoSection';
import ConfigurationSection from './ConfigurationSection';
import SchedulingSection from './SchedulingSection';
import AdvancedOptionsSection from './AdvancedOptionsSection';
import Link from 'next/link';


export default function CreateExamQuiz() {
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    class: '',
    subject: '',
    
    // Configuration
    duration: '',
    totalMarks: '',
    gradingMethod: '',
    
    // Scheduling
    startDateTime: '',
    endDateTime: '',
    visibility: 'immediate',
    
    // Advanced Options
    shuffleQuestions: false,
    shuffleOptions: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.class.trim()) {
      newErrors.class = 'Class is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.duration.trim() || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required';
    }
    if (!formData.totalMarks.trim() || parseInt(formData.totalMarks) <= 0) {
      newErrors.totalMarks = 'Valid total marks is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (action: 'save' | 'saveAndAddQuestions') => {
    if (!validateForm()) {
      return;
    }

    console.log('Form submitted:', formData);
    console.log('Action:', action);
    
    // Handle form submission here
    if (action === 'saveAndAddQuestions') {
      // Navigate to add questions page
      window.location.href = '/create/questions';
    } else {
      // Save draft and stay on page
      alert('Exam saved as draft!');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields?')) {
      setFormData({
        title: '',
        description: '',
        class: '',
        subject: '',
        duration: '',
        totalMarks: '',
        gradingMethod: '',
        startDateTime: '',
        endDateTime: '',
        visibility: 'immediate',
        shuffleQuestions: false,
        shuffleOptions: false,
      });
      setErrors({});
    }
  };

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Create New Exam/Quiz" />
        
        <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 md:p-8 space-y-8">
          <BasicInfoSection 
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
          
          <hr className="border-gray-200 dark:border-gray-700/50" />
          
          <ConfigurationSection 
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
          />
          
          <hr className="border-gray-200 dark:border-gray-700/50" />
          
          <SchedulingSection 
            formData={formData}
            onChange={handleInputChange}
          />
          
          <hr className="border-gray-200 dark:border-gray-700/50" />
          
          <AdvancedOptionsSection 
            formData={formData}
            onChange={handleInputChange}
          />
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700/50">
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Reset Form</span>
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleSubmit('save')}
                className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Save className="w-5 h-5" />
                <span className="text-sm font-medium">Save as Draft</span>
              </button>
              <Link href={"/dashboard/teacher/exams&quizzes/question-list/1"}>
              
              <button
                onClick={() => handleSubmit('saveAndAddQuestions')}
                className="flex items-center justify-center cursor-pointer gap-2 h-12 px-8 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span className="text-sm font-semibold">Create and Add Questions</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}