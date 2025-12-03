interface SchedulingSectionProps {
  formData: {
    startDateTime: string;
    endDateTime: string;
    visibility: string;
    duration: string;
  };
  onChange: (field: string, value: string) => void;
}

const visibilityOptions = [
  { value: 'immediate', label: 'Immediate Publish' },
  { value: 'scheduled', label: 'Schedule for Start Time' },
  { value: 'manual', label: 'Manual Publish' },
];

export default function SchedulingSection({ formData, onChange }: SchedulingSectionProps) {
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const getDefaultEndDateTime = () => {
    if (formData.startDateTime && formData.duration) {
      const start = new Date(formData.startDateTime);
      const duration = parseInt(formData.duration) || 60;
      const end = new Date(start.getTime() + duration * 60000);
      return end.toISOString().slice(0, 16);
    }
    return '';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Scheduling & Visibility
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Control when students can access the exam and see their results.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date & Time */}
        <div className="flex flex-col">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.startDateTime}
            onChange={(e) => onChange('startDateTime', e.target.value)}
            min={getCurrentDateTime()}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          />
        </div>

        {/* End Date & Time */}
        <div className="flex flex-col">
          <label className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-2">
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={formData.endDateTime}
            onChange={(e) => onChange('endDateTime', e.target.value)}
            min={formData.startDateTime || getCurrentDateTime()}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-background-light dark:bg-background-dark h-12 px-4 text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="mt-6">
        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium leading-normal pb-3">
          Visibility Settings
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {visibilityOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                formData.visibility === option.value
                  ? 'bg-primary/10 border-primary dark:bg-primary/20 dark:border-primary/70'
                  : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={formData.visibility === option.value}
                onChange={(e) => onChange('visibility', e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary/50"
              />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}