import { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import {
  CodeOutlined,
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
  GoogleOutlined,
  GithubOutlined
} from '@ant-design/icons';
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

  return (
    <div className="!min-h-screen flex flex-col justify-between !bg-gradient-to-br from-[#1a3668] via-[#0d2146] to-[#081229] font-sans">

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex items-center !p-6 lg:!p-12 w-full">
        {/* ÉP CỨNG WIDTH 1200PX VÀ MARGIN AUTO Ở ĐÂY */}
        <div className="!w-full !max-w-[1200px] !mx-auto grid grid-cols-1 lg:grid-cols-2 !gap-12 lg:!gap-24 items-center">

          {/* ── LEFT: Typography & Stats ── */}
          <div className="flex flex-col text-white">
            <div className="inline-flex items-center !gap-2 !px-4 !py-2 !rounded-full !border !border-blue-500/40 !bg-blue-500/10 w-max !mb-8">
              <CodeOutlined className="text-blue-300 text-sm" />
              <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest leading-none mt-0.5">
                Algorithm Engine V2.4
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight !mb-6">
              Join the Community. <br />
              <span className="text-blue-200">Unleash the Algorithm.</span>
            </h1>

            <p className="text-[15px] text-blue-100/70 !max-w-md leading-relaxed !mb-12">
              Queu Arena is the professional-grade home for precision coding. Scale your skills, compete in global rankings, and master the world's most complex problems.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 !gap-4 !max-w-xl">
              {[
                { value: '50k+', label: 'Active Engineers' },
                { value: '1200+', label: 'Daily Challenges' },
                { value: 'Top 1%', label: 'Elite Rankings' },
              ].map((stat, idx) => (
                <div key={idx} className="!border !border-white/5 !bg-white/[0.03] !p-5 !rounded-2xl flex flex-col justify-center">
                  <div className="text-2xl font-bold text-white !mb-1">{stat.value}</div>
                  <div className="text-[10px] font-semibold text-blue-200/60 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Form Card ── */}
          <div className="w-full !max-w-[460px] mx-auto lg:!ml-auto lg:!mr-0">
            <div className="!bg-[#e4ebf5] !rounded-[24px] !p-8 sm:!p-10 !shadow-2xl shadow-black/40 text-slate-800">

              {/* Toggle Login/Register */}
              <div className="!bg-slate-200/80 !rounded-xl !p-1.5 flex !mb-8 items-center w-full">
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`flex-1 !py-2.5 text-sm font-semibold !rounded-lg transition-all flex justify-center items-center ${mode === 'login'
                      ? '!bg-white text-slate-900 !shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`flex-1 !py-2.5 text-sm font-semibold !rounded-lg transition-all flex justify-center items-center ${mode === 'register'
                      ? '!bg-white text-slate-900 !shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Register
                </button>
              </div>

              <div className="!mb-8">
                <h2 className="text-2xl font-bold text-slate-900 !mb-1.5">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-slate-500">
                  {mode === 'login'
                    ? 'Enter your credentials to access the arena.'
                    : 'Register an account to start your journey.'}
                </p>
              </div>

              {error && (
                <div className={`text-[13px] !px-4 !py-3 !rounded-lg !mb-6 ${error.includes('thành công') ? '!bg-green-100 text-green-700' : '!bg-red-100 text-red-600'}`}>
                  {error}
                </div>
              )}

              <Form layout="vertical" onFinish={handleFinish} requiredMark={false} className="ocj-auth-form">

                {mode === 'register' && (
                  <Form.Item
                    name="username"
                    label={<span className="text-[12px] font-semibold text-slate-600">Username</span>}
                    rules={[{ required: true, message: 'Required' }]}
                    className="!mb-5"
                  >
                    <Input
                      prefix={<UserOutlined className="text-slate-400 !mr-2" />}
                      placeholder="Choose a username"
                      className="!bg-white !border-transparent hover:!border-blue-400 focus:!border-blue-500 !text-slate-800 !px-4 !py-3.5 !rounded-xl !shadow-sm transition-colors text-sm"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  name="email"
                  label={<span className="text-[12px] font-semibold text-slate-600">Identifier</span>}
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-5"
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400 !mr-2" />}
                    placeholder="Username or Email"
                    className="!bg-white !border-transparent hover:!border-blue-400 focus:!border-blue-500 !text-slate-800 !px-4 !py-3.5 !rounded-xl !shadow-sm transition-colors text-sm"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[12px] font-semibold text-slate-600">Security Key</span>
                      {mode === 'login' && <a href="#" className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Forgot?</a>}
                    </div>
                  }
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-6"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-slate-400 !mr-2" />}
                    placeholder="••••••••"
                    className="!bg-white !border-transparent hover:!border-blue-400 focus:!border-blue-500 !text-slate-800 !px-4 !py-3.5 !rounded-xl !shadow-sm transition-colors text-sm [&_.ant-input-suffix]:text-slate-400"
                  />
                </Form.Item>

                <Form.Item className="!mt-2 !mb-0">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full !bg-[#0d59e8] hover:!bg-[#0a46b5] text-white font-medium text-[15px] !py-3.5 !rounded-xl !shadow-md transition-all flex justify-center items-center !gap-2 disabled:opacity-70"
                  >
                    {mode === 'login' ? 'Initiate Access' : 'Create Account'}
                    {!loading && <ArrowRightOutlined className="text-sm" />}
                  </button>
                </Form.Item>
              </Form>

              <div className="flex items-center !gap-4 !my-8">
                <div className="flex-1 !h-px !bg-slate-300/60"></div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Secure Gateways
                </div>
                <div className="flex-1 !h-px !bg-slate-300/60"></div>
              </div>

              <div className="grid grid-cols-2 !gap-4 w-full">
                <button type="button" className="flex items-center justify-center !gap-2 !bg-white hover:!bg-slate-50 border border-transparent text-slate-700 font-medium !py-3 !rounded-xl !shadow-sm transition-all text-sm w-full">
                  <GoogleOutlined className="text-lg text-slate-700" />
                  Google
                </button>
                <button type="button" className="flex items-center justify-center !gap-2 !bg-white hover:!bg-slate-50 border border-transparent text-slate-700 font-medium !py-3 !rounded-xl !shadow-sm transition-all text-sm w-full">
                  <GithubOutlined className="text-lg text-slate-700" />
                  GitHub
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center !mt-8 !px-4 leading-relaxed">
                By continuing, you agree to the Queu Arena <a href="#" className="font-semibold text-slate-700 underline hover:text-blue-600">Protocol & Terms</a>.
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      {/* ÉP CỨNG WIDTH 1200PX VÀ MARGIN AUTO Ở FOOTER ĐỂ CÙNG TRỤC DỌC VỚI CONTENT */}
      <footer className="!w-full !max-w-[1200px] !mx-auto !px-6 lg:!px-12 !py-6 flex flex-col sm:flex-row justify-between items-center text-[12px] text-blue-200/50">
        <p>© 2024 Queu Arena. Professional Grade Online Judge.</p>
        <div className="flex !gap-6 !mt-4 sm:!mt-0">
          <a href="#" className="hover:text-blue-200 transition-colors">Documentation</a>
          <a href="#" className="hover:text-blue-200 transition-colors">API Status</a>
          <a href="#" className="hover:text-blue-200 transition-colors">Privacy</a>
        </div>
      </footer>

    </div>
  );
}