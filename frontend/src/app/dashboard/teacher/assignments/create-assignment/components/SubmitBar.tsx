'use client';

interface SubmitBarProps {
    onCancel: () => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    isLoading?: boolean;
    publishStatus?: string;
}

export default function SubmitBar({
    onCancel,
    onSaveDraft,
    onPublish,
    isLoading = false,
    publishStatus = 'draft'
}: SubmitBarProps) {
    return (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-sm border-t border-[#E4E4E7] dark:border-[#2D2D2F] z-50">
            <div className="max-w-4xl mx-auto p-4 flex justify-end items-center gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-[#0e121b] dark:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    Cancel
                </button>

                <button
                    onClick={onSaveDraft}
                    className="px-4 py-2 text-sm font-medium text-[#0e121b] dark:text-white rounded-lg border border-[#d1d8e6] dark:border-[#374151] bg-white dark:bg-[#2D2D2F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                    onClick={onPublish}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Publishing...
                        </>
                    ) : (
                        publishStatus === 'schedule-later' ? 'Schedule' : 'Publish'
                    )}
                </button>
            </div>
        </div>
    );
}