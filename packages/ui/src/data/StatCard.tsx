import React from 'react';
import type { ReactNode } from 'react';
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

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

export const StatCard = React.memo(function StatCard({
  label,
  value,
  icon,
  trend,
}: StatCardProps) {
  return (
    <Card styles={{ body: { padding: 20 } }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>
            {value}
          </div>
          {trend && (
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: trend.isUp ? '#16a34a' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {trend.isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {trend.value}%
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: 24, color: '#94a3b8' }}>{icon}</div>}
      </div>
    </Card>
  );
});
