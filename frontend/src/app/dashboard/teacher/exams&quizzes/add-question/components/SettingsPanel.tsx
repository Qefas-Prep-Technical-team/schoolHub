import { HelpCircle, Tag, Hash } from 'lucide-react';

export default function SettingsPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Tags */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <label className="text-base font-medium text-gray-900 dark:text-gray-200">
            Tags
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Biology', 'Cell Structure', 'Grade 10'].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            className="bg-transparent border-none text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Add tag logic
                e.preventDefault();
              }
            }}
          />
        </div>
      </div>

      {/* Question Bank */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <label className="text-base font-medium text-gray-900 dark:text-gray-200">
            Add to Question Bank
          </label>
        </div>
        <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-10 px-3 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
          <option value="">Select question bank...</option>
          <option value="biology-101">Biology 101 Questions</option>
          <option value="science-basics">Science Basics</option>
          <option value="cell-biology">Cell Biology</option>
        </select>
      </div>

      {/* Hints */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <label className="text-base font-medium text-gray-900 dark:text-gray-200">
            Add Hint (Optional)
          </label>
        </div>
        <textarea
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-20 text-sm"
          placeholder="Provide a hint to help students..."
        />
      </div>
    </div>
  );
}