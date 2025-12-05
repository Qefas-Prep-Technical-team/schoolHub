import { Attachment } from './types';
import Card from './ui/Card';
import { Download } from 'lucide-react';

interface AttachmentsProps {
  attachments: Attachment[];
  title?: string;
}

export default function Attachments({ attachments, title = 'Attachments' }: AttachmentsProps) {
  return (
    <Card padding="none">
      <h2 className="border-b border-gray-200 px-6 py-4 text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:border-gray-700/80 dark:text-white">
        {title}
      </h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700/80">
        {attachments.map((attachment) => (
          <li 
            key={attachment.id}
            className="flex items-center justify-between gap-4 p-6 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-4">
              <span className={`material-symbols-outlined ${attachment.iconColor}`}>
                {attachment.icon}
              </span>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {attachment.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {attachment.size}
                </p>
              </div>
            </div>
            <a
              href={attachment.downloadUrl}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              download
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}