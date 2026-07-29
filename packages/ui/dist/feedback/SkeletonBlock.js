import { jsx as _jsx } from "react/jsx-runtime";
export function SkeletonBlock({ width = '100%', height = 16, rounded = false, className = '' }) {
    const w = typeof width === 'number' ? `${width}px` : width;
    const h = typeof height === 'number' ? `${height}px` : height;
    return (_jsx("div", { className: `animate-pulse bg-charcoal/50 ${rounded ? 'rounded-full' : 'rounded'} ${className}`, style: { width: w, height: h } }));
}
