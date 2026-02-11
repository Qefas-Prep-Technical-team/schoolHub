interface ConfigurationSectionProps {
  formData: {
    duration: string;
    totalMarks: string;
    gradingMethod: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const gradingMethods = [
  'Automatic Grading',
  'Manual Grading',
  'Partial Credit',
  'Rubric Based',
];

export default function ConfigurationSection({ formData, errors, onChange }: ConfigurationSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Configuration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Define the rules and grading for this assessment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Duration Input */}
        <div className="flex flex-col">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            Duration (minutes) *
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => onChange('duration', e.target.value)}
              placeholder="e.g. 60"
              className={`w-full rounded-lg border ${
                errors.duration 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50'
              } bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors`}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              min
            </span>
          </div>
          {errors.duration && (
            <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
          )}
        </div>

        {/* Total Marks Input */}
        <div className="flex flex-col">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            Total Marks *
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={formData.totalMarks}
              onChange={(e) => onChange('totalMarks', e.target.value)}
              placeholder="e.g. 100"
              className={`w-full rounded-lg border ${
                errors.totalMarks 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-300 dark:border-gray-700 focus:ring-primary/50'
              } bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors`}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              points
            </span>
          </div>
          {errors.totalMarks && (
            <p className="text-red-500 text-xs mt-1">{errors.totalMarks}</p>
          )}
        </div>

        {/* Grading Method Select */}
        <div className="flex flex-col">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            Grading Method
          </label>
          <div className="relative">
            <select
              value={formData.gradingMethod}
              onChange={(e) => onChange('gradingMethod', e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            >
              <option value="">Select Method</option>
              {gradingMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}