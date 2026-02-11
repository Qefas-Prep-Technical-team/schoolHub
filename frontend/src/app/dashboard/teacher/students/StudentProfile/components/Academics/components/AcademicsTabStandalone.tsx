'use client';

import { useState } from 'react';

const AcademicsTabStandalone: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const subjects = [
    { name: 'Mathematics', teacher: 'Mr. Harrison', score: 88, trend: 'up', icon: 'calculate', active: true },
    { name: 'English Literature', teacher: 'Ms. Albright', score: 74, trend: 'down', icon: 'history_edu' },
    { name: 'Physics', teacher: 'Mr. Newton', score: 92, trend: 'up', icon: 'science' }
  ];

  const expandableSections = [
    { id: 1, title: 'Test History', content: 'No test data available for the selected period.' },
    { id: 2, title: 'Homework History', content: 'No homework data available.' }
  ];

  const performanceData = {
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGPxqaxVW_89MkU93cOxkUd1YG05lDTQ_4O4uGUNABhvJbXkREdfaP35fkU4SxDzL9s1KmB_kMF74kDykEcfpckqPVtxIgVFNnd99eCLuQdo2yui_5Fetx6Ld63KY_q9bYsozBI-6zoSfRYvQodzG2GTP832uGJ_RvWccGN-my6tDwHrE3UbjlN3quGKjY67A6r6dyZICr2B4uNSrwA5_YNinNfPim5ETv_P5bJLdo3OiWgTxKXj40jtkONjsmsjXSZqETSkt6gDE',
    altText: 'A line graph showing student performance over four quarters.'
  };

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Subjects Card */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
          <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
            Subjects
          </h2>
          <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700 mt-4">
            {subjects.map((subject) => (
              <div 
                key={subject.name} 
                className={`flex items-center gap-4 py-3 cursor-pointer ${subject.active ? 'bg-primary/10 -mx-2 px-2 rounded-lg' : ''}`}
              >
                <div className={`flex items-center justify-center rounded-lg shrink-0 size-10 ${
                  subject.active 
                    ? 'text-primary bg-primary/20' 
                    : 'text-text-primary-light dark:text-text-primary-dark bg-gray-200 dark:bg-gray-700'
                }`}>
                  <span className="material-symbols-outlined">{subject.icon}</span>
                </div>
                
                <div className="flex flex-col justify-center grow">
                  <p className={`text-base font-medium leading-normal ${
                    subject.active ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark'
                  }`}>
                    {subject.name}
                  </p>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal">
                    {subject.teacher}
                  </p>
                </div>
                
                <div className={`flex items-center gap-1 ${subject.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="material-symbols-outlined text-base">
                    {subject.trend === 'up' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </div>
                
                <div className="shrink-0">
                  <p className={`text-base ${subject.active ? 'font-bold text-primary' : 'font-normal text-text-primary-light dark:text-text-primary-dark'}`}>
                    {subject.score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Sections */}
        {expandableSections.map((section) => (
          <div key={section.id} className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
                  {section.title}
                </h3>
                <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <div className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                <p>{section.content}</p>
              </div>
            </details>
          </div>
        ))}
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Performance Graph */}
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold">
              Performance Over Time
            </h2>
            <button className="flex items-center gap-2 rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              <span>{selectedSubject}</span>
              <span className="material-symbols-outlined">arrow_drop_down</span>
            </button>
          </div>
          <div className="mt-6 h-72 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
            <img 
              className="w-full h-full object-contain p-4" 
              src={performanceData.imageUrl} 
              alt={performanceData.altText}
            />
          </div>
        </div>

        {/* Add Note Button */}
        <div className="flex justify-end">
          <button className="flex items-center justify-center gap-2 min-w-[84px] cursor-pointer overflow-hidden rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="material-symbols-outlined">add_comment</span>
            <span className="truncate">Add Academic Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicsTabStandalone;