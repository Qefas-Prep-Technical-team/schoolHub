'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { imageService } from '@/lib/api/services/imageService';
import { toast } from 'react-toastify';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  aspectRatio?: 'square' | 'video' | 'favicon';
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange,
  label,
  description,
  aspectRatio = 'square',
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please use PNG, JPG, WEBP, or SVG.');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload directly to Supabase
      const { publicUrl } = await imageService.uploadToSupabase(file);
      
      // 2. Callback to update parent state with the public URL
      onChange(publicUrl);
      toast.success(`${label} uploaded successfully!`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Upload failed details:', err.response?.data || error);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const aspectClasses = {
    square: 'aspect-square size-32',
    video: 'aspect-video w-full max-w-md h-auto rounded-[2rem]',
    favicon: 'aspect-square size-14',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 font-medium">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div 
          className={`relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all group hover:border-primary/50 ${aspectClasses[aspectRatio]}`}
        >
          {value ? (
            <>
              <NextImage src={value} alt={label} width={200} height={200} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2">
                 <Upload className="text-white" size={24} />
                 <span className="text-[8px] font-black uppercase text-white tracking-widest">Replace</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-700">
              <ImageIcon size={aspectRatio === 'favicon' ? 20 : 32} />
              {aspectRatio !== 'favicon' && <span className="text-[8px] font-black uppercase tracking-widest">Select Image</span>}
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
          
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
            accept=".jpg,.jpeg,.png,.svg,.webp"
            title=""
          />
        </div>

        {value && !isUploading && (
          <button 
            type="button"
            onClick={() => onChange('')}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors border border-rose-100 dark:border-rose-500/20"
          >
            <X size={14} /> Remove {label}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
