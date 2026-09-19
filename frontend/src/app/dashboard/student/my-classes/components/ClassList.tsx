import { Search } from 'lucide-react';
import { ClassItem, ClassTable } from './ClassTable';

interface ClassListProps {
  isLoading: boolean;
  filteredClasses: ClassItem[];
}

export function ClassList({ isLoading, filteredClasses }: ClassListProps) {
  return (
    <section>
      {isLoading && (
        <ClassTable isLoading={true} filteredClasses={[]} />
      )}
      
      {!isLoading && filteredClasses.length === 0 && (
        <div className="col-span-full text-center py-32 p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mt-6">
            <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">No classes found</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2 text-sm">We couldn't find any classes matching your search criteria. Try a different subject or title.</p>
        </div>
      )}

      {!isLoading && filteredClasses.length > 0 && (
        <ClassTable isLoading={false} filteredClasses={filteredClasses} />
      )}
    </section>
  );
}
