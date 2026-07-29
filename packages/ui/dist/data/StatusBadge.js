import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const LABELS = {
    ACCEPTED: 'Accepted',
    WA: 'Wrong Answer',
    TLE: 'Time Limit',
    MLE: 'Memory Limit',
    RE: 'Runtime Error',
    CE: 'Compile Error',
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    ERROR: 'Error',
};
export const StatusBadge = React.memo(function StatusBadge({ status, }) {
    const label = LABELS[status] ?? status;
    // ACCEPTED: Vermilion outline — the only accent moment
    if (status === 'ACCEPTED') {
        return (_jsx("span", { className: "inline-flex items-center font-display text-xs font-bold uppercase text-vermilion border border-vermilion px-2.5 py-1", children: label }));
    }
    // PENDING / PROCESSING: animated pulse
    if (status === 'PENDING' || status === 'PROCESSING') {
        return (_jsx("span", { className: "inline-flex items-center font-display text-xs font-bold uppercase text-stone px-2.5 py-1 animate-pulse-soft", children: label }));
    }
    // Everything else: standard badge
    return (_jsx("span", { className: "inline-flex items-center font-display text-xs font-bold uppercase bg-washi border border-charcoal text-linen px-2.5 py-1", children: label }));
});
