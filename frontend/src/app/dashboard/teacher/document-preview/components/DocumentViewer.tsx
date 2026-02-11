interface DocumentViewerProps {
    title: string;
    previewUrl?: string;
    fileType: string;
    isLoading?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    title,
    previewUrl,
    fileType,
    isLoading = true
}) => {
    return (
        <div className="w-full h-[600px] lg:h-full rounded-xl shadow-sm bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800 flex flex-col">
            {previewUrl ? (
                <iframe
                    src={previewUrl}
                    title={title}
                    className="w-full h-full rounded-xl"
                    frameBorder="0"
                />
            ) : (
                <div className="flex flex-col items-center justify-center gap-6 h-full p-6 text-center">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-contain w-full max-w-[200px] dark:invert"
                        style={{
                            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1MEf-kxyLndE-0Ec7b9D-Xi8RWje61JYUA3m0Q2vIfGiOoxwPWqNkJv9iB1k9XJThnlKL4Hs9l9zDz7eqObwB9RbprxjaJpHMscFaMXns1meJ8J-uCOc48qgKnZeM14zWegzZhSJHUYj0deggkHCECGWmpGz2hXC5wOJMT1l84RkOHF8Uz_cUbTEtpsQuN2Y5YOP9xIk3jZuSeQCh0ngztUmdAoPkMIY-9oqeduIQuSjT2stLKO-W-_fwSxAlFhhhSGc36z51AJ4")'
                        }}
                    />
                    <div className="flex max-w-sm flex-col items-center gap-2">
                        <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            Previewing Document
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">
                            The document is loading. For a better experience, you can also download the file.
                        </p>
                    </div>
                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 text-primary dark:text-primary/90">
                            <svg
                                className="animate-spin h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="text-sm font-medium">Loading...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;