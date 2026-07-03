import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  FireFilled,
  ThunderboltFilled,
  TrophyFilled,
  UserOutlined,
} from '@ant-design/icons';
import { AppLogo } from '@ocj/ui';
import { validateEmail, validateUsername, checkPasswordStrength } from '@ocj/validators';
import { parseErrorMessage } from '@ocj/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

/* ─── Dot Grid Background ─── */

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(5,150,105,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-900/12 blur-[130px]" />
      <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-navy-700/15 blur-[130px]" />
    </div>
  );
}

/* ─── Terminal Preview ─── */

function TerminalPreview() {
  const codePreviewHtml = [
    '<span style="color:#64748B">// O(n) solution</span>',
    '<span style="color:#A5B4FC">int</span> ',
    '<span style="color:#FCD34D">solve</span>',
    '(<span style="color:#A5B4FC">vector</span>&lt;int&gt;&amp; a, ',
    '<span style="color:#A5B4FC">int</span> target) {',
    '',
    '  <span style="color:#A5B4FC">unordered_map</span>&lt;int,int&gt; seen;',
    '',
    '  <span style="color:#67E8F9">for</span> ',
    '(<span style="color:#A5B4FC">int</span> i=0; i&lt;a.size(); ++i) {',
    '    <span style="color:#A5B4FC">int</span> need = target - a[i];',
    '    <span style="color:#64748B">// ...</span>',
    '    <span style="color:#67E8F9">return</span> i;',
    '  }',
    '}',
    '<span class="ocj-cursor"></span>',
  ].join('\n');

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span
          className="ml-3 text-xs text-surface-500"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          two-sum.cpp
        </span>
      </div>

      <div className="grid grid-cols-[1fr_160px]">
        <div
          className="h-[156px] overflow-hidden p-4 text-[12px] leading-[1.65] text-slate-300"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          dangerouslySetInnerHTML={{ __html: codePreviewHtml }}
        />

        <div className="border-l border-white/[0.05] bg-white/[0.02] p-3.5 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 mb-3 text-emerald-400">
            <CheckCircleFilled className="text-xs" />
            <span className="text-[11px] font-semibold tracking-wide">Accepted</span>
          </div>
          <div className="space-y-2 text-[11px]">
            {(
              [
                ['Runtime', '42 ms'],
                ['Memory', '12.8 MB'],
                ['Tests', '24 / 24'],
              ] as const
            ).map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-surface-500">{label}</span>
                <span className="text-slate-300 tabular-nums">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Live Stats ─── */

type StatItem = { icon: React.ReactNode; label: string; value: string };

const STATS: StatItem[] = [
  { icon: <UserOutlined />, label: 'Active Coders', value: '1,482' },
  { icon: <FireFilled />, label: 'Streak Record', value: '07 days' },
  { icon: <TrophyFilled />, label: 'Global Rank', value: '#128' },
];

function LiveStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/40 px-4 py-3.5 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300"
        >
          <div className="flex items-center gap-1.5 text-surface-500 mb-1.5 text-[10px] uppercase tracking-[0.12em] font-semibold">
            <span className="text-emerald-500/60 text-xs">{s.icon}</span>
            {s.label}
          </div>
          <div
            className="text-xl font-semibold text-slate-100 tabular-nums"
            style={{ fontFamily: "'Clash Display', sans-serif" }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Trust Badges ─── */

const TECH_BADGES = ['Repository API', 'React Query', 'Zustand', 'Ant Design', 'Tailwind', 'Monaco'];

function TrustBadges() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {TECH_BADGES.map((b) => (
        <span
          key={b}
          className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2.5 py-1 text-[10px] text-surface-500 font-medium tracking-wide hover:border-white/[0.1] hover:text-surface-300 transition-colors duration-300"
        >
          {b}
        </span>
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);

  const isAuthed = Boolean(token && user);
  const title = useMemo(
    () => (mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'),
    [mode],
  );

  useEffect(() => {
    if (isAuthed) navigate('/match', { replace: true });
  }, [isAuthed, navigate]);

  useEffect(() => {
    setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    emailRef.current?.focus();
  }, [mode]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        if (mode === 'login') {
          if (!email.trim() || !password) {
            setError('Vui lòng nhập email và mật khẩu.');
            return;
          }
          await login(email.trim(), password);
          navigate('/match', { replace: true });
          return;
        }

        const trimmed = username.trim();
        if (!validateUsername(trimmed)) {
          setError('Tên hiển thị không hợp lệ (3-30 ký tự, chữ/số/_).');
          return;
        }
        if (!validateEmail(email.trim())) {
          setError('Email không hợp lệ.');
          return;
        }
        const strength = checkPasswordStrength(password);
        if (!strength.isStrong) {
          setError(`Mật khẩu quá yếu: ${strength.feedback.join(' ')}`);
          return;
        }
        await register(trimmed, email.trim(), password);
        setMode('login');
        setError('Đăng ký thành công. Hãy đăng nhập.');
      } catch (e: unknown) {
        setError(parseErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [mode, email, password, username, login, register, navigate],
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 lg:p-8 bg-black/90 overflow-hidden">
      <DotGrid />

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

        {/* ═══════════════ LEFT COLUMN: HERO ═══════════════ */}
        <div className="flex flex-col gap-6 justify-center animate-slide-in-left">

          <div className="stagger-1 animate-fade-in-up">
            <AppLogo />
          </div>

          <div className="stagger-2 animate-fade-in-up space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-1 text-[11px] font-semibold text-emerald-300/80">
              <ThunderboltFilled className="text-emerald-400/70 text-xs" />
              Realtime PvP Coding Arena
            </div>

            <h1
              className="text-[40px] sm:text-[48px] lg:text-[54px] font-bold leading-[1.1] tracking-[-0.025em] text-slate-50"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Code.
              <br />
              Submit.
              <br />
              <span className="text-emerald-300/90">Conquer.</span>
            </h1>

            <p className="text-[14px] leading-relaxed text-slate-300 max-w-[440px]">
              Vào lobby, nhận bài, chạy test, submit và xem verdict realtime. Nơi mọi coder đều có thể leo rank.
            </p>
          </div>

          <div className="stagger-3 animate-fade-in-up">
            <LiveStats />
          </div>

          <div className="stagger-4 animate-fade-in-up">
            <TerminalPreview />
          </div>

          <div className="stagger-5 animate-fade-in-up">
            <TrustBadges />
          </div>
        </div>

        {/* ═══════════════ RIGHT COLUMN: AUTH FORM ═══════════════ */}
        <div className="w-full max-w-md mx-auto lg:mr-auto lg:ml-0 animate-scale-in stagger-3">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-2xl p-8 lg:p-10">

            <div className="mb-6">
              <div className="mb-3 text-xs font-bold tracking-widest text-emerald-400">
                MEMBER ACCESS
              </div>
              <h2
                className="text-[26px] font-semibold text-slate-100 mb-1.5"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {title}
              </h2>
              <p className="text-[13px] text-surface-400 leading-relaxed">
                {mode === 'login'
                  ? 'Tiếp tục phiên luyện tập hoặc vào hàng chờ PvP.'
                  : 'Tạo hồ sơ để lưu rank, submissions và inventory.'}
              </p>
            </div>

            <div className="flex bg-white/[0.04] rounded-lg p-1 mb-6 border border-white/[0.05]">
              {(['login', 'register'] as AuthMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMode(v)}
                  className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer
                    ${mode === v
                      ? 'bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                      : 'text-surface-400 hover:text-surface-200'
                    }`}
                >
                  {v === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            {error && (
              <Alert
                type={error.includes('thành công') ? 'success' : 'error'}
                message={error}
                showIcon
                className="mb-5 animate-fade-in"
              />
            )}

            <form className="flex flex-col gap-5 mt-8" onSubmit={handleSubmit} noValidate>
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="luffy_gear5"
                    autoComplete="nickname"
                    required
                    className="w-full bg-[#0B1120] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-[#0B1120] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  className="w-full bg-[#0B1120] border border-slate-700/60 rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    {mode === 'login' ? 'Vào đấu trường' : 'Tạo tài khoản'}
                    <ArrowRightOutlined />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-white/[0.04] bg-white/[0.015] p-3 text-[11px] leading-5 text-surface-500 text-center">
              Backend:{' '}
              <span
                className="text-surface-300"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                localhost:6868
              </span>
              {' · '}
              Seed admin để test
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
