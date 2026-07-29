import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const LABELS = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
};
const LETTERS = {
    EASY: 'E',
    MEDIUM: 'M',
    HARD: 'H',
};
export const DifficultyBadge = React.memo(function DifficultyBadge({ difficulty, size = 'default', }) {
    const isSmall = size === 'small';
    const letter = LETTERS[difficulty];
    return (_jsx("span", { title: LABELS[difficulty], className: `
        inline-flex items-center justify-center font-display font-bold uppercase
        bg-washi border border-charcoal text-linen
        ${isSmall ? 'text-[10px] px-1.5 py-0 leading-none' : 'text-xs px-2.5 py-1'}
      `, children: letter }));
});
