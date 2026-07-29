import React from 'react';
export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}
export declare const Pagination: React.FC<PaginationProps>;
