import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
export const Pagination = ({ currentPage, totalItems, pageSize, onPageChange, }) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    // Always show pagination UI even if 1 page or empty to keep layout consistent
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        // Basic logic to show pages (always show first, last, current, and adjacent)
        if (i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        }
        else if (i === currentPage - 2 ||
            i === currentPage + 2) {
            pages.push('...');
        }
    }
    // Remove duplicate ellipses
    const displayPages = pages.filter((p, index) => {
        return p !== '...' || pages[index - 1] !== '...';
    });
    return (_jsxs("div", { className: "flex items-center justify-center gap-2 mt-6", children: [_jsx("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage === 1, className: "w-8 h-8 flex items-center justify-center border border-charcoal bg-ink text-stone hover:border-vermilion hover:text-vermilion disabled:opacity-50 disabled:hover:border-charcoal disabled:hover:text-stone transition-colors", children: _jsx(ChevronLeft, { size: 16 }) }), displayPages.map((p, i) => (_jsx("button", { onClick: () => typeof p === 'number' && onPageChange(p), disabled: p === '...', className: `w-8 h-8 flex items-center justify-center font-display text-[13px] font-bold transition-colors ${p === currentPage
                    ? 'bg-vermilion text-linen border border-vermilion'
                    : p === '...'
                        ? 'text-stone cursor-default'
                        : 'border border-charcoal bg-ink text-stone hover:border-vermilion hover:text-vermilion'}`, children: p }, i))), _jsx("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages, className: "w-8 h-8 flex items-center justify-center border border-charcoal bg-ink text-stone hover:border-vermilion hover:text-vermilion disabled:opacity-50 disabled:hover:border-charcoal disabled:hover:text-stone transition-colors", children: _jsx(ChevronRight, { size: 16 }) })] }));
};
