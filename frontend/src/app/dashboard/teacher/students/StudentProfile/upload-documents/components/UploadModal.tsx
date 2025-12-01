/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import ModalHeader from './ModalHeader';
import { UploadFormData, UploadStatus } from './type';
import FileUploader from './FileUploader';
import UploadForm from './UploadForm';
import ModalFooter from './ModalFooter';


interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: UploadFormData) => void;
  backgroundImage?: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  backgroundImage
}) => {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    description: '',
    classes: [
      { id: 1, name: 'History - Grade 10B', subject: 'History', grade: '10B', selected: true },
      { id: 2, name: 'Mathematics - Grade 11A', subject: 'Mathematics', grade: '11A', selected: true },
      { id: 3, name: 'Physics - Grade 12C', subject: 'Physics', grade: '12C', selected: false }
    ],
    shareWithParents: true
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isLoading: false,
    isSuccess: false
  });

  const handleFileSelect = (file: File) => {
    setFormData(prev => ({ ...prev, file }));
  };

  const handleInputChange = (field: keyof UploadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClassToggle = (classId: number) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.map(cls => 
        cls.id === classId ? { ...cls, selected: !cls.selected } : cls
      )
    }));
  };

  const handleSubmit = async () => {
    setUploadStatus({ isLoading: true, isSuccess: false });
    try {
      await onUpload(formData);
      setUploadStatus({ isLoading: false, isSuccess: true });
      onClose();
    } catch (error) {
      setUploadStatus({ 
        isLoading: false, 
        isSuccess: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="relative flex h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 sm:p-6"
      style={backgroundImage ? {
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      <div className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/90 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-background-dark dark:border dark:border-white/10 rounded-xl shadow-2xl flex flex-col">
        <ModalHeader onClose={onClose} />
        
        <div className="flex flex-col p-6 space-y-6">
          <FileUploader onFileSelect={handleFileSelect} />
          <UploadForm 
            formData={formData}
            onInputChange={handleInputChange}
            onClassToggle={handleClassToggle}
          />
        </div>

        <ModalFooter 
          onCancel={onClose}
          onSubmit={handleSubmit}
          isLoading={uploadStatus.isLoading}
        />
      </div>
    </div>
  );
};

export default UploadModal;