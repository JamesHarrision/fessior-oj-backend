import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Spin } from 'antd';
/* =====================================================
   LoadingScreen — Full-page loading with Vermilion spinner
   Ink background. AntD Spin is theme-overridden via ConfigProvider.
   ===================================================== */
export function LoadingScreen(props) {
    return (_jsx("div", { className: "min-h-screen w-full bg-ink text-linen font-body", children: _jsxs("div", { className: "mx-auto flex min-h-screen w-full max-w-[960px] flex-col items-center justify-center gap-5 px-8 py-10", children: [_jsx(Spin, { size: "large" }), _jsx("div", { className: "font-body text-sm text-stone", children: props.label ?? 'Đang tải…' })] }) }));
}
