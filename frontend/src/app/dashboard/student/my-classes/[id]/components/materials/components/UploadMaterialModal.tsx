'use client';

import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Link as LinkIcon, 
  Video, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { imageService } from '@/lib/api/services/imageService';
import { useCreateAssignment } from '@/lib/api/hooks/useAssignments';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  schoolId?: string;
  subjects?: Array<{ id?: string; name?: string; subject?: { id?: string; name?: string } }>;
  onSuccess: () => void;
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  classId,
  className,
  schoolId,
  subjects = [],
  onSuccess,
}: UploadMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [category, setCategory] = useState<'STUDY_MATERIAL' | 'ASSIGNMENT' | 'READING_PASSAGE'>('STUDY_MATERIAL');
  const [videoUrl, setVideoUrl] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createAssignmentMutation = useCreateAssignment(schoolId || '', true);

  // Normalize subjects list
  const availableSubjects = subjects.map((s) => {
    const id = s.id || s.subject?.id || '';
    const name = s.name || s.subject?.name || 'General';
    return { id, name };
  }).filter((s) => Boolean(s.id));

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        toast.error('File size cannot exceed 25MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title for the material.');
      return;
    }

    try {
      setIsUploading(true);
      const attachmentsList: string[] = [];

      // 1. Upload file if selected
      if (selectedFile) {
        const uploadRes = await imageService.proxyUploadToBunny(selectedFile, schoolId);
        if (uploadRes.publicUrl) {
          attachmentsList.push(uploadRes.publicUrl);
        }
      }

      // 2. Persist as class study material resource via assignments endpoint
      const subjectId = selectedSubjectId || (availableSubjects[0]?.id || '');

      await createAssignmentMutation.mutateAsync({
        title: title.trim(),
        classIds: [classId],
        subjectId,
        instructions: instructions.trim() || undefined,
        attachments: attachmentsList.length > 0 ? attachmentsList : undefined,
        videoUrl: videoUrl.trim() || undefined,
        referenceUrl: referenceUrl.trim() || undefined,
        status: 'PUBLISHED',
      });

      toast.success('Material uploaded successfully!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to upload material:', err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiErr?.response?.data?.message || apiErr?.message || 'Failed to upload material.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Upload Class Material
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish learning resources, files, or reference links for {className}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Material Title <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 Lecture Notes & Worksheets"
              className="h-10 rounded-xl text-xs sm:text-sm"
            />
          </div>

          {/* Subject selection */}
          {availableSubjects.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select subject (or General)</option>
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload Drop Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload Document, PDF or Image
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-pink-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto">
                  <UploadCloud size={20} />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to browse or drag file here
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports PDF, Word, PowerPoint, Images (Max 25MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Video or Web Reference Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Video size={12} className="text-blue-500" />
                Video URL (Optional)
              </label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube / Vimeo link"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <LinkIcon size={12} className="text-indigo-500" />
                Web Reference (Optional)
              </label>
              <Input
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Instructions / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description & Study Instructions
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide context or guidelines for students studying this material..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isUploading}
              className="h-10 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-pink-600/20"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>Publish Material</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

