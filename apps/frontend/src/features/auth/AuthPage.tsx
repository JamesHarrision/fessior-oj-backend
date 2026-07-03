import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Divider, Form, Input, Segmented, Typography } from 'antd';
import { FullPageCenter, SurfaceCard, AppLogo } from '@ocj/ui';
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
      <div className="w-full max-w-[980px]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950/60 to-slate-950 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <AppLogo />
              <div className="text-right text-xs text-slate-400">
                <div className="font-medium text-slate-200">Online Code Arena</div>
                <div>Realtime PvP · Contests · Judge0</div>
              </div>
            </div>
            <div className="mt-10">
              <Typography.Title level={2} className="!mb-2 !text-slate-50">
                Chơi nhanh, chấm chuẩn, lên rank.
              </Typography.Title>
              <Typography.Paragraph className="!mb-0 !text-slate-300">
                Một shell mới gọn gàng cho các page tiếp theo. Slice này tập trung vào Auth + App Shell; các trang còn lại sẽ được refactor lần lượt sau khi bro test confirm.
              </Typography.Paragraph>
            </div>
            <Divider className="!border-white/10" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-slate-200 font-semibold">Router chuẩn</div>
                <div className="text-slate-400 mt-1">Không còn hash navigation</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-slate-200 font-semibold">Repository</div>
                <div className="text-slate-400 mt-1">API tập trung qua @ocj/api</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-slate-200 font-semibold">State tách lớp</div>
                <div className="text-slate-400 mt-1">Zustand + (sắp tới) Query</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-slate-200 font-semibold">UI chuẩn hóa</div>
                <div className="text-slate-400 mt-1">AntD + Tailwind</div>
              </div>
            </div>
          </div>

          <SurfaceCard
            title={
              <div className="flex items-center justify-between">
                <div className="text-slate-50 font-semibold">{title}</div>
                <Segmented<AuthMode>
                  value={mode}
                  onChange={(v) => setMode(v)}
                  options={[
                    { label: 'Login', value: 'login' },
                    { label: 'Register', value: 'register' },
                  ]}
                />
              </div>
            }
            className="rounded-3xl border border-white/10 bg-slate-950/60"
          >
            {error && <Alert type={error.includes('thành công') ? 'success' : 'error'} message={error} showIcon className="mb-4" />}

            <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
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

              <Button htmlType="submit" type="primary" size="large" loading={loading} block>
                {mode === 'login' ? 'Vào đấu trường' : 'Tạo tài khoản'}
              </Button>
            </Form>

            <div className="mt-4 text-xs text-slate-400">
              Nếu gặp lỗi auth, hãy đảm bảo BE đang chạy ở <span className="text-slate-200">http://localhost:6868</span> và đã seed data.
            </div>
          </SurfaceCard>
        </div>
      </div>
    </FullPageCenter>
  );
}
