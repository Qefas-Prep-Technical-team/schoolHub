import { Material } from './types';

interface Props {
  materials: Material[];
}

export default function MaterialsPanel({ materials }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'book':
        return 'menu_book';
      case 'notes':
        return 'notes';
      case 'video':
        return 'ondemand_video';
      case 'article':
        return 'article';
      case 'guide':
        return 'school';
      case 'link':
        return 'link';
      default:
        return 'folder';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'text-purple-600 dark:text-purple-400';
      case 'notes':
        return 'text-green-600 dark:text-green-400';
      case 'video':
        return 'text-red-600 dark:text-red-400';
      case 'article':
        return 'text-blue-600 dark:text-blue-400';
      case 'guide':
        return 'text-orange-600 dark:text-orange-400';
      case 'link':
        return 'text-primary';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {materials.map((material) => (
        <a
          key={material.id}
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/50">
            <span className={`material-symbols-outlined ${getIconColor(material.type)}`}>
              {getIcon(material.type)}
            </span>
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {material.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              {material.description}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary capitalize">
                {material.type}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Click to access
              </span>
            </div>
          </div>
          
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">
            open_in_new
          </span>
        </a>
      ))}
    </div>
  );
}