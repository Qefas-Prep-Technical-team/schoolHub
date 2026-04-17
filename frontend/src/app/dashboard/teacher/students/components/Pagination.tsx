import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <nav aria-label="Pagination" className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800/50 mt-12 pt-8 gap-4 px-2">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Showing
            <span className="text-slate-900 dark:text-white mx-1.5">{startItem || 0}</span>
            to
            <span className="text-slate-900 dark:text-white mx-1.5">{endItem || 0}</span>
            of
            <span className="text-slate-900 dark:text-white mx-1.5">{totalItems || 0}</span>
            records
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="group inline-flex items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-primary hover:border-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-90"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="sr-only">Previous Page</span>
        </button>

        {/* Dynamic Page Indicator */}
        <div className="flex items-center gap-1.5 px-4 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
          <span className="text-sm font-black text-slate-900 dark:text-white tracking-widest">{currentPage}</span>
          <span className="text-slate-400 font-bold">/</span>
          <span className="text-sm font-black text-slate-400 tracking-widest">{totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="group inline-flex items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-primary hover:border-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-90"
        >
          <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          <span className="sr-only">Next Page</span>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;