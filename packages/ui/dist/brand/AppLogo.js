import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* =====================================================
   AppLogo — Queu Arena brand mark (Ink & Vermillion)
   ===================================================== */
export function AppLogo(props) {
    const variant = props.variant ?? 'full';
    return (_jsxs("div", { className: "inline-flex items-center gap-2.5 select-none", children: [_jsx("div", { className: "relative grid h-10 w-10 place-items-center rounded-[3px] bg-charcoal", children: _jsx("div", { className: "h-3 w-3 bg-vermilion rotate-45" }) }), variant === 'full' && (_jsxs("div", { className: "flex flex-col leading-none", children: [_jsx("div", { className: "font-display text-[15px] font-bold tracking-tight text-linen", children: "QUEU" }), _jsx("div", { className: "font-display text-[10px] font-bold tracking-[0.2em] text-vermilion uppercase", children: "ARENA" })] }))] }));
}
