import { BookOpen, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClassHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ClassHeader({ searchQuery, setSearchQuery }: ClassHeaderProps) {
  return (
    <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-inner">
            <BookOpen size={20} />
          </div>
          <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary uppercase tracking-widest text-[10px] font-black px-4 py-1 backdrop-blur-sm">
            No of Classes
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
          My Subjects <br/> <span className="text-slate-400 dark:text-slate-500 font-bold">& Classes</span>
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
                placeholder="Search your subjects..." 
                className="pl-12 h-14 rounded-[1.5rem] border-slate-200/50 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm focus:ring-primary focus:border-primary transition-all text-sm font-bold placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <Button className="h-14 w-full sm:w-auto px-8 rounded-[1.5rem] bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-slate-900/20 dark:hover:shadow-white/10 transition-all border border-transparent dark:border-slate-200">
            <Filter className="mr-2" size={16} /> Filter
        </Button>
      </div>
    </section>
  );
}
