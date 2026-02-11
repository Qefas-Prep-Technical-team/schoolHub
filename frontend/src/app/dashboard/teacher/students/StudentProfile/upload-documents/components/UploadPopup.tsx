'use client';
import { useState } from 'react';
import { UploadFormData } from './type';
import UploadModal from './UploadModal';
import Button from './ui/Button';


interface UploadPopupProps {
  backgroundImage?: string;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ backgroundImage }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleUpload = async (formData: UploadFormData) => {
    console.log('Uploading document:', formData);
    // Implement your upload logic here
    // Example: API call to upload document
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Document uploaded successfully');
        resolve(true);
      }, 2000);
    });
  };

  return (
    <div>
      <Button 
        variant="primary" 
        icon="upload_file"
        onClick={() => setIsModalOpen(true)}
      >
        Upload Document
      </Button>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        backgroundImage={backgroundImage}
      />
    </div>
  );
};

export default UploadPopup;