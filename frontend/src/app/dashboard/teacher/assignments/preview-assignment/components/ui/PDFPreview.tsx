'use client';

interface PDFPreviewProps {
  previewUrl: string;
  fileUrl: string;
  fileName?: string;
  onDownload?: () => void;
}

export default function PDFPreview({ 
  previewUrl, 
  fileUrl, 
  fileName = 'document.pdf',
  onDownload 
}: PDFPreviewProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Submission Preview
        </h2>
        <button
          onClick={handleDownload}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 h-10 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span className="truncate">Download File</span>
        </button>
      </div>
      
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 aspect-[3/4]">
        {previewUrl ? (
          <div 
            className="h-full w-full bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${previewUrl})` }}
            aria-label="Preview of submitted document"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                picture_as_pdf
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                Preview not available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}