interface AdvancedOptionsSectionProps {
  formData: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };
  onChange: (field: string, value: boolean) => void;
}

export default function AdvancedOptionsSection({ formData, onChange }: AdvancedOptionsSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Advanced Options
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Further customize the test-taking experience.
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Shuffle Questions */}
        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="flex-1">
            <div className="font-medium text-gray-800 dark:text-gray-200">
              Shuffle Questions
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Randomize the order of questions for each student.
            </div>
          </div>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={formData.shuffleQuestions}
              onChange={(e) => onChange('shuffleQuestions', e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full ${formData.shuffleQuestions ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${formData.shuffleQuestions ? 'translate-x-4' : ''}`}></div>
          </div>
        </label>

        {/* Shuffle Options */}
        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="flex-1">
            <div className="font-medium text-gray-800 dark:text-gray-200">
              Shuffle Options
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Randomize the order of answers within questions.
            </div>
          </div>
          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={formData.shuffleOptions}
              onChange={(e) => onChange('shuffleOptions', e.target.checked)}
              className="sr-only"
            />
            <div className={`block w-10 h-6 rounded-full ${formData.shuffleOptions ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${formData.shuffleOptions ? 'translate-x-4' : ''}`}></div>
          </div>
        </label>
      </div>
    </div>
  );
}