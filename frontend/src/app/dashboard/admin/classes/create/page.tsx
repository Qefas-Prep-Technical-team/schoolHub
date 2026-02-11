'use client';

import React, { useState } from 'react';
import Breadcrumbs from './components/Breadcrumbs';
import ColorPicker from './components/ColorPicker';
import SubjectInput from './components/SubjectInput';
import ClassPreview from './components/ClassPreview';

export default function CreateClassPage() {
  const [formData, setFormData] = useState({
    className: '',
    academicSession: '2024-2025',
    homeroomTeacher: '',
    assistantTeacher: '',
    subjects: ['Mathematics', 'Science', 'English'],
    capacity: 30,
    selectedColor: 'green',
  });

  const breadcrumbItems = [
    { label: 'Dashboard', href: '#' },
    { label: 'Classes', href: '#' },
    { label: 'Create Class' },
  ];

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbItems} />
          
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
                Create New Class
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                Fill in the details below to create a new class.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white dark:bg-[#1C2532] dark:border dark:border-slate-800 rounded-xl p-6 lg:p-8">
                <div className="flex flex-col gap-6">
                  <h2 className="text-slate-900 dark:text-white text-lg font-bold">
                    Class Details
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                        Class Name
                      </p>
                      <input
                        type="text"
                        value={formData.className}
                        onChange={(e) => handleInputChange('className', e.target.value)}
                        placeholder="e.g., Grade 5 - Section A"
                        className="form-input w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary dark:focus:border-primary h-11 placeholder:text-slate-400 px-3 text-sm"
                        required
                      />
                    </label>
                    
                    <label className="flex flex-col gap-2">
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                        Academic Session
                      </p>
                      <input
                        type="text"
                        value={formData.academicSession}
                        readOnly
                        className="form-input w-full rounded-lg text-slate-500 dark:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-11 px-3 text-sm cursor-not-allowed"
                      />
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                        Homeroom Teacher
                      </p>
                      <select
                        value={formData.homeroomTeacher}
                        onChange={(e) => handleInputChange('homeroomTeacher', e.target.value)}
                        className="form-select w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary dark:focus:border-primary h-11 px-3 text-sm"
                        required
                      >
                        <option value="">Select a teacher</option>
                        <option value="Dr. Eleanor Vance">Dr. Eleanor Vance</option>
                        <option value="Mr. Ben Carter">Mr. Ben Carter</option>
                        <option value="Ms. Olivia Chen">Ms. Olivia Chen</option>
                      </select>
                    </label>
                    
                    <label className="flex flex-col gap-2">
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                        Assistant Teacher <span className="text-slate-400">(Optional)</span>
                      </p>
                      <select
                        value={formData.assistantTeacher}
                        onChange={(e) => handleInputChange('assistantTeacher', e.target.value)}
                        className="form-select w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary dark:focus:border-primary h-11 px-3 text-sm"
                      >
                        <option value="">Select an assistant</option>
                        <option value="Mr. Samuel Jones">Mr. Samuel Jones</option>
                        <option value="Ms. Aisha Khan">Ms. Aisha Khan</option>
                      </select>
                    </label>
                  </div>
                  
                  <label className="flex flex-col gap-2">
                    <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                      Subjects Assigned
                    </p>
                    <SubjectInput
                      subjects={formData.subjects}
                      onSubjectsChange={(subjects) => handleInputChange('subjects', subjects)}
                    />
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                        Maximum Capacity
                      </p>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                        placeholder="e.g., 30"
                        className="form-input w-full rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-transparent focus:border-primary dark:focus:border-primary h-11 placeholder:text-slate-400 px-3 text-sm"
                        min="1"
                        required
                      />
                    </label>
                    
                    <div className="flex flex-col gap-2">
                      <p className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                        Class Color Tag <span className="text-slate-400">(Optional)</span>
                      </p>
                      <ColorPicker
                        selectedColor={formData.selectedColor}
                        onColorSelect={(color) => handleInputChange('selectedColor', color)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50"
                    >
                      Save Class
                    </button>
                  </div>
                </div>
              </div>
              
              <ClassPreview
                className={formData.className || "Grade 5 - Section A"}
                academicSession={formData.academicSession}
                teacher={formData.homeroomTeacher || "Dr. Eleanor Vance"}
                capacity={formData.capacity}
                subjects={formData.subjects}
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}