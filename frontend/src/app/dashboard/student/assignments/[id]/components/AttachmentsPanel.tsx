import { Attachment } from './types';
import { 
  FileText, 
  FileSpreadsheet, 
  Video, 
  Image as ImageIcon, 
  FileCode, 
  File, 
  Download 
} from 'lucide-react';

interface Props {
  attachments: Attachment[];
  onDownload: (attachment: Attachment) => void;
}

export default function AttachmentsPanel({ attachments, onDownload }: Props) {
  const renderIcon = (type: string, color: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className={iconClass} />;
      case 'video':
        return <Video className={iconClass} />;
      case 'image':
        return <ImageIcon className={iconClass} />;
      case 'spreadsheet':
        return <FileSpreadsheet className={iconClass} />;
      case 'presentation':
      case 'code':
        return <FileCode className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const getStyle = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      red: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400' },
      blue: { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-600 dark:text-pink-400' },
      green: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
      yellow: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400' },
    };
    return colorMap[color] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' };
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900/40">
        <File className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No attachments provided</p>
        <p className="text-xs text-slate-400 mt-1">There are no supplementary files attached to this assignment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {attachments.map((attachment) => {
        const style = getStyle(attachment.iconColor);
        return (
          <div
            key={attachment.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 sm:p-4 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                {renderIcon(attachment.type, attachment.iconColor)}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {attachment.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{attachment.size}</span>
                  <span>•</span>
                  <span className="uppercase font-semibold tracking-wider text-[10px]">{attachment.type}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onDownload(attachment)}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-pink-50 hover:text-pink-600 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-pink-950/40 dark:hover:text-pink-400 transition-colors"
              title={`Download ${attachment.name}`}
              aria-label={`Download ${attachment.name}`}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}