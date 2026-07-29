import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { FileQuestion } from 'lucide-react';
export const EmptyState = React.memo(function EmptyState({ icon, title, description, action, }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16 px-6 text-center", children: [_jsx("div", { className: "mb-4 text-stone", children: icon ?? _jsx(FileQuestion, { size: 48, strokeWidth: 1.5 }) }), _jsx("h3", { className: "font-display text-base font-bold text-linen mb-2", children: title }), description && (_jsx("p", { className: "font-body text-sm text-stone max-w-md leading-relaxed mb-4", children: description })), action && _jsx("div", { className: "mt-2", children: action })] }));
});
