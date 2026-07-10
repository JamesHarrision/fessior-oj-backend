import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Avatar, Dropdown, Input, Badge } from 'antd';
import { BellOutlined, SearchOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppLogo } from '@ocj/ui';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Role } from '@ocj/types';
import { Swords, BookOpen, Trophy, Crown, Beaker, LayoutDashboard, ShoppingBag, Bot, Settings, UsersRound, Code2, ScrollText } from 'lucide-react';

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
  { key: '/match',       icon: <Swords size={18} />,           label: 'Lobby',        path: '/match',        section: 'main' },
  { key: '/editor',      icon: <Code2 size={18} />,            label: 'Editor',       path: '/editor',       section: 'main' },
  { key: '/problems',    icon: <BookOpen size={18} />,         label: 'Problems',     path: '/problems',     section: 'main' },
  { key: '/contest',     icon: <Trophy size={18} />,           label: 'Contests',     path: '/contest',      section: 'main' },
  { key: '/ranking',     icon: <Crown size={18} />,            label: 'Rankings',     path: '/ranking',      section: 'main' },

  // ── Community ──
  { key: '/custom-rooms', icon: <Beaker size={18} />,           label: 'Custom Arena', path: '/custom-rooms', section: 'community' },
  { key: '/submissions', icon: <ScrollText size={18} />,       label: 'Submissions',  path: '/submissions',  section: 'community' },
  { key: '/friends',     icon: <UsersRound size={18} />,        label: 'Friends',      path: '/friends',      section: 'community' },

  // ── Tools ──
  { key: '/shop',        icon: <ShoppingBag size={18} />,       label: 'Shop',         path: '/shop',         section: 'tools' },
  { key: '/ai',          icon: <Bot size={18} />,               label: 'AI Mentor',    path: '/ai',           section: 'tools' },
  { key: '/settings',    icon: <Settings size={18} />,          label: 'Settings',     path: '/settings',     section: 'tools' },
  { key: '/tester',      icon: <Beaker size={18} />,            label: 'API Tester',   path: '/tester',       section: 'tools' },

  // ── Admin ──
  { key: '/admin',       icon: <LayoutDashboard size={18} />,   label: 'Admin Panel',  path: '/admin/problems', section: 'tools', adminOnly: true },
];

const sectionLabels: Record<NavSection, string> = {
  main: 'MAIN',
  community: 'COMMUNITY',
  tools: 'TOOLS',
};

/* =====================================================
   Sidebar — 240px, Ink bg, Vermilion left-border active
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
    <aside className="flex flex-col h-screen bg-ink border-r border-charcoal overflow-y-auto">
      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-4">
        <AppLogo />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 space-y-5">
        {Array.from(grouped.entries()).map(([section, items]) => (
          <div key={section}>
            <div className="px-3 mb-2 font-display text-[10px] font-bold tracking-[0.15em] text-stone uppercase select-none">
              {sectionLabels[section]}
            </div>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const isActive = selectedKey === item.key || (item.key === '/admin' && selectedKey.startsWith('/admin'));
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer
                        border-l-[3px] border-l-transparent
                        ${isActive
                          ? 'border-l-vermilion bg-washi text-linen'
                          : 'text-stone hover:text-linen hover:bg-charcoal/40'
                        }
                      `}
                    >
                      <span className={isActive ? 'text-vermilion' : 'text-stone'}>
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
      <div className="px-3 pb-6 pt-3 border-t border-charcoal">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-charcoal/30">
          <Avatar
            size={36}
            src={user?.avatarUrl ?? user?.avatar_url}
            icon={<UserOutlined />}
            className="shrink-0 border border-charcoal"
          >
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-body text-sm font-semibold text-linen truncate">
              {user?.username ?? 'User'}
            </div>
            <div className="font-display text-xs text-stone truncate">
              {user?.eloRating ?? user?.elo_rating ?? 1000}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =====================================================
   TopBar — Washi bg, Charcoal border, mono styling
   ===================================================== */

function TopBar(props: {
  user: ReturnType<typeof useAuth>['user'];
  onLogout: () => void;
  notificationCount?: number;
  hideSearch?: boolean;
}) {
  const { user, onLogout, notificationCount = 0, hideSearch = false } = props;

  const userDropdownItems = [
    { key: 'profile', label: 'Tài khoản', icon: <UserOutlined /> },
    { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: onLogout },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-washi border-b border-charcoal shrink-0">
      {/* ── Search (hidden on Lobby) ── */}
      <div className="flex-1 max-w-lg">
        {!hideSearch && (
          <Input
            prefix={<SearchOutlined className="text-stone" />}
            placeholder="Search problems, contests, users..."
            variant="filled"
            className="[&_.ant-input]:!bg-ink [&_.ant-input]:!text-linen [&_.ant-input]:!placeholder-stone"
            size="large"
          />
        )}
      </div>

      {/* ── Right Section ── */}
      <div className="flex items-center gap-4 ml-6">
        {/* Rating — Washi fill, NO Vermilion fill for small text */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-washi border border-charcoal">
          <Crown size={14} className="text-stone" />
          <span className="font-display text-sm font-bold text-linen tabular-nums">
            {user?.eloRating ?? user?.elo_rating ?? 1000}
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-stone hover:text-linen transition-colors cursor-pointer"
          title="Notifications"
        >
          {notificationCount > 0 ? (
            <Badge count={notificationCount} size="small" offset={[-2, 2]}>
              <BellOutlined className="text-lg" />
            </Badge>
          ) : (
            <BellOutlined className="text-lg" />
          )}
        </button>

        {/* User Dropdown */}
        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-2.5 cursor-pointer px-2 py-1 hover:bg-charcoal/30 transition-colors">
            <Avatar
              size={32}
              src={user?.avatarUrl ?? user?.avatar_url}
              icon={<UserOutlined />}
              className="shrink-0"
            >
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="hidden md:block">
              <div className="font-body text-sm font-semibold text-linen leading-tight">
                {user?.username ?? 'User'}
              </div>
              <div className="font-body text-xs text-stone leading-tight">
                {user?.role === Role.ADMIN ? 'Admin' : 'Coder'}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}

/* =====================================================
   AppShellLayout — Ink shell, Washi top bar
   ===================================================== */

export function AppShellLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll notifications every 30s
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res.success && res.data) {
          const unread = res.data.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const selectedKey = ((): string => {
    const pathname = location.pathname;
    if (pathname.startsWith('/admin')) return '/admin';
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
    <div className="flex h-screen overflow-hidden bg-ink">
      {/* ── Sidebar: 240px (lg+), hidden on mobile (no hamburger yet) ── */}
      <div className="w-[240px] shrink-0 hidden lg:block">
        <Sidebar
          user={user}
          selectedKey={selectedKey}
          onNavigate={handleNavigate}
        />
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Bar ── */}
        <TopBar user={user} onLogout={handleLogout} notificationCount={unreadCount} hideSearch={location.pathname === '/match'} />

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto bg-ink">
          <div className="p-6 mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
