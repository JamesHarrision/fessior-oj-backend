import { type ReactNode, useCallback } from 'react';
import { Avatar, Button, Dropdown, Input, Typography, Badge, Tooltip } from 'antd';
import {
  BookOutlined,
  CrownOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
  TrophyOutlined,
  UserOutlined,
  ThunderboltOutlined,
  BellOutlined,
  SearchOutlined,
  RobotOutlined,
  CodeOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppLogo } from '@ocj/ui';
import { useAuth } from '../../context/AuthContext';
import { Role } from '@ocj/types';

const { Text } = Typography;

/* =====================================================
   Navigation Items
   ===================================================== */

type NavSection = 'main' | 'community' | 'tools';

interface NavItem {
  key: string;
  icon: ReactNode;
  label: string;
  path: string;
  section: NavSection;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  // ── Main ──
  { key: '/match',       icon: <ThunderboltOutlined />, label: 'Lobby',        path: '/match',        section: 'main' },
  { key: '/editor',      icon: <CodeOutlined />,         label: 'Editor',       path: '/editor',       section: 'main' },
  { key: '/problems',    icon: <BookOutlined />,         label: 'Problems',     path: '/problems',     section: 'main' },
  { key: '/contest',     icon: <TrophyOutlined />,       label: 'Contests',     path: '/contest',      section: 'main' },
  { key: '/ranking',     icon: <CrownOutlined />,        label: 'Rankings',     path: '/ranking',      section: 'main' },

  // ── Community ──
  { key: '/custom-rooms', icon: <ExperimentOutlined />,   label: 'Custom Arena', path: '/custom-rooms', section: 'community' },
  { key: '/submissions', icon: <DashboardOutlined />,    label: 'Submissions',  path: '/submissions',  section: 'community' },
  { key: '/friends',     icon: <TeamOutlined />,          label: 'Friends',      path: '/friends',      section: 'community' },

  // ── Tools ──
  { key: '/shop',        icon: <ShopOutlined />,         label: 'Shop',         path: '/shop',         section: 'tools' },
  { key: '/ai',          icon: <RobotOutlined />,        label: 'AI Mentor',    path: '/ai',           section: 'tools' },
  { key: '/settings',    icon: <SettingOutlined />,       label: 'Settings',     path: '/settings',     section: 'tools' },
  { key: '/tester',      icon: <ExperimentOutlined />,   label: 'API Tester',   path: '/tester',       section: 'tools' },

  // ── Admin ──
  { key: '/admin',       icon: <DashboardOutlined />,    label: 'Admin Panel',  path: '/admin/problems', section: 'tools', adminOnly: true },
];

const sectionLabels: Record<NavSection, string> = {
  main: 'MAIN',
  community: 'COMMUNITY',
  tools: 'TOOLS',
};

/* =====================================================
   Sidebar Component (extracted for clarity)
   ===================================================== */

function Sidebar(props: {
  user: ReturnType<typeof useAuth>['user'];
  selectedKey: string;
  onNavigate: (path: string) => void;
}) {
  const { user, selectedKey, onNavigate } = props;

  const grouped = new Map<NavSection, NavItem[]>();
  for (const item of navItems) {
    if (item.adminOnly && user?.role !== Role.ADMIN) continue;
    const grp = grouped.get(item.section) ?? [];
    grp.push(item);
    grouped.set(item.section, grp);
  }

  return (
    <aside className="ocj-sidebar flex flex-col h-screen bg-navy-850 border-r border-white/[0.06] overflow-y-auto">
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4">
        <AppLogo />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-5">
        {Array.from(grouped.entries()).map(([section, items]) => (
          <div key={section}>
            <Text className="block px-3 mb-2 text-[10px] font-bold tracking-[0.15em] text-surface-500 uppercase select-none">
              {sectionLabels[section]}
            </Text>
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = selectedKey === item.key || (item.key === '/admin' && selectedKey.startsWith('/admin'));
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                        ${isActive
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                          : 'text-surface-300 hover:text-surface-100 hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      <span className={`text-lg ${isActive ? 'text-emerald-400' : 'text-surface-400'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <Badge count={item.badge} size="small" className="ml-auto" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── User Profile (bottom) ── */}
      <div className="px-3 pb-6 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03]">
          <Avatar
            size={36}
            src={user?.avatarUrl ?? user?.avatar_url}
            icon={<UserOutlined />}
            className="shrink-0 border border-white/10"
          >
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="min-w-0 flex-1">
            <Text className="block text-sm font-semibold text-surface-100 truncate">
              {user?.username ?? 'User'}
            </Text>
            <Text className="block text-xs text-surface-500 truncate">
              Rating: {user?.eloRating ?? user?.elo_rating ?? 1000}
            </Text>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =====================================================
   TopBar Component
   ===================================================== */

function TopBar(props: {
  user: ReturnType<typeof useAuth>['user'];
  onLogout: () => void;
  notificationCount?: number;
}) {
  const { user, onLogout, notificationCount = 0 } = props;

  const userDropdownItems = [
    { key: 'profile', label: 'Tài khoản', icon: <UserOutlined /> },
    { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: onLogout },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-surface-200">
      {/* ── Search ── */}
      <div className="flex-1 max-w-lg">
        <Input
          prefix={<SearchOutlined className="text-surface-400" />}
          placeholder="Search problems, contests, users..."
          variant="filled"
          className="!bg-surface-50 hover:!bg-surface-100 !border-surface-200"
          size="large"
        />
      </div>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-4 ml-6">
        {/* Competitive Rating */}
        <Tooltip title="Competitive Rating">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <CrownOutlined className="text-amber-500" />
            <Text className="text-sm font-bold text-emerald-700">
              {user?.eloRating ?? user?.elo_rating ?? 1000}
            </Text>
          </div>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <Button
            type="text"
            icon={
              <Badge count={notificationCount} size="small" offset={[-2, 2]}>
                <BellOutlined className="text-surface-500 text-lg" />
              </Badge>
            }
            className="!text-surface-500 hover:!text-navy-850"
          />
        </Tooltip>

        {/* User Dropdown */}
        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-2.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-surface-50 transition-colors">
            <Avatar
              size={32}
              src={user?.avatarUrl ?? user?.avatar_url}
              icon={<UserOutlined />}
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="hidden md:block text-right">
              <Text className="block text-sm font-semibold text-navy-850 leading-tight">
                {user?.username ?? 'User'}
              </Text>
              <Text className="block text-xs text-surface-500 leading-tight">
                {user?.role === Role.ADMIN ? 'Admin' : 'Coder'}
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

/* =====================================================
   AppShellLayout
   ===================================================== */

export function AppShellLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = ((): string => {
    const pathname = location.pathname;
    if (pathname.startsWith('/admin')) return '/admin';
    // Match longest prefix first
    const sorted = [...navItems].sort((a, b) => b.key.length - a.key.length);
    const match = sorted.find((x) => pathname.startsWith(x.key));
    return match?.key ?? '/match';
  })();

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/auth', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-[260px] shrink-0 hidden lg:block">
        <Sidebar
          user={user}
          selectedKey={selectedKey}
          onNavigate={handleNavigate}
        />
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface-50">
        {/* ── Top Bar ── */}
        <TopBar user={user} onLogout={handleLogout} />

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
