'use client';

import React from 'react';
import { PaginationProps } from './types';
import { TeacherPagination } from '../../components/TeacherPagination';

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className,
    itemName = 'assignments'
}: PaginationProps) {
    return (
        <TeacherPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            itemName={itemName}
            className={className}
        />
    );
}
