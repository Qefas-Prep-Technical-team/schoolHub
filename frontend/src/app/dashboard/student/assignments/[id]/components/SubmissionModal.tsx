'use client';

import { useState } from 'react';
import { Assignment } from './types';

interface Props {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[], text: string) => Promise<void>;
}

export default function SubmissionModal({ assignment, isOpen, onClose, onSubmit }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [textEntry, setTextEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check file size
      const maxSize = parseInt(assignment.maxFileSize || '10') * 1024 * 1024;
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        setError(`File size exceeds ${assignment.maxFileSize} limit`);
        return;
      }
      
      // Check file formats
      if (assignment.allowedFormats) {
        const invalidFiles = selectedFiles.filter(file => {
          const extension = '.' + file.name.split('.').pop()?.toLowerCase();
          return !assignment.allowedFormats?.includes(extension);
        });
        
        if (invalidFiles.length > 0) {
          setError(`Invalid file format. Allowed: ${assignment.allowedFormats.join(', ')}`);
          return;
        }
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
      setError('');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!textEntry.trim() && files.length === 0) {
      setError('Please provide either text entry or file upload');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit(files, textEntry);
      setFiles([]);
      setTextEntry('');
      onClose();
    } catch (err) {
      setError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Submit Assignment
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {assignment.title}
              </p>
            </div>
            
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            {assignment.submissionType !== 'file_upload' && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Text Entry
                </label>
                <textarea
                  value={textEntry}
                  onChange={(e) => setTextEntry(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm"
                  rows={4}
                  placeholder="Type your submission here..."
                />
              </div>
            )}
            
            {assignment.submissionType !== 'text_entry' && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  File Upload
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/80"
                  >
                    <span className="material-symbols-outlined">upload</span>
                    Choose Files
                  </label>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {assignment.allowedFormats && `Allowed formats: ${assignment.allowedFormats.join(', ')}`}
                    {assignment.maxFileSize && ` • Max size: ${assignment.maxFileSize}`}
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-500">description</span>
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex w-full justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 disabled:opacity-50 sm:ml-3 sm:w-auto"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Assignment'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}