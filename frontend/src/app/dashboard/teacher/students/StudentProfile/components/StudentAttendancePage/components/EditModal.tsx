'use client';

import { useState } from 'react';
import { AttendanceStatus } from './types';
import Button from '../../ui/Button';


interface EditModalProps {
  date: string;
  currentStatus: AttendanceStatus;
  currentComment?: string;
  onSave: (status: AttendanceStatus, comment: string) => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  date,
  currentStatus,
  currentComment = '',
  onSave,
  onCancel
}) => {
  const [status, setStatus] = useState<AttendanceStatus>(currentStatus);
  const [comment, setComment] = useState<string>(currentComment);

  const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: 'present', label: 'Present', color: 'present' },
    { value: 'late', label: 'Late', color: 'late' },
    { value: 'absent', label: 'Absent', color: 'absent' },
  ];

  const handleSave = () => {
    onSave(status, comment);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#19212e] rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700/60">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700/60">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Edit Attendance: {date}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update status and add comments.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Status selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer ${
                    status === option.value
                      ? `border-2 border-${option.color} bg-${option.color}/10`
                      : 'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="attendance-status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                    className={`form-radio text-${option.color} focus:ring-${option.color}`}
                  />
                  <span className={`font-medium ${
                    status === option.value 
                      ? `text-${option.color}` 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Comment field */}
          <div>
            <label 
              htmlFor="comment" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              className="mt-2 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
              placeholder="e.g., Left early for a doctor's appointment."
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            >
              {currentComment}
            </textarea>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            className="h-10 px-4 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onCancel}
          >
            Cancel
          </button>
          <Button
            variant="primary"
            className="text-sm font-bold tracking-wide"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;