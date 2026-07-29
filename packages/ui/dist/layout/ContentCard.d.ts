import React from 'react';
import type { ReactNode } from 'react';
interface ContentCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}
export declare const ContentCard: React.NamedExoticComponent<ContentCardProps>;
export {};
