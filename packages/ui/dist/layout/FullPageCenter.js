import { jsx as _jsx } from "react/jsx-runtime";
/* =====================================================
   FullPageCenter — Full-page centered container
   Ink background, no AntD dependency
   ===================================================== */
export function FullPageCenter(props) {
    return (_jsx("div", { className: "min-h-screen w-full bg-ink text-linen font-body", children: _jsx("div", { className: "mx-auto flex min-h-screen w-full max-w-[960px] items-center justify-center px-8 py-10", children: props.children }) }));
}
