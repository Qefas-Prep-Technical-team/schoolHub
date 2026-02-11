interface BasicInfoSectionProps {
  formData: {
    title: string;
    description: string;
    class: string;
    subject: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const classOptions = [
  'Grade 10A',
  'Grade 10B', 
  'Grade 11A',
  'Grade 11B',
  'Grade 12A',
  'Grade 12B',
];

const subjectOptions = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Art',
  'Music',
];

export default function BasicInfoSection({ formData, errors, onChange }: BasicInfoSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Basic Information
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start by providing the fundamental details for your assessment.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Title Input */}
        <div className="flex flex-col w-full">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            Exam/Quiz Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g. Mid-Term Algebra Test"
            className={`w-full rounded-lg border ${
              errors.title 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50'
            } bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="flex flex-col w-full">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Enter a brief description for the exam"
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark px-4 py-3 text-sm font-normal text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors resize-y"
          />
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            Optional: Provide instructions or context for students
          </p>
        </div>

        {/* Class and Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Select */}
          <div className="flex flex-col w-full">
            <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Class *
            </label>
            <div className="relative">
              <select
                value={formData.class}
                onChange={(e) => onChange('class', e.target.value)}
                className={`w-full appearance-none rounded-lg border ${
                  errors.class 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50'
                } bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Select Class</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {errors.class && (
              <p className="text-red-500 text-xs mt-1">{errors.class}</p>
            )}
          </div>

          {/* Subject Select */}
          <div className="flex flex-col w-full">
            <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
              Subject *
            </label>
            <div className="relative">
              <select
                value={formData.subject}
                onChange={(e) => onChange('subject', e.target.value)}
                className={`w-full appearance-none rounded-lg border ${
                  errors.subject 
                    ? 'border-red-500 focus:ring-red-500/50' 
                    : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50'
                } bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}