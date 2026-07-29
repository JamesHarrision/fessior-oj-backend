import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const SectionHeader = React.memo(function SectionHeader({ title, action, }) {
    return (_jsxs("div", { className: "flex items-center justify-between border-b border-charcoal pb-3 mb-4", children: [_jsx("span", { className: "font-display text-xs font-bold uppercase tracking-[0.15em] text-stone", children: title }), action && _jsx("div", { className: "shrink-0", children: action })] }));
});
