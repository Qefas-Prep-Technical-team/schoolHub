'use client';

import { PaginationProps } from './types';

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}: PaginationProps) {

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        // Add ellipsis after first page if needed
        if (start > 2) {
            pages.push('ellipsis-start');
        }

        // Add pages around current page
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if needed
        if (end < totalPages - 1) {
            pages.push('ellipsis-end');
        }

        // Always show last page if there's more than one page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#506795] dark:text-[#9CA3AF]">
                Showing <span className="font-semibold text-[#0e121b] dark:text-white">{startItem}</span>
                -<span className="font-semibold text-[#0e121b] dark:text-white">{endItem}</span> of{' '}
                <span className="font-semibold text-[#0e121b] dark:text-white">{totalItems}</span> assignments
            </p>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1A232E] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                            <span key={`ellipsis-${index}`} className="text-[#506795] dark:text-[#9CA3AF] px-2">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`flex items-center justify-center h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${currentPage === page
                                ? 'border-primary bg-primary/20 text-primary font-bold'
                                : 'border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1A232E] hover:bg-primary/10 dark:hover:bg-primary/20'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1A232E] hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </div>
        </div>
    );
}