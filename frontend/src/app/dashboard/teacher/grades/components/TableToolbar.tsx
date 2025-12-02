interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilter: () => void;
  onSort: () => void;
  onExport: () => void;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  onSearchChange,
  onFilter,
  onSort,
  onExport
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="relative w-48 sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            search
          </span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary"
            placeholder="Search students..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button
          className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={onFilter}
        >
          <span className="material-symbols-outlined text-lg">filter_list</span>
          <p className="text-sm font-medium leading-normal">Filter</p>
        </button>
        <button
          className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={onSort}
        >
          <span className="material-symbols-outlined text-lg">swap_vert</span>
          <p className="text-sm font-medium leading-normal">Sort</p>
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={onExport}
        >
          <span className="material-symbols-outlined text-lg">ios_share</span>
          <p className="text-sm font-medium leading-normal">Export CSV</p>
        </button>
      </div>
    </div>
  );
};

export default TableToolbar;