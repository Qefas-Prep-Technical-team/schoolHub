
import ClassSelector from "./ClassSelector";
import FormInput from "./FormInput";
import ToggleSwitch from "./ToggleSwitch";
import { UploadFormData } from "./type";


interface UploadFormProps {
  formData: UploadFormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInputChange: (field: keyof UploadFormData, value: any) => void;
  onClassToggle: (classId: number) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  formData,
  onInputChange,
  onClassToggle
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {/* Document Title */}
      <FormInput
        id="doc-title"
        label="Document Title"
        type="text"
        placeholder="e.g. Weekly Homework Sheet"
        value={formData.title}
        onChange={(value) => onInputChange('title', value)}
        className="col-span-2"
      />

      {/* Class Selector */}
      <div className="flex flex-col col-span-2">
        <label className="text-slate-900 dark:text-white text-sm font-medium leading-normal pb-2">
          Select Class(es)
        </label>
        <ClassSelector 
          classes={formData.classes}
          onClassToggle={onClassToggle}
        />
      </div>

      {/* Description */}
      <FormInput
        id="description"
        label="Description (Optional)"
        type="textarea"
        placeholder="Add a short description about the document..."
        value={formData.description}
        onChange={(value) => onInputChange('description', value)}
        className="col-span-2"
        rows={4}
      />

      {/* Share with Parents Toggle */}
      <div className="col-span-2 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
        <div>
          <p className="text-slate-900 dark:text-white font-medium">
            Share with Parents
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Parents of students in selected classes will be notified.
          </p>
        </div>
        <ToggleSwitch
          id="share-toggle"
          checked={formData.shareWithParents}
          onChange={(checked) => onInputChange('shareWithParents', checked)}
        />
      </div>
    </div>
  );
};

export default UploadForm;