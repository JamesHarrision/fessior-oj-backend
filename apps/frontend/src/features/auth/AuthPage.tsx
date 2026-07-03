import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { ArrowRightOutlined, ThunderboltFilled } from '@ant-design/icons';
import { AppLogo } from '@ocj/ui';
import { validateEmail, validateUsername, checkPasswordStrength } from '@ocj/validators';
import { parseErrorMessage } from '@ocj/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

/* ─── Background Canvas ─── */

function Canvas() {
  const lines = [
    { text: 'ACCEPTED  two-sum.cpp  42ms  12.8MB', color: 'text-emerald-400', indent: 0 },
    { text: 'PENDING   merge-sort.py  —     —',     color: 'text-amber-400',  indent: 2 },
    { text: 'WA        binary-search.java  3ms  8.1MB', color: 'text-red-400',  indent: 4 },
    { text: 'ACCEPTED  bfs-graph.cpp  18ms  22.3MB', color: 'text-emerald-400', indent: 1 },
    { text: 'TLE       fibonacci.py  2001ms  256MB', color: 'text-red-400',  indent: 3 },
    { text: 'PROCESSING  dp-knapsack.py  —     —',  color: 'text-amber-400',  indent: 0 },
    { text: 'ACCEPTED  quick-sort.java  6ms  11.2MB', color: 'text-emerald-400', indent: 5 },
    { text: 'COMPILE_ERROR  syntax.cpp  —     —',   color: 'text-red-400',  indent: 2 },
    { text: 'ACCEPTED  dijkstra.py  31ms  18.9MB',   color: 'text-emerald-400', indent: 1 },
    { text: 'ACCEPTED  linked-list.c  2ms  4.1MB',    color: 'text-emerald-400', indent: 0 },
    { text: 'WA        prime-check.cpp  12ms  8.4MB', color: 'text-red-400',  indent: 3 },
    { text: 'ACCEPTED  n-queens.py  47ms  25.7MB',    color: 'text-emerald-400', indent: 4 },
    { text: 'PENDING   palindrome.java  —     —',     color: 'text-amber-400',  indent: 1 },
    { text: 'ACCEPTED  trie-search.cpp  9ms  5.3MB',  color: 'text-emerald-400', indent: 2 },
    { text: 'MLE        large-array.py  145ms  512MB', color: 'text-red-400',  indent: 0 },
    { text: 'ACCEPTED  sliding-window.java  22ms  14.1MB', color: 'text-emerald-400', indent: 3 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      }} />

      {/* Live Judge Feed */}
      <div className="absolute inset-y-0 right-0 w-[480px] flex flex-col justify-center opacity-[0.12]">
        <div className="space-y-1 px-8">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`font-mono text-[11px] leading-relaxed ${line.color}`}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                paddingLeft: `${line.indent * 16}px`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0,
                animation: 'fade-in 0.8s ease-out forwards',
              }}
            >
              {line.text}
            </div>
          ))}
        </div>
      </div>

      {/* Glow orbs */}
      <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-emerald-900/8 blur-[150px]" />
      <div className="absolute -bottom-80 left-1/3 w-[600px] h-[600px] rounded-full bg-navy-800/30 blur-[150px]" />
    </div>
  );
}

/* ─── Stat Strip ─── */

const METRICS = [
  { value: '1,482', label: 'Active Coders' },
  { value: '847',  label: 'Problems Solved Today' },
  { value: '32ms', label: 'Avg. Judge Time' },
  { value: '24/7', label: 'Arena Uptime' },
];

function StatStrip() {
  return (
    <div className="flex justify-center gap-8 mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
      {METRICS.map((m) => (
        <div key={m.label} className="text-center">
          <div
            className="text-2xl font-bold text-slate-100 tabular-nums"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {m.value}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-surface-500 mt-1">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── AuthPage ─── */

export function AuthPage() {
  const navigate = useNavigate();
  const { token, user, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthed = Boolean(token && user);
  const title = useMemo(
    () => (mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'),
    [mode],
  );

  useEffect(() => {
    if (isAuthed) navigate('/match', { replace: true });
  }, [isAuthed, navigate]);

  const handleFinish = async (values: {
    email: string;
    password: string;
    username?: string;
  }) => {
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
    <div className="relative min-h-screen bg-navy-950 flex flex-col items-center justify-center overflow-hidden">
      <Canvas />

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-16 flex flex-col items-center">

        {/* Logo */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <AppLogo />
        </div>

        {/* Badge */}
        <div
          className="mt-6 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-1 text-[11px] font-semibold text-emerald-300/80 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <ThunderboltFilled className="text-emerald-400/70 text-xs" />
          Realtime PvP Coding Arena
        </div>

        {/* Headline */}
        <h1
          className="mt-6 text-center text-[36px] sm:text-[44px] font-bold leading-[1.08] tracking-[-0.03em] text-slate-50 animate-fade-in-up"
          style={{ fontFamily: "'Clash Display', sans-serif", animationDelay: '0.2s' }}
        >
          Ready to
          <br />
          <span className="text-emerald-300/90">ship code</span>
          {' & '}
          <span className="text-emerald-300/90">climb ranks</span>?
        </h1>

        {/* Subtext */}
        <p
          className="mt-4 text-center text-[14px] leading-relaxed text-surface-400 max-w-sm animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          Join the arena. Pick a problem. Submit your solution. Watch the verdict in realtime.
        </p>

        {/* ═══════ AUTH FORM ═══════ */}
        <div
          className="w-full mt-10 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="bg-navy-900/80 backdrop-blur-xl border border-white/[0.06] shadow-2xl shadow-black/60 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-xs font-bold tracking-widest text-emerald-400 mb-2">
                MEMBER ACCESS
              </div>
              <h2
                className="text-[22px] font-semibold text-slate-100"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {title}
              </h2>
            </div>

            {/* Mode Tabs */}
            <div className="mt-6 mb-8">
              <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/[0.04]">
                {(['login', 'register'] as AuthMode[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setMode(v);
                      setError(null);
                    }}
                    className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer
                      ${mode === v
                        ? 'bg-emerald-500/90 text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)]'
                        : 'text-surface-400 hover:text-surface-200'
                      }`}
                  >
                    {v === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
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
              layout="vertical"
              onFinish={handleFinish}
              requiredMark={false}
              size="large"
              className="flex flex-col gap-5"
            >
              {mode === 'register' && (
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true, message: 'Nhập tên hiển thị' }]}
                  className="!mb-0"
                >
                  <Input
                    placeholder="luffy_gear5"
                    autoComplete="nickname"
                    className="!bg-navy-950 !border-slate-700 hover:!border-emerald-500 focus:!border-emerald-500 !text-slate-200 !px-4 !py-3 rounded-lg !shadow-none"
                  />
                </Form.Item>
              )}

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
                className="!mb-0"
              >
                <Input
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="!bg-navy-950 !border-slate-700 hover:!border-emerald-500 focus:!border-emerald-500 !text-slate-200 !px-4 !py-3 rounded-lg !shadow-none"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Nhập mật khẩu' }]}
                className="!mb-0"
              >
                <Input.Password
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="!bg-navy-950 !border-slate-700 hover:!border-emerald-500 focus:!border-emerald-500 !text-slate-200 !px-4 !py-3 rounded-lg !shadow-none [&_.ant-input-suffix]:!text-slate-400"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button
                  htmlType="submit"
                  loading={loading}
                  block
                  icon={<ArrowRightOutlined />}
                  className="w-full !bg-emerald-500 hover:!bg-emerald-600 !text-white font-semibold !h-12 rounded-lg !border-none mt-2 flex justify-center items-center gap-2"
                >
                  {mode === 'login' ? 'Enter the Arena' : 'Create Account'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Stats */}
        <StatStrip />
      </div>
    </div>
  );
}
