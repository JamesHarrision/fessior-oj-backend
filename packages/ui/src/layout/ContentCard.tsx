import React from 'react';
import type { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const ContentCard = React.memo(function ContentCard({
  children,
  className,
  onClick,
  hover = false,
}: ContentCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const isLifted = isHovered && hover;
  const shadow = isLifted
    ? '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)'
    : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';

  return (
    <div
      className={className}
      style={{
        background: '#ffffff',
        borderRadius: 8,
        boxShadow: shadow,
        padding: 24,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        transform: isLifted ? 'translateY(-2px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
    >
      {children}
    </div>
  );
});
