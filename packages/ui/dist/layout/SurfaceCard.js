import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from './Card';
/* =====================================================
   SurfaceCard — backward-compatible wrapper over Card
   API unchanged: { title?, children, className? }
   ===================================================== */
export function SurfaceCard(props) {
    return (_jsxs(Card, { className: props.className, children: [props.title && (_jsx("div", { className: "font-display text-sm font-bold uppercase tracking-[0.12em] text-stone mb-4", children: props.title })), props.children] }));
}
