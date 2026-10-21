import { Material } from './types';
import { 
  BookOpen, 
  FileText, 
  Video, 
  Newspaper, 
  GraduationCap, 
  Link as LinkIcon, 
  Folder, 
  ExternalLink 
} from 'lucide-react';

interface Props {
  materials: Material[];
}

export default function MaterialsPanel({ materials }: Props) {
  const renderIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'book':
        return <BookOpen className={iconClass} />;
      case 'notes':
        return <FileText className={iconClass} />;
      case 'video':
        return <Video className={iconClass} />;
      case 'article':
        return <Newspaper className={iconClass} />;
      case 'guide':
        return <GraduationCap className={iconClass} />;
      case 'link':
        return <LinkIcon className={iconClass} />;
      default:
        return <Folder className={iconClass} />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'book':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400';
      case 'notes':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'video':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400';
      case 'article':
        return 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400';
      case 'guide':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400';
      default:
        return 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400';
    }
  };

  if (!materials || materials.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900/40">
        <Folder className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No study materials linked</p>
        <p className="text-xs text-slate-400 mt-1">Supplementary study materials will appear here when provided by the teacher.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
      {materials.map((material) => (
        <a
          key={material.id}
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 hover:border-pink-500/50 hover:shadow-md transition-all group min-h-[44px]"
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getStyle(material.type)}`}>
            {renderIcon(material.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
                {material.title}
              </h4>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-pink-600 transition-colors mt-0.5" />
            </div>
            {material.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {material.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-md">
                {material.type}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Tap to open
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}