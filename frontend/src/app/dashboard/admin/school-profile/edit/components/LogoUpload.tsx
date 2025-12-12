import React from 'react';
import { Upload } from 'lucide-react';

interface LogoUploadProps {
  currentLogo: string;
  onLogoChange: (file: File) => void;
  alt: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ 
  currentLogo, 
  onLogoChange,
  alt 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, SVG)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      onLogoChange(file);
    }
  };

  return (
    <div className="flex items-center gap-4 py-2">
      <div 
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16"
        style={{ backgroundImage: `url(${currentLogo})` }}
        aria-label={alt}
      />
      
      <div className="flex flex-col justify-center">
        <p className="font-medium leading-normal text-text-light-primary dark:text-text-dark-primary">
          School Logo
        </p>
        <p className="text-sm font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
          Upload a new logo (PNG, JPG, SVG).
        </p>
      </div>
      
      <label className="flex items-center justify-center h-10 px-4 ml-auto text-sm font-medium leading-normal transition-colors rounded-lg cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 shrink-0">
        <Upload size={16} className="mr-2" />
        Change Logo
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.svg"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default LogoUpload;