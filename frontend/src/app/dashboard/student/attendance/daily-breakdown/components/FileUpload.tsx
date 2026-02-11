// src/components/Dashboard/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { FileUploadProps } from './types';

const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    maxSize = 10,
    accept = 'image/*,.pdf'
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File size exceeds ${maxSize}MB limit`);
                return;
            }
            setFileName(file.name);
            onFileSelect?.(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-6 py-10">
            <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">
                    cloud_upload
                </span>
                <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 dark:focus-within:ring-offset-background-dark hover:text-primary/80">
                        <span onClick={handleClick}>Upload a file</span>
                        <input
                            ref={fileInputRef}
                            className="sr-only"
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                        />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG, PDF up to {maxSize}MB
                </p>
                {fileName && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                        Selected: {fileName}
                    </p>
                )}
            </div>
        </div>
    );
};

export default FileUpload;