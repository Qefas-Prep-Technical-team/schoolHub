import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    primaryColor?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    primaryColor = '#2563eb'
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const range = 1; // Show current page +/- 1 sibling page

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        // Always show page 1
        pages.push(1);

        const leftSiblingIndex = Math.max(currentPage - range, 2);
        const rightSiblingIndex = Math.min(currentPage + range, totalPages - 1);

        const showLeftEllipsis = leftSiblingIndex > 2;
        const showRightEllipsis = rightSiblingIndex < totalPages - 1;

        if (showLeftEllipsis) {
            pages.push('...');
        }

        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
            pages.push(i);
        }

        if (showRightEllipsis) {
            pages.push('...');
        }

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-6">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    Prev
                </button>
                <span className="text-xs font-black text-slate-500 flex items-center">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    Next
                </button>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Showing <span className="font-bold text-slate-850 dark:text-white">{totalItems === 0 ? 0 : startItem}</span> to{' '}
                        <span className="font-bold text-slate-850 dark:text-white">{endItem}</span> of{' '}
                        <span className="font-bold text-slate-850 dark:text-white">{totalItems}</span> entries
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex items-center -space-x-px gap-1.5 p-1 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900">
                        {/* Prev Button */}
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-transparent disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm hover:shadow-md"
                        >
                            <ChevronLeft size={16} strokeWidth={2.5} />
                        </button>

                        {/* Page Numbers with Smart Ellipsis Window */}
                        {getPageNumbers().map((page, index) => {
                            if (page === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="relative size-10 flex items-center justify-center text-sm font-black text-slate-400 dark:text-slate-500 select-none"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isActive = currentPage === page;

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page as number)}
                                    className="relative size-10 rounded-xl text-sm font-black flex items-center justify-center transition-all border shadow-sm hover:shadow-md"
                                    style={isActive ? {
                                        backgroundColor: primaryColor,
                                        color: '#ffffff',
                                        borderColor: primaryColor,
                                        boxShadow: `0 8px 12px -3px ${primaryColor}40`
                                    } : {
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent',
                                        color: 'inherit'
                                    }}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* Next Button */}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900 border border-transparent disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm hover:shadow-md"
                        >
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
