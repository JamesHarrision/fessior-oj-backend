import type { ReactNode } from 'react';
import { Layout, Menu, Typography, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  CrownOutlined,
  ExperimentOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ShopOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AppLogo } from '@ocj/ui';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content } = Layout;

type NavKey =
  | '/match'
  | '/custom-rooms'
  | '/problems'
  | '/contest'
  | '/ranking'
  | '/shop'
  | '/submissions'
  | '/ai'
  | '/settings'
  | '/tester'
  | '/admin';

const navItems: Array<{ key: NavKey; icon: ReactNode; label: ReactNode }> = [
  { key: '/match', icon: <PlayCircleOutlined />, label: <Link to="/match">Lobby</Link> },
  { key: '/custom-rooms', icon: <ExperimentOutlined />, label: <Link to="/custom-rooms">Custom Arena</Link> },
  { key: '/problems', icon: <BookOutlined />, label: <Link to="/problems">Problems</Link> },
  { key: '/contest', icon: <TrophyOutlined />, label: <Link to="/contest">Contests</Link> },
  { key: '/ranking', icon: <CrownOutlined />, label: <Link to="/ranking">Rankings</Link> },
  { key: '/shop', icon: <ShopOutlined />, label: <Link to="/shop">Shop</Link> },
  { key: '/submissions', icon: <DashboardOutlined />, label: <Link to="/submissions">Submissions</Link> },
  { key: '/ai', icon: <ExperimentOutlined />, label: <Link to="/ai">AI</Link> },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
  { key: '/tester', icon: <DashboardOutlined />, label: <Link to="/tester">API Tester</Link> },
];

export function AppShellLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  const selectedKey = ((): NavKey => {
    const pathname = location.pathname as string;
    if (pathname.startsWith('/admin')) return '/admin';
    const item = navItems.find((x) => pathname === x.key);
    return item?.key ?? '/match';
  })();

  const items = [...navItems];
  if (user?.role === 'ADMIN') {
    items.push({ key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin/problems">Admin</Link> });
  }

  return (
    <Layout className="min-h-screen bg-slate-950">
      <Sider
        width={260}
        theme="dark"
        className="!bg-slate-950 border-r border-white/10"
        breakpoint="lg"
        collapsedWidth={84}
      >
        <div className="px-5 py-5">
          <AppLogo />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          className="!bg-slate-950"
          items={items.map((i) => ({ key: i.key, icon: i.icon, label: i.label }))}
        />
      </Sider>
      <Layout>
        <Header className="!bg-slate-950 border-b border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Typography.Text className="!text-slate-200">{location.pathname}</Typography.Text>
          </div>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: 'Tài khoản', icon: <UserOutlined /> },
                { type: 'divider' },
                { key: 'logout', label: 'Đăng xuất', onClick: () => void logout() },
              ],
            }}
            trigger={['click']}
          >
            <a onClick={(e) => e.preventDefault()} className="text-slate-200">
              <Space>
                <UserOutlined />
                <span className="text-sm">{user?.username ?? 'User'}</span>
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content className="p-6">
          <div className={isAdminPath ? 'w-full max-w-none' : 'mx-auto w-full max-w-6xl'}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
