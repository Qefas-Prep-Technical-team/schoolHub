/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExamFormData } from '../../components/types';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';


interface BasicInformationProps {
  formData: ExamFormData;
  onChange: (updates: Partial<ExamFormData>) => void;
}

export default function BasicInformation({ formData, onChange }: BasicInformationProps) {
  const handleChange = (field: keyof ExamFormData, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Fill in the essential details for the exam.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <Input
            label="Exam Title"
            placeholder="e.g., Mid-Term Physics Examination"
            value={formData.title}
            onChange={(value) => handleChange('title', value)}
          />
        </div>

        <Select
          label="Exam Type"
          options={[
            { value: 'cbt', label: 'Computer-Based Test (CBT)' },
            { value: 'written', label: 'Written Exam' },
          ]}
          value={formData.type}
          onChange={(value) => handleChange('type', value)}
        />

        <Select
          label="Class Level(s)"
          options={[
            { value: '', label: 'Select class' },
            { value: 'grade10', label: 'Grade 10' },
            { value: 'grade11', label: 'Grade 11' },
            { value: 'grade12', label: 'Grade 12' },
          ]}
          value={formData.classLevel}
          onChange={(value) => handleChange('classLevel', value)}
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(value) => handleChange('startDate', value)}
        />

        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(value) => handleChange('endDate', value)}
        />

        <Input
          label="Duration (Minutes)"
          type="number"
          placeholder="e.g., 90"
          value={formData.duration.toString()}
          onChange={(value) => handleChange('duration', parseInt(value) || 0)}
        />

        <Input
          label="Total Marks"
          type="number"
          placeholder="e.g., 100"
          value={formData.totalMarks.toString()}
          onChange={(value) => handleChange('totalMarks', parseInt(value) || 0)}
        />

        <div className="col-span-2">
          <Textarea
            label="Exam Instructions"
            placeholder="Enter instructions for students..."
            rows={4}
            value={formData.instructions}
            onChange={(value) => handleChange('instructions', value)}
          />
        </div>
      </div>
    </div>
  );
}