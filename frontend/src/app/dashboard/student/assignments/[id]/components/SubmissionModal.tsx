'use client';

import { useState } from 'react';
import { Assignment } from './types';
import { 
  CheckCircle2, 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  AlertCircle, 
  Trash2,
  FileCheck2
} from 'lucide-react';

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
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        setError('One or more files exceed the 10MB limit');
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
      setError('Please provide either written answers or an uploaded file');
      return;
    }

    setStatus('submitting');
    setError('');
    
    try {
      await onSubmit(files, textEntry);
      setFiles([]);
      setTextEntry('');
      setStatus('success');
    } catch {
      setError('Submission failed. Please verify your connection and try again.');
      setStatus('idle');
    }
  };

  const handleClose = () => {
    if (status === 'success') setStatus('idle');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {status === 'success' ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center my-auto">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
            </div>
            <h3 className="mb-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Assignment Submitted!
            </h3>
            <p className="mb-6 max-w-sm text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your submission has been securely recorded. You will receive notifications when your grades or feedback are published.
            </p>
            <button 
              onClick={handleClose}
              className="w-full sm:w-auto min-w-[200px] min-h-[48px] rounded-xl bg-pink-600 px-6 py-3 font-bold text-white hover:bg-pink-700 transition-colors shadow-sm active:scale-95 text-sm"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="min-w-0 pr-4">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <FileCheck2 className="h-3 w-3" />
                  Submission Confirmation
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                  {assignment?.title || 'Submit Assignment'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                disabled={status === 'submitting'}
                className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs sm:text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="mb-2 block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  Written Submission / Submission Notes
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-900 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:border-pink-500 dark:focus:ring-pink-500/20 transition-all outline-none resize-none"
                  rows={4}
                  placeholder="Type your answer, observations, notes or links here..."
                  value={textEntry}
                  onChange={(e) => setTextEntry(e.target.value)}
                  disabled={status === 'submitting'}
                />
              </div>
              
              <div>
                <label className="mb-2 block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                  File Uploads (Optional)
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-5 text-center transition-colors hover:border-pink-400">
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
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
                  >
                    <Upload className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    Attach Files
                  </label>
                  <p className="mt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    PDF, DOCX, ZIP, or images (max 10MB each)
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {file.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-slate-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          disabled={status === 'submitting'}
                          className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
                          aria-label="Remove file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 p-4 sm:px-6">
              <button
                onClick={handleClose}
                disabled={status === 'submitting'}
                className="w-full sm:w-auto min-h-[44px] rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-pink-700 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
              >
                {status === 'submitting' && (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                )}
                {status === 'submitting' ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}