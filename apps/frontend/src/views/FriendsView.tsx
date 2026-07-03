import { Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { EmptyState, PageHeader } from '@ocj/ui';

const { Text } = Typography;

export function FriendsView() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Friends"
        subtitle="Manage your friends, send requests, and connect with fellow coders"
      />

      <div className="bg-white rounded-xl border border-surface-200 shadow-card p-12">
        <EmptyState
          icon={<TeamOutlined style={{ fontSize: 56, color: '#94A3B8' }} />}
          title="Coming Soon"
          description="The friends & social features are being built. Stay tuned!"
        />
      </div>
    </div>
  );
}
