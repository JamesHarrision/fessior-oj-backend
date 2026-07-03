import React from 'react';
import type { ReactNode } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export const SectionHeader = React.memo(function SectionHeader({
  title,
  action,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        marginBottom: 16,
        borderBottom: '1px solid rgba(148,163,184,0.18)',
      }}
    >
      <Text
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: 12,
          fontWeight: 600,
          color: '#64748b',
        }}
      >
        {title}
      </Text>
      {action && <div>{action}</div>}
    </div>
  );
});
