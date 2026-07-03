import React from 'react';
import { Tag } from 'antd';

interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  ACCEPTED: { color: 'green', label: 'Accepted' },
  WA: { color: 'red', label: 'Wrong Answer' },
  TLE: { color: 'red', label: 'Time Limit Exceeded' },
  MLE: { color: 'red', label: 'Memory Limit Exceeded' },
  RE: { color: 'red', label: 'Runtime Error' },
  CE: { color: 'red', label: 'Compile Error' },
  PENDING: { color: 'blue', label: 'Pending' },
  PROCESSING: { color: 'yellow', label: 'Processing' },
  ERROR: { color: 'red', label: 'Error' },
};

export const StatusBadge = React.memo(function StatusBadge({
  status,
}: StatusBadgeProps) {
  const entry = STATUS_MAP[status];
  return (
    <Tag color={entry?.color ?? 'default'}>{entry?.label ?? status}</Tag>
  );
});
