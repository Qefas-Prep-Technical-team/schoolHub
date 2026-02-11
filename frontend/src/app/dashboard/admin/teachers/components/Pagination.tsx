import Icon from './ui/Icon'

interface PaginationProps {
  totalItems: number
  currentPage: number
  itemsPerPage?: number
}

export default function Pagination({ 
  totalItems, 
  currentPage, 
  itemsPerPage = 4 
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="flex items-center justify-between p-4 border-t border-neutral-200/80 dark:border-neutral-800">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Showing 1 to {Math.min(itemsPerPage, totalItems)} of {totalItems} results
      </p>
      <div className="flex items-center gap-2">
        <button 
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800/50 rounded-lg disabled:opacity-50" 
          disabled={currentPage === 1}
        >
          <Icon name="chevron_left" />
        </button>
        <span className="text-sm text-neutral-800 dark:text-neutral-100 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800/50 rounded-lg disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          <Icon name="chevron_right" />
        </button>
      </div>
    </div>
  )
}