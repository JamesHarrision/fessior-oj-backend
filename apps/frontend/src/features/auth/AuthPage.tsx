import { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import { Code2, UserRound, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { validateEmail, validateUsername, checkPasswordStrength } from '@ocj/validators';
import { parseErrorMessage } from '@ocj/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const navigate = useNavigate();
  const { token, user, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthed = Boolean(token && user);

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
      setError('Đăng ký thành công. Đăng nhập ngay.');
    } catch (e) {
      setError(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = error?.includes('thành công');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-ink font-body">

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex items-center p-6 lg:p-12 w-full">
        <div className="w-full max-w-[1040px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── LEFT: Hero ── */}
          <div className="flex flex-col">
            {/* Chip */}
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-charcoal bg-washi w-max mb-8">
              <Code2 size={14} className="text-stone" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.15em] text-stone leading-none mt-px">
                Algorithm Engine V2.4
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-[-0.02em] text-linen mb-6">
              Join the Community.
              <br />
              <span className="text-vermilion">Unleash the Algorithm.</span>
            </h1>

            <p className="text-[15px] text-stone max-w-md leading-relaxed mb-12">
              Queu Arena is the professional-grade home for precision coding.
              Scale your skills, compete in global rankings, and master the
              world&rsquo;s most complex problems.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-xl">
              {[
                { value: '50k+', label: 'Active Engineers' },
                { value: '1200+', label: 'Daily Challenges' },
                { value: 'Top 1%', label: 'Elite Rankings' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="border border-charcoal bg-washi p-5 flex flex-col justify-center"
                >
                  <div className="font-display text-2xl font-bold text-linen mb-1">
                    {stat.value}
                  </div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-stone">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Form Card ── */}
          <div className="w-full max-w-[460px] mx-auto lg:ml-auto lg:mr-0">
            <div className="bg-washi border border-charcoal p-8 sm:p-10">

              {/* Mode tabs */}
              <div className="flex bg-charcoal/30 p-1 mb-8">
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  disabled={loading}
                  className={`
                    flex-1 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors
                    ${mode === 'login'
                      ? 'bg-vermilion text-linen'
                      : 'text-stone hover:text-linen'
                    }
                  `}
                >
                  Login
                </button>
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  disabled={loading}
                  className={`
                    flex-1 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors
                    ${mode === 'register'
                      ? 'bg-vermilion text-linen'
                      : 'text-stone hover:text-linen'
                    }
                  `}
                >
                  Register
                </button>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-linen mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="font-body text-sm text-stone">
                  {mode === 'login'
                    ? 'Enter your credentials to access the arena.'
                    : 'Register an account to start your journey.'}
                </p>
              </div>

              {/* Message */}
              {error && (
                <div
                  className={`
                    text-[13px] px-4 py-3 mb-6 border font-body
                    ${isSuccess
                      ? 'border-charcoal bg-washi/50 text-linen'
                      : 'border-vermilion bg-washi/50 text-linen'
                    }
                  `}
                >
                  {isSuccess && <ShieldCheck size={14} className="inline-block mr-2 -mt-0.5 text-stone" />}
                  {error}
                </div>
              )}

              <Form layout="vertical" onFinish={handleFinish} requiredMark={false} className="ocj-auth-form">

                {mode === 'register' && (
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Required' }]}
                    className="mb-5"
                  >
                    <Input
                      prefix={<UserRound size={14} className="text-stone mr-2" />}
                      placeholder="Choose a username"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="email"
                  label="Identifier"
                  rules={[{ required: true, message: 'Required' }]}
                  className="mb-5"
                >
                  <Input
                    prefix={<UserRound size={14} className="text-stone mr-2" />}
                    placeholder="Username or Email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span>Security Key</span>
                      {mode === 'login' && (
                        <a href="#" className="font-body text-xs font-semibold text-vermilion hover:text-vermilion-hover no-underline">
                          Forgot?
                        </a>
                      )}
                    </div>
                  }
                  rules={[{ required: true, message: 'Required' }]}
                  className="mb-6"
                >
                  <Input.Password
                    prefix={<Lock size={14} className="text-stone mr-2" />}
                    placeholder="••••••••"
                  />
                </Form.Item>

                <Form.Item className="mt-2 mb-0">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-vermilion text-linen font-display text-sm font-bold uppercase tracking-wider py-3.5 hover:bg-vermilion-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-vermilion flex justify-center items-center gap-2"
                  >
                    {loading ? (
                      'Đang xử lý…'
                    ) : (
                      <>
                        {mode === 'login' ? 'Initiate Access' : 'Create Account'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </Form.Item>
              </Form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-charcoal" />
                <div className="font-display text-[10px] font-bold text-stone uppercase tracking-[0.2em]">
                  Secure Gateways
                </div>
                <div className="flex-1 h-px bg-charcoal" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-washi border border-charcoal text-stone font-body font-medium py-3 text-sm hover:text-linen hover:border-stone transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 bg-washi border border-charcoal text-stone font-body font-medium py-3 text-sm hover:text-linen hover:border-stone transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>

              {/* Terms */}
              <p className="font-body text-[11px] text-stone text-center mt-8 px-4 leading-relaxed">
                By continuing, you agree to the Queu Arena{' '}
                <a href="#" className="font-semibold text-vermilion hover:text-vermilion-hover no-underline">
                  Protocol &amp; Terms
                </a>.
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="w-full max-w-[1040px] mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-stone">
        <p>© 2024 Queu Arena. Professional Grade Online Judge.</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a href="#" className="hover:text-vermilion transition-colors">Documentation</a>
          <a href="#" className="hover:text-vermilion transition-colors">API Status</a>
          <a href="#" className="hover:text-vermilion transition-colors">Privacy</a>
        </div>
      </footer>

    </div>
  );
}
