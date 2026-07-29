import React from 'react';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
interface DifficultyBadgeProps {
    difficulty: Difficulty;
    size?: 'small' | 'default';
}
export declare const DifficultyBadge: React.NamedExoticComponent<DifficultyBadgeProps>;
export {};
