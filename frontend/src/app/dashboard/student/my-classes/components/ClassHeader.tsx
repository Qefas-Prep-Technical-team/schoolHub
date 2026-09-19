import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClassHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalClasses?: number;
}

export function ClassHeader({ searchQuery, setSearchQuery, totalClasses = 0 }: ClassHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 mt-10">
      <div className="flex items-end gap-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
          Todays
        </h2>
        <span className="text-xs font-semibold text-slate-400 pb-0.5">{totalClasses} Classes</span>
      </div>

      <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-pink-600" />
            <List size={16} className="text-slate-300" />
          </div>
      </div>
    </div>
  );
}
