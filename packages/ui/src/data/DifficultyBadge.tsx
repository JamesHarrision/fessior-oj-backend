import React from 'react';
import { Tag, Tooltip } from 'antd';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'small' | 'default';
}

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; label: string }> = {
  EASY: { color: 'green', label: 'Easy' },
  MEDIUM: { color: 'orange', label: 'Medium' },
  HARD: { color: 'red', label: 'Hard' },
};

export const DifficultyBadge = React.memo(function DifficultyBadge({
  difficulty,
  size = 'default',
}: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <Tooltip title={config.label}>
      <Tag
        color={config.color}
        style={size === 'small' ? { fontSize: 12, lineHeight: '18px' } : undefined}
      >
        {difficulty[0]}
      </Tag>
    </Tooltip>
  );
});
