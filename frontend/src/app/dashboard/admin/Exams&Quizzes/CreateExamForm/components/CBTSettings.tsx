/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Upload } from 'lucide-react';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';

interface CBTSettingsProps {
  settings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showHints: boolean;
    negativeMarking: boolean;
  };
  onChange: (settings: any) => void;
}

export default function CBTSettings({ settings, onChange }: CBTSettingsProps) {
  const handleCheckboxChange = (field: keyof typeof settings, checked: boolean) => {
    onChange({ ...settings, [field]: checked });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">CBT Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure questions and behavior for the test.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
            Question Management
          </h4>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline">
              <Plus size={16} />
              Add Question
            </Button>
            <Button variant="secondary">
              <Upload size={16} />
              Import Question Bank
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
            Behavior Controls
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Checkbox
              label="Shuffle Questions"
              checked={settings.shuffleQuestions}
              onChange={(checked) => handleCheckboxChange('shuffleQuestions', checked)}
            />
            <Checkbox
              label="Shuffle Options"
              checked={settings.shuffleOptions}
              onChange={(checked) => handleCheckboxChange('shuffleOptions', checked)}
            />
            <Checkbox
              label="Show Hints"
              checked={settings.showHints}
              onChange={(checked) => handleCheckboxChange('showHints', checked)}
            />
            <Checkbox
              label="Negative Marking"
              checked={settings.negativeMarking}
              onChange={(checked) => handleCheckboxChange('negativeMarking', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}