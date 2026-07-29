import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, variant = 'standard', hover = false, className = '', ...rest }) {
    const base = 'bg-washi border border-charcoal p-6';
    const active = variant === 'active' ? 'border-l-[3px] border-l-vermilion' : '';
    const h = hover ? 'cursor-pointer transition-colors hover:border-stone' : '';
    return (_jsx("div", { className: `${base} ${active} ${h} ${className}`, ...rest, children: children }));
}
