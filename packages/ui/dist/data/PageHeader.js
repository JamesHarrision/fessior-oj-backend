import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const PageHeader = React.memo(function PageHeader({ title, subtitle, extra, }) {
    return (_jsxs("div", { className: "flex items-center justify-between mb-8 border-b border-charcoal pb-5", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-2xl font-bold text-linen tracking-[-0.01em]", children: title }), subtitle && (_jsx("p", { className: "font-body text-sm text-stone mt-1", children: subtitle }))] }), extra && _jsx("div", { className: "shrink-0", children: extra })] }));
});
