import { Document } from "./type";


interface DetailsPanelProps {
    document: Document;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ document }) => {
    const details = [
        { label: 'File Type', value: `${document.fileType} Document` },
        { label: 'File Size', value: document.fileSize },
        { label: 'Uploaded By', value: document.uploadedBy },
        { label: 'Date Added', value: document.dateAdded },
    ];

    return (
        <div className="rounded-xl shadow-sm bg-white dark:bg-background-dark/50 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] mb-5">
                Details
            </h2>
            <ul className="space-y-4 text-sm">
                {details.map((detail) => (
                    <li key={detail.label} className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">
                            {detail.label}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                            {detail.value}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DetailsPanel;