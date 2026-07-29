import React from 'react';
import type { ReactNode } from 'react';
interface TrendInfo {
    value: number;
    isUp: boolean;
}
interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: TrendInfo;
}
export declare const StatCard: React.NamedExoticComponent<StatCardProps>;
export {};
