import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Card } from './Card';
export const ContentCard = React.memo(function ContentCard({ children, className, onClick, hover = false, }) {
    return (_jsx(Card, { variant: "standard", hover: hover || !!onClick, className: className, onClick: onClick, children: children }));
});
