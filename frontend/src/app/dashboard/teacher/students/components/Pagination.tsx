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
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 sm:px-0 mt-8 pt-6">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Showing
          <span className="font-medium mx-1">{startItem}</span>
          to
          <span className="font-medium mx-1">{endItem}</span>
          of
          <span className="font-medium mx-1">{totalItems}</span>
          results
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-transparent hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-transparent hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;