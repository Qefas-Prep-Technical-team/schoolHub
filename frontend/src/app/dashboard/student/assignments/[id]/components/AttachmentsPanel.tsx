import { Attachment } from './types';

interface Props {
  attachments: Attachment[];
  onDownload: (attachment: Attachment) => void;
}

export default function AttachmentsPanel({ attachments, onDownload }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'document':
        return 'description';
      case 'video':
        return 'videocam';
      case 'image':
        return 'image';
      case 'spreadsheet':
        return 'table_chart';
      case 'presentation':
        return 'slideshow';
      default:
        return 'insert_drive_file';
    }
  };

  const getIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'text-red-600 dark:text-red-400',
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      purple: 'text-purple-600 dark:text-purple-400',
      orange: 'text-orange-600 dark:text-orange-400',
    };
    return colorMap[color] || 'text-slate-600 dark:text-slate-400';
  };

  const getBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-100 dark:bg-red-900/50',
      blue: 'bg-blue-100 dark:bg-blue-900/50',
      green: 'bg-green-100 dark:bg-green-900/50',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/50',
      purple: 'bg-purple-100 dark:bg-purple-900/50',
      orange: 'bg-orange-100 dark:bg-orange-900/50',
    };
    return colorMap[color] || 'bg-slate-100 dark:bg-slate-800/50';
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 hover:shadow-md transition-shadow"
        >
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${getBgColor(attachment.iconColor)}`}>
            <span className={`material-symbols-outlined ${getIconColor(attachment.iconColor)}`}>
              {getIcon(attachment.type)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              {attachment.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {attachment.size}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {attachment.type} file
            </p>
          </div>
          
          <button
            onClick={() => onDownload(attachment)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            title={`Download ${attachment.name}`}
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
        </div>
      ))}
    </div>
  );
}