import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Avatar, Dropdown, Badge } from 'antd';
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import LogoImage from '../../assets/Logo.png';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Role } from '@ocj/types';
import { Home, Share2, Map, Handshake, BookOpen, Sparkles, Crown, LayoutDashboard } from 'lucide-react';

/* =====================================================
   Navigation Items
   ===================================================== */

type NavSection = 'main';

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
  { key: '/home', icon: <Home size={22} />, label: 'Home', path: '/home', section: 'main' },
  { key: '/chat', icon: <Share2 size={22} />, label: "Arya's Space", path: '/chat', section: 'main' },
  { key: '/ai', icon: <Map size={22} />, label: 'Roadmap', path: '/ai', section: 'main' },
  { key: '/match', icon: <Handshake size={22} />, label: 'Solo Code 1vs1', path: '/match', section: 'main' },
  { key: '/editor', icon: <BookOpen size={22} />, label: 'Code Editor', path: '/editor', section: 'main' },
  { key: '/interview', icon: <Sparkles size={22} />, label: 'Mock Interview', path: '/interview', section: 'main' },
];

/* =====================================================
   Sidebar — 240px, Ink bg, Vermilion left-border active
   ===================================================== */

function Sidebar(props: {
  user: ReturnType<typeof useAuth>['user'];
  selectedKey: string;
  onNavigate: (path: string) => void;
}) {
  const { user, selectedKey, onNavigate } = props;

  return (
    <aside className="absolute top-0 left-0 h-full bg-washi border-r border-charcoal overflow-y-auto overflow-x-hidden w-[64px] hover:w-[260px] group transition-all duration-300 flex flex-col hover:shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-30">
      {/* ── Navigation ── */}
      <nav className="flex-1 pt-6 pb-4">
        <ul className="space-y-1.5 px-2">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== Role.ADMIN) return null;
            const isActive = selectedKey === item.key || (item.key === '/admin' && selectedKey.startsWith('/admin'));
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-4 pl-[13px] pr-4 py-3 text-[15px] font-semibold transition-colors cursor-pointer rounded-xl
                    ${isActive
                      ? 'bg-charcoal/20 text-linen'
                      : 'text-stone hover:bg-charcoal/10 hover:text-linen'
                    }
                  `}
                >
                  <span className={isActive ? 'text-linen shrink-0' : 'text-stone shrink-0'}>
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </span>
                  {item.badge != null && item.badge > 0 && (
                    <Badge count={item.badge} size="small" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User Profile (bottom) ── */}
      <div
        className="px-[14px] pb-6 pt-3 border-t border-charcoal cursor-pointer hover:bg-washi/5 transition-colors overflow-hidden"
        onClick={() => onNavigate(`/profile/${user?.username}`)}
      >
        <div className="flex items-center gap-3 py-2.5">
          <Avatar
            size={36}
            src={user?.avatar || user?.avatarUrl || (user as any)?.avatar_url}
            icon={<UserOutlined />}
            className="shrink-0 border border-charcoal"
          >
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div className="min-w-0 flex-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
  onNavigateProfile: () => void;
  onNavigateSettings: () => void;
  notificationCount?: number;
  hideSearch?: boolean;
}) {
  const { user, onLogout, onNavigateProfile, onNavigateSettings, notificationCount = 0, hideSearch = false } = props;
  const { theme, toggleTheme } = useTheme();

  const userDropdownItems = [
    { key: 'profile', label: 'Tài khoản', icon: <UserOutlined />, onClick: onNavigateProfile },
    { key: 'settings', label: 'Cài đặt', icon: <SettingOutlined />, onClick: onNavigateSettings },
    { key: 'theme', label: theme === 'dark' ? 'Chế độ Sáng' : 'Chế độ Tối', icon: theme === 'dark' ? <SunOutlined /> : <MoonOutlined />, onClick: toggleTheme },
    ...(user?.role === Role.ADMIN ? [{ key: 'admin', label: 'Trang Quản trị', icon: <LayoutDashboard size={14} />, onClick: () => window.location.href = '/admin' }] : []),
    { type: 'divider' as const },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: onLogout },
  ];

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-washi border-b border-charcoal shrink-0">
      {/* ── Logo ── */}
      <div
        className="flex items-center cursor-pointer shrink-0"
        onClick={() => window.location.href = '/home'}
      >
        <img src={LogoImage} alt="Logo" className="h-[42px] w-auto object-contain" />
      </div>

      {/* ── Top Navigation Links ── */}
      <nav className="flex-1 flex items-center gap-8 ml-10">
        {[
          { id: 1, label: 'Problems', url: '/problems' },
          { id: 2, label: 'Rooms', url: '/custom-rooms' },
          { id: 3, label: 'Submissions', url: '/submissions' },
          { id: 4, label: 'Ranking', url: '/ranking' },
          { id: 5, label: 'About', url: '/about' },
          { id: 6, label: 'Report', url: '/report' },
        ].map(item => (
          <NavLink
            key={item.id}
            to={item.url}
            className={({ isActive }) =>
              `text-[16px] font-semibold transition-colors ${isActive ? 'text-linen' : 'text-stone hover:text-linen'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

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
        <Dropdown
          menu={{
            items: [
              {
                key: 'header',
                label: <div className="font-display font-bold text-linen px-2 py-1 border-b border-charcoal">Thông báo</div>,
                disabled: true,
              },
              {
                key: 'empty',
                label: <div className="text-stone text-xs text-center py-4">Chưa có thông báo mới</div>,
                disabled: true,
              }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
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
        </Dropdown>

        {/* User Dropdown */}
        <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-2.5 cursor-pointer px-2 py-1 hover:bg-charcoal/30 transition-colors">
            <Avatar
              size={32}
              src={user?.avatar || user?.avatarUrl || (user as any)?.avatar_url}
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
    return match?.key ?? '/home';
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
    <div className="flex flex-col h-screen overflow-hidden bg-ink">
      {/* ── Top Bar ── */}
      <TopBar
        user={user}
        onLogout={handleLogout}
        onNavigateProfile={() => handleNavigate(`/profile/${user?.username}`)}
        onNavigateSettings={() => handleNavigate('/settings')}
        notificationCount={unreadCount}
        hideSearch={location.pathname === '/match' || location.pathname === '/home'}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: collapsible 64px -> 260px ── */}
        <div className="w-[64px] shrink-0 hidden lg:block relative z-30">
          <Sidebar
            user={user}
            selectedKey={selectedKey}
            onNavigate={handleNavigate}
          />
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-ink">
          <main className="flex-1 flex flex-col overflow-y-auto">
            <div className={
              location.pathname.startsWith('/chat') || location.pathname.startsWith('/ai')
                ? "flex-1 w-full h-full"
                : "p-6 mx-auto w-full max-w-7xl"
            }>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
