import React from 'react';
import type { ReactNode } from 'react';
interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}
export declare const EmptyState: React.NamedExoticComponent<EmptyStateProps>;
export {};
