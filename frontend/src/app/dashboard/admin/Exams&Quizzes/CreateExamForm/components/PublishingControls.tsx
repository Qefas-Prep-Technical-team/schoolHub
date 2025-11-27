/* eslint-disable @typescript-eslint/no-explicit-any */
import Input from './ui/Input';
import Checkbox from './ui/Checkbox';
import Button from './ui/Button';

interface PublishingControlsProps {
  settings: {
    allowLateSubmissions: boolean;
    allowMultipleAttempts: boolean;
    resultVisibilityDate: string;
  };
  onChange: (settings: any) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

export default function PublishingControls({
  settings,
  onChange,
  onSaveDraft,
  onPublish
}: PublishingControlsProps) {
  const handleCheckboxChange = (field: keyof typeof settings, checked: boolean) => {
    onChange({ ...settings, [field]: checked });
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Publishing Controls</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage submission rules and visibility.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Checkbox
          label="Allow Late Submissions"
          checked={settings.allowLateSubmissions}
          onChange={(checked) => handleCheckboxChange('allowLateSubmissions', checked)}
        />
        <Checkbox
          label="Allow Multiple Attempts"
          checked={settings.allowMultipleAttempts}
          onChange={(checked) => handleCheckboxChange('allowMultipleAttempts', checked)}
        />
        <div className="w-full md:w-1/2">
          <Input
            label="Set Result Visibility Date"
            type="date"
            value={settings.resultVisibilityDate}
            onChange={(value) => onChange({ ...settings, resultVisibilityDate: value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="secondary" onClick={onSaveDraft}>
          Save as Draft
        </Button>
        <Button onClick={onPublish}>
          Publish Exam
        </Button>
      </div>
    </div>
  );
}