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
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const maxSize = 10 * 1024 * 1024;
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        setError(`File size exceeds 10MB limit`);
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
      setError('');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const isQuiz = assignment?.questions && assignment.questions.length > 0;
    
    if (!textEntry.trim() && files.length === 0 && !isQuiz) {
      setError('Please provide either text entry or file upload');
      return;
    }

    setStatus('submitting');
    setError('');
    
    try {
      await onSubmit(files, textEntry);
      setFiles([]);
      setTextEntry('');
      setStatus('success');
    } catch (err) {
      setError('Submission failed. Please try again.');
      setStatus('idle');
    }
  };

  const handleClose = () => {
    if (status === 'success') setStatus('idle');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        
        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Successfully Submitted!</h3>
            <p className="mb-8 text-slate-600 dark:text-slate-400">Your assignment has been received and recorded.</p>
            <button 
              onClick={handleClose}
              className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-white hover:bg-primary/90 dark:bg-pink-600 dark:hover:bg-pink-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="p-6">
              <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">Submit Assignment</h3>
              <p className="mb-6 text-sm text-slate-500">{assignment?.title || 'Assignment'}</p>
              
              {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Text Entry</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-pink-500 dark:focus:ring-pink-500"
                  rows={4}
                  placeholder="Type your answer or notes here..."
                  value={textEntry}
                  onChange={(e) => setTextEntry(e.target.value)}
                  disabled={status === 'submitting'}
                />
              </div>
              
              <div className="mb-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">File Upload</label>
                <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-input"
                    disabled={status === 'submitting'}
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose Files
                  </label>
                  <p className="mt-3 text-xs text-slate-500">Max size: 10MB per file</p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <svg className="h-5 w-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          disabled={status === 'submitting'}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <button
                onClick={handleClose}
                disabled={status === 'submitting'}
                className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-bold text-white hover:bg-primary/90 dark:bg-pink-600 dark:hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {status === 'submitting' && (
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {status === 'submitting' ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}