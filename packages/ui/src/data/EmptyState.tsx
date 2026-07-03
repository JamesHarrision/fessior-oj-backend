import React from 'react';
import type { ReactNode } from 'react';
import { Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = React.memo(function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }}>
        {icon ?? <BookOutlined />}
      </div>
      <Title level={4} style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>
        {title}
      </Title>
      {description && (
        <Paragraph
          type="secondary"
          style={{ textAlign: 'center', maxWidth: 400, marginTop: 8 }}
        >
          {description}
        </Paragraph>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
});
