import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Input, Segmented, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleFilled, ThunderboltFilled } from '@ant-design/icons';
import { FullPageCenter, AppLogo } from '@ocj/ui';
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

  const title = useMemo(() => {
    return mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản';
  }, [mode]);

  useEffect(() => {
    if (isAuthed) {
      navigate('/match', { replace: true });
    }
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
    <FullPageCenter>
      <div className="w-[calc(100%-32px)] max-w-[1120px] sm:w-[calc(100%-64px)]">
        <div className="grid min-h-[620px] grid-cols-1 overflow-hidden rounded-lg border border-white/10 bg-[#080b14] shadow-[0_32px_120px_rgba(0,0,0,0.48)] lg:grid-cols-[1fr_0.82fr]">
          <section className="relative flex min-h-[500px] flex-col justify-between border-b border-white/10 bg-[linear-gradient(135deg,#08111f_0%,#050816_48%,#07131a_100%)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.7),rgba(168,85,247,0.6),transparent)]" />
            <div className="flex items-start justify-between gap-4">
              <AppLogo />
              <div className="hidden rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right text-xs leading-5 text-slate-400 sm:block">
                <div className="font-semibold text-slate-100">Live Judge</div>
                <div>42 ms · 12.8 MB</div>
              </div>
            </div>

            <div className="relative z-10 mt-8 max-w-[560px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                <ThunderboltFilled className="text-cyan-300" />
                Realtime PvP coding arena
              </div>
              <Typography.Title level={1} className="!mb-4 !text-slate-50 !text-[34px] !leading-[1.06] sm:!text-[46px]">
                Code nhanh. Submit chuẩn. Leo rank thật.
              </Typography.Title>
              <Typography.Paragraph className="!mb-0 !max-w-[560px] !text-[15px] !leading-7 !text-slate-300">
                Vào lobby, nhận bài, chạy test, submit và xem verdict realtime trong cùng một flow. Auth mới giữ vai trò cổng vào cho toàn bộ arena thay vì chỉ là một form đăng nhập.
              </Typography.Paragraph>
            </div>

            <div className="relative z-10 mt-8 grid gap-4 xl:grid-cols-[1fr_190px]">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#05070d]/80 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">two-sum.cpp</span>
                </div>
                <div className="grid gap-0 text-sm md:grid-cols-[1fr_170px]">
                  <pre className="h-[176px] overflow-hidden p-4 font-mono text-[12px] leading-5 text-slate-300">
{`int solve(vector<int>& a, int target) {
  unordered_map<int, int> seen;

  for (int i = 0; i < a.size(); ++i) {
    int need = target - a[i];
    if (seen.count(need)) return i;
    seen[a[i]] = i;
  }
}`}
                  </pre>
                  <div className="border-t border-white/10 bg-white/[0.03] p-4 md:border-l md:border-t-0">
                    <div className="mb-3 flex items-center gap-2 text-emerald-300">
                      <CheckCircleFilled />
                      <span className="text-sm font-semibold">Accepted</span>
                    </div>
                    <div className="space-y-2.5 text-xs text-slate-400">
                      <div className="flex justify-between"><span>Runtime</span><span className="text-slate-200">42 ms</span></div>
                      <div className="flex justify-between"><span>Memory</span><span className="text-slate-200">12.8 MB</span></div>
                      <div className="flex justify-between"><span>Tests</span><span className="text-slate-200">24 / 24</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
                {[
                  ['ELO', '1,482'],
                  ['Streak', '07'],
                  ['Rank', '#128'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
                    <div className="mt-1 text-xl font-semibold text-slate-50">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {['Repository API', 'React Query', 'Zustand', 'AntD + Tailwind'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center bg-[linear-gradient(180deg,#151515_0%,#101010_100%)] p-6 sm:p-8">
            <div className="w-full">
              <div className="mb-7">
                <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-300">Member access</div>
                <Typography.Title level={2} className="!mb-2 !text-[30px] !text-slate-50">
                  {title}
                </Typography.Title>
                <Typography.Paragraph className="!mb-0 !text-slate-400">
                  {mode === 'login' ? 'Tiếp tục phiên luyện tập hoặc vào hàng chờ PvP.' : 'Tạo hồ sơ để lưu rank, submissions và inventory.'}
                </Typography.Paragraph>
              </div>

              <Segmented<AuthMode>
                block
                value={mode}
                onChange={(v) => setMode(v)}
                className="mb-6 w-full"
                options={[
                  { label: 'Login', value: 'login' },
                  { label: 'Register', value: 'register' },
                ]}
              />

              {error && <Alert type={error.includes('thành công') ? 'success' : 'error'} message={error} showIcon className="mb-4" />}

              <Form className="ocj-auth-form" layout="vertical" onFinish={handleFinish} requiredMark={false}>
                {mode === 'register' && (
                  <Form.Item
                    label={<span className="text-slate-300">Tên hiển thị</span>}
                    name="username"
                    rules={[{ required: true, message: 'Nhập tên hiển thị' }]}
                  >
                    <Input size="large" placeholder="luffy_gear5" autoComplete="nickname" />
                  </Form.Item>
                )}

                <Form.Item
                  label={<span className="text-slate-300">Email</span>}
                  name="email"
                  rules={[{ required: true, message: 'Nhập email' }]}
                >
                  <Input size="large" placeholder="user@example.com" autoComplete="email" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-slate-300">Mật khẩu</span>}
                  name="password"
                  rules={[{ required: true, message: 'Nhập mật khẩu' }]}
                >
                  <Input.Password size="large" placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                </Form.Item>

                <Button htmlType="submit" type="primary" size="large" loading={loading} block icon={<ArrowRightOutlined />}>
                  {mode === 'login' ? 'Vào đấu trường' : 'Tạo tài khoản'}
                </Button>
              </Form>

              <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-slate-400">
                BE mặc định: <span className="font-mono text-slate-200">http://localhost:6868</span>. Seed admin trước khi test account quản trị.
              </div>
            </div>
          </section>
        </div>
      </div>
    </FullPageCenter>
  );
}
