import { Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { ClassCard, ClassItem } from './ClassCard';

interface ClassListProps {
  isLoading: boolean;
  filteredClasses: ClassItem[];
}

export function ClassList({ isLoading, filteredClasses }: ClassListProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {isLoading && (
        <>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-6" />
              <Skeleton className="h-20 w-full mb-8" />
              <div className="flex gap-4 mb-8">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ))}
        </>
      )}
      
      {!isLoading && filteredClasses.length === 0 && (
        <div className="col-span-full text-center py-40 p-10 rounded-[4rem] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-slate-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No classes found</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">We couldn't find any classes matching your search criteria. Try a different subject or title.</p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {filteredClasses.map((cls, idx) => (
          <ClassCard key={cls.id} cls={cls} idx={idx} />
        ))}
      </AnimatePresence>
    </section>
  );
}
