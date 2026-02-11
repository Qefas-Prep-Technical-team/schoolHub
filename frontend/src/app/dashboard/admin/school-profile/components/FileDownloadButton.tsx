import React from 'react';
import { Download } from 'lucide-react';

interface FileDownloadButtonProps {
  fileName: string;
  fileUrl: string;
  onClick?: (fileName: string) => void;
}

const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({ 
  fileName, 
  fileUrl, 
  onClick 
}) => {
  const handleClick = () => {
    onClick?.(fileName);
    // In real app, this would trigger file download
    console.log('Downloading:', fileUrl);
  };

  return (
    <button
      onClick={handleClick}
      className="flex w-fit items-center gap-2 text-primary dark:text-primary/90 text-sm font-medium hover:text-primary/80 dark:hover:text-primary transition-colors"
    >
      <Download size={16} />
      <span>{fileName}</span>
    </button>
  );
};

export default FileDownloadButton;