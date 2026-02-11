/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { GradingFormData, Assignment } from './types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Toggle from './ui/Toggle';



interface GradingFormProps {
  assignment: Assignment;
  initialData?: Partial<GradingFormData>;
  onSubmit: (data: GradingFormData) => Promise<void>;
}

export default function GradingForm({ 
  assignment, 
  initialData = {}, 
  onSubmit 
}: GradingFormProps) {
  const [formData, setFormData] = useState<GradingFormData>({
    score: initialData.score || 0,
    feedback: initialData.feedback || '',
    allowResubmission: initialData.allowResubmission || false,
    notifyParent: initialData.notifyParent || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof GradingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate score
      if (formData.score < 0 || formData.score > assignment.maxScore) {
        throw new Error(`Score must be between 0 and ${assignment.maxScore}`);
      }

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save grade');
    } finally {
      setIsSubmitting(false);
    }
  };

const calculatePercentage = (): number => {
  if (assignment.maxScore <= 0) return 0;
  return Number(((formData.score / assignment.maxScore) * 100).toFixed(1));
};

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
        Grade
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Score Input */}
        <div>
          <Input
            label="Score"
            type="number"
            min="0"
            max={assignment.maxScore}
            value={formData.score}
            onChange={(e) => handleChange('score', parseFloat(e.target.value) || 0)}
            placeholder="0"
            helperText={`Out of ${assignment.maxScore} points`}
            className="w-32"
          />
          
          {formData.score > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Percentage:
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {calculatePercentage()}%
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Grade:
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                  {getGradeLetter(parseFloat(`${calculatePercentage()}`))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        <div>
          <Textarea
            label="Feedback"
            value={formData.feedback}
            onChange={(e) => handleChange('feedback', e.target.value)}
            placeholder="Provide detailed feedback... Mention what was done well and areas for improvement."
            rows={6}
            maxLength={2000}
            showCharCount={true}
            helperText="Be constructive and specific in your feedback"
          />
        </div>

        {/* Common Feedback Templates (Optional) */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Quick Feedback Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Excellent work! Well structured and thoroughly researched.',
              'Good effort. Consider adding more examples in future assignments.',
              'Needs improvement in analysis. Review the rubric criteria.',
              'Well written with clear arguments. Citations could be improved.'
            ].map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  handleChange('feedback', template);
                }}
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {template.split(' ').slice(0, 4).join(' ')}...
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <Toggle
            label="Allow Resubmission"
            description="Student can submit an improved version"
            checked={formData.allowResubmission}
            onChange={(checked) => handleChange('allowResubmission', checked)}
          />

          <Toggle
            label="Notify Parent/Guardian"
            description="Send grade notification to parents"
            checked={formData.notifyParent}
            onChange={(checked) => handleChange('notifyParent', checked)}
          />
        </div>

        {/* Form submission is handled by parent ActionBar */}
      </form>
    </div>
  );
}

