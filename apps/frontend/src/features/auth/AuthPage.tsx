import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Input, Segmented } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, ThunderboltFilled, UserCheck, Flame, Trophy } from '@ant-design/icons';
import { AppLogo } from '@ocj/ui';
import { validateEmail, validateUsername, checkPasswordStrength } from '@ocj/validators';
import { parseErrorMessage } from '@ocj/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

/* ══════════════════════════════════════════════════════════
   Dot Grid Background (CSS-only animated canvas)
   ══════════════════════════════════════════════════════════ */

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Animated glow orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse-slow" />
      <div className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full bg-navy-600/20 blur-[140px]" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Terminal Preview — code snippet with verdict
   ══════════════════════════════════════════════════════════ */

function TerminalPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#060b14] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 text-xs text-surface-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          two-sum.cpp
        </span>
      </div>

      {/* Code + Verdict */}
      <div className="grid grid-cols-[1fr_180px]">
        <pre
          className="h-[172px] overflow-hidden p-4 text-[12px] leading-[1.7] text-slate-300"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <span className="text-surface-500">{'// O(n) solution\n'}</span>
          <span className="text-violet-300">{'int'}</span>{' '}
          <span className="text-amber-300">{'solve'}</span>
          <span>(</span>
          <span className="text-violet-300">{'vector'}</span>
          <span>{'<int>& a, '}</span>
          <span className="text-violet-300">{'int'}</span>
          <span>{' target)'}</span>
          {' {'}
          {'\n'}  <span className="text-violet-300">{'unordered_map'}</span>
          <span>{'<int,int> seen;\n'}</span>
          {'\n'}  <span className="text-cyan-300">{'for'}</span>
          <span>{' (</span>
          <span className="text-violet-300">{'int'}</span>
          <span>{' i=0; i<a.size(); ++i) {'}</span>
          {'\n'}    <span className="text-violet-300">{'int'}</span>
          <span>{' need = target - a[i];\n'}</span>
          <span className="text-surface-500">{'    // ...\n'}</span>
          <span className="text-cyan-300">{'  return'}</span>
          <span>{' i;\n'}</span>
          {'  }\n'}
          {'}\n'}
          <span className="terminal-cursor" />
        </pre>

        {/* Verdict panel */}
        <div className="border-l border-white/[0.06] bg-white/[0.025] p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <CheckCircleFilled />
            <span className="text-sm font-semibold">Accepted</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              ['Runtime', '42 ms'],
              ['Memory', '12.8 MB'],
              ['Tests', '24 / 24'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-surface-500">{label}</span>
                <span className="text-slate-200 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Live Stats Strip
   ══════════════════════════════════════════════════════════ */

function LiveStats() {
  const stats = [
    { icon: <UserCheck />, label: 'Active Coders', value: '1,482' },
    { icon: <Flame />, label: 'Streak Record', value: '07 days' },
    { icon: <Trophy />, label: 'Rank', value: '#128' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm px-4 py-3.5 hover:bg-white/[0.05] hover:border-emerald-500/20 transition-all duration-300"
        >
          <div className="flex items-center gap-2 text-surface-400 mb-1.5 text-[11px] uppercase tracking-wider font-medium">
            <span className="text-emerald-400/70">{s.icon}</span>
            {s.label}
          </div>
          <div className="text-2xl font-bold text-slate-50" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Trust Badges
   ══════════════════════════════════════════════════════════ */

function TrustBadges() {
  const badges = ['Repository API', 'React Query', 'Zustand', 'Ant Design', 'Tailwind CSS', 'Monaco Editor'];

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b}
          className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[11px] text-surface-400 font-medium tracking-wide hover:border-emerald-500/20 hover:text-slate-200 transition-colors duration-300"
        >
          {b}
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   AuthPage — Main Component
   ══════════════════════════════════════════════════════════ */

export function AuthPage() {
  const navigate = useNavigate();
  const { token, user, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthed = Boolean(token && user);

  const title = useMemo(() => (mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'), [mode]);

  useEffect(() => {
    if (isAuthed) navigate('/match', { replace: true });
  }, [isAuthed, navigate]);

  const handleFinish = async (values: { email: string; password: string; username?: string }) => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(values.email, values.password);
        navigate('/match', { replace: true });
        return;
      }
      const username = values.username?.trim() ?? '';
      if (!validateUsername(username)) {
        setError('Tên hiển thị không hợp lệ (3-30 ký tự, chữ/số/_).');
        return;
      }
      if (!validateEmail(values.email)) {
        setError('Email không hợp lệ.');
        return;
      }
      const strength = checkPasswordStrength(values.password);
      if (!strength.isStrong) {
        setError(`Mật khẩu quá yếu: ${strength.feedback.join(' ')}`);
        return;
      }
      await register(username, values.email, values.password);
      setMode('login');
      setError('Đăng ký thành công. Hãy đăng nhập.');
    } catch (e) {
      setError(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-navy-900 flex items-center overflow-hidden">
      <DotGrid />

      {/* ═══ Main Grid: Hero (left) + Form (right) ═══ */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-20 items-center">

          {/* ═══════════════ LEFT: HERO ═══════════════ */}
          <div className="space-y-10 animate-slide-in-left">
            {/* Logo */}
            <div className="stagger-1 animate-fade-in-up">
              <AppLogo />
            </div>

            {/* Hero Copy */}
            <div className="stagger-2 animate-fade-in-up space-y-5 max-w-[560px]">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 text-xs font-semibold text-emerald-300">
                <ThunderboltFilled className="text-emerald-400" />
                Realtime PvP Coding Arena
              </div>

              <h1
                className="text-[42px] sm:text-[52px] lg:text-[60px] font-bold leading-[1.04] tracking-[-0.03em] text-slate-50"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                Code.
                <br />
                Submit.
                <br />
                <span className="text-emerald-400">Conquer.</span>
              </h1>

              <p className="text-[15px] leading-7 text-surface-400 max-w-[460px]">
                Vào lobby, nhận bài, chạy test, submit và xem verdict realtime trong cùng một flow. Nơi mọi coder đều có thể leo rank.
              </p>
            </div>

            {/* Live Stats */}
            <div className="stagger-3 animate-fade-in-up max-w-[520px]">
              <LiveStats />
            </div>

            {/* Terminal Preview */}
            <div className="stagger-4 animate-fade-in-up max-w-[620px]">
              <TerminalPreview />
            </div>

            {/* Trust Badges */}
            <div className="stagger-5 animate-fade-in-up">
              <TrustBadges />
            </div>
          </div>

          {/* ═══════════════ RIGHT: AUTH FORM ═══════════════ */}
          <div className="animate-scale-in stagger-3">
            <div className="glass-card p-8 sm:p-10">
              {/* Header */}
              <div className="mb-7">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">
                  Member Access
                </div>
                <h2
                  className="text-[28px] font-semibold text-slate-50 mb-2"
                  style={{ fontFamily: "'Clash Display', sans-serif" }}
                >
                  {title}
                </h2>
                <p className="text-sm text-surface-400 leading-relaxed">
                  {mode === 'login'
                    ? 'Tiếp tục phiên luyện tập hoặc vào hàng chờ PvP.'
                    : 'Tạo hồ sơ để lưu rank, submissions và inventory.'}
                </p>
              </div>

              {/* Mode Toggle */}
              <Segmented<AuthMode>
                block
                value={mode}
                onChange={(v) => {
                  setMode(v);
                  setError(null);
                }}
                className="mb-6 w-full"
                options={[
                  { label: 'Login', value: 'login' },
                  { label: 'Register', value: 'register' },
                ]}
              />

              {/* Error / Success */}
              {error && (
                <Alert
                  type={error.includes('thành công') ? 'success' : 'error'}
                  message={error}
                  showIcon
                  className="mb-5 animate-fade-in"
                />
              )}

              {/* Form */}
              <Form
                className="ocj-auth-form"
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false}
                size="large"
              >
                {mode === 'register' && (
                  <Form.Item
                    label={<span className="text-surface-300 text-xs font-medium uppercase tracking-wider">Username</span>}
                    name="username"
                    rules={[{ required: true, message: 'Nhập tên hiển thị' }]}
                  >
                    <Input
                      placeholder="luffy_gear5"
                      autoComplete="nickname"
                      className="!h-12 !rounded-xl"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label={<span className="text-surface-300 text-xs font-medium uppercase tracking-wider">Email</span>}
                  name="email"
                  rules={[{ required: true, message: 'Nhập email' }]}
                >
                  <Input
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="!h-12 !rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-surface-300 text-xs font-medium uppercase tracking-wider">Password</span>}
                  name="password"
                  rules={[{ required: true, message: 'Nhập mật khẩu' }]}
                >
                  <Input.Password
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="!h-12 !rounded-xl"
                  />
                </Form.Item>

                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  loading={loading}
                  block
                  icon={<ArrowRightOutlined />}
                  className="!h-12 !rounded-xl !text-base !font-semibold animate-pulse-glow mt-2"
                >
                  {mode === 'login' ? 'Vào đấu trường' : 'Tạo tài khoản'}
                </Button>
              </Form>

              {/* Footer hint */}
              <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 text-[11px] leading-5 text-surface-500 text-center">
                Backend: <span className="font-medium text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>localhost:6868</span>
                {' · '}
                Seed admin để test quyền quản trị
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
