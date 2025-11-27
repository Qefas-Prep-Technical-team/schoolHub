'use client';

import { useState } from 'react';

import BasicInformation from './BasicInformation';
import CBTSettings from './CBTSettings';
import PublishingControls from './PublishingControls';
import { ExamFormData } from '../../components/types';

const initialFormData: ExamFormData = {
  title: '',
  type: 'cbt',
  classLevel: '',
  startDate: '',
  endDate: '',
  duration: 0,
  totalMarks: 0,
  instructions: '',
  cbtSettings: {
    shuffleQuestions: false,
    shuffleOptions: false,
    showHints: false,
    negativeMarking: false,
  },
  publishingSettings: {
    allowLateSubmissions: false,
    allowMultipleAttempts: false,
    resultVisibilityDate: '',
  },
};

export default function CreateExamForm() {
  const [formData, setFormData] = useState<ExamFormData>(initialFormData);

  const handleSaveDraft = () => {
    console.log('Saving as draft:', formData);
    // Implement save draft logic
  };

  const handlePublish = () => {
    console.log('Publishing exam:', formData);
    // Implement publish logic
  };

  const updateFormData = (updates: Partial<ExamFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col gap-8">
      <BasicInformation
        formData={formData}
        onChange={updateFormData}
      />

      {formData.type === 'cbt' && (
        <CBTSettings
          settings={formData.cbtSettings}
          onChange={(settings) => updateFormData({ cbtSettings: settings })}
        />
      )}

      <PublishingControls
        settings={formData.publishingSettings}
        onChange={(settings) => updateFormData({ publishingSettings: settings })}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  );
}