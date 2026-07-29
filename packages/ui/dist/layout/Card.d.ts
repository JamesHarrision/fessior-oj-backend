import type { ReactNode, HTMLAttributes } from 'react';
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    /** Visual variant */
    variant?: 'standard' | 'active';
    /** Enable hover lift effect */
    hover?: boolean;
}
export declare function Card({ children, variant, hover, className, ...rest }: CardProps): import("react").JSX.Element;
