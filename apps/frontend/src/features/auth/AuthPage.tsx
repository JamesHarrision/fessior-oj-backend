import { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import {
  CodeOutlined,
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { validateEmail, validateUsername, checkPasswordStrength } from '@ocj/validators';
import { parseErrorMessage } from '@ocj/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'register';

// Hard, brutalist animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const sharpReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'tween', ease: 'circOut', duration: 0.4 }
  }
};

const badgeFlash = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'tween', ease: 'easeOut', duration: 0.3 }
  }
};

export function AuthPage() {
  const navigate = useNavigate();
  const { token, user, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthed = Boolean(token && user);

  useEffect(() => {
    if (isAuthed) navigate('/home', { replace: true });
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
        navigate('/home', { replace: true });
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
    <div className="min-h-screen w-full flex flex-col justify-between bg-ink text-linen font-body overflow-hidden">
      
      {/* ─── Main Content ─── */}
      <div className="flex-1 flex items-center p-6 lg:p-12 w-full">
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* ── LEFT: Typography & Stats ── */}
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible"
            className="flex flex-col"
          >
            <motion.div variants={badgeFlash} className="inline-flex items-center gap-2 px-3 py-1.5 border border-charcoal bg-washi w-max mb-10 rounded">
              <CodeOutlined className="text-vermilion text-xs" />
              <span className="font-display text-[11px] font-bold text-stone uppercase tracking-widest leading-none mt-0.5">
                ALGORITHM ENGINE V2.4
              </span>
            </motion.div>

            <motion.h1 variants={sharpReveal} className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight mb-8">
              QUEU ARENA.<br />
              <span className="text-vermilion">MATCHMAKING.</span>
            </motion.h1>

            <motion.p variants={sharpReveal} className="font-body text-[18px] leading-[1.6] text-linen max-w-md mb-12">
              The professional-grade home for precision coding. Scale your skills, compete in global rankings, and master the world's most complex problems.
            </motion.p>

            {/* Stats Row */}
            <motion.div variants={staggerContainer} className="grid grid-cols-3 gap-4 max-w-[480px]">
              {[
                { value: '50k+', label: 'ACTIVE ENGINEERS' },
                { value: '1200+', label: 'DAILY CHALLENGES' },
                { value: 'Top 1%', label: 'ELITE RANKINGS' },
              ].map((stat, idx) => (
                <motion.div 
                  key={idx} 
                  variants={sharpReveal}
                  whileHover={{ scale: 1.05, borderColor: '#D83A2C', transition: { duration: 0.1 } }}
                  className="bg-washi border border-charcoal p-5 flex flex-col justify-center rounded cursor-default"
                >
                  <div className="font-display text-2xl font-bold text-linen mb-2">{stat.value}</div>
                  <div className="font-display text-[11px] font-bold text-stone uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Form Card ── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'tween', ease: 'circOut', duration: 0.5, delay: 0.3 }}
            className="w-full max-w-[440px] mx-auto lg:ml-auto lg:mr-0"
          >
            <div className="bg-washi border border-charcoal p-8 lg:p-10 rounded">
              
              <div className="font-display text-[11px] font-bold tracking-widest text-vermilion mb-6 uppercase flex items-center gap-2">
                <motion.div 
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-2 h-2 bg-vermilion rounded-full"
                />
                MEMBER ACCESS
              </div>

              {/* Toggle Login/Register */}
              <div className="flex bg-ink border border-charcoal rounded p-1 mb-8 relative">
                {/* Active Slider Indicator */}
                <motion.div 
                  layout
                  className="absolute top-1 bottom-1 bg-charcoal rounded z-0"
                  initial={false}
                  animate={{
                    left: mode === 'login' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className={`relative z-10 flex-1 py-2 font-display text-[13px] font-bold rounded flex justify-center items-center transition-colors ${
                    mode === 'login' ? 'text-linen' : 'text-stone hover:text-linen'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className={`relative z-10 flex-1 py-2 font-display text-[13px] font-bold rounded flex justify-center items-center transition-colors ${
                    mode === 'register' ? 'text-linen' : 'text-stone hover:text-linen'
                  }`}
                >
                  REGISTER
                </button>
              </div>

              <div className="mb-8">
                <motion.h2 
                  key={mode}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-2xl font-bold text-linen mb-2 uppercase"
                >
                  {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                </motion.h2>
                <motion.p 
                  key={`p-${mode}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-body text-[14px] text-stone"
                >
                  {mode === 'login'
                    ? 'Enter your credentials to access the arena.'
                    : 'Register an account to start your journey.'}
                </motion.p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className={`text-[13px] font-body px-4 py-3 rounded border ${
                      error.includes('thành công') 
                        ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                        : 'bg-vermilion/10 border-vermilion/30 text-vermilion'
                    }`}>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form layout="vertical" onFinish={handleFinish} requiredMark={false} className="flex flex-col gap-5 ocj-auth-form">

                <AnimatePresence mode="popLayout">
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Form.Item
                        name="username"
                        label={<span className="font-display block text-[11px] font-bold text-stone uppercase tracking-wider">Username</span>}
                        rules={[{ required: true, message: 'Required' }]}
                        className="!mb-0 mt-1"
                      >
                        <Input
                          prefix={<UserOutlined className="text-stone mr-2" />}
                          placeholder="Choose a username"
                          className="w-full h-[44px] bg-ink border border-charcoal rounded px-4 py-3 font-body text-[14px] text-linen focus:outline-none focus:border-vermilion hover:border-stone transition-colors placeholder:text-stone"
                        />
                      </Form.Item>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Form.Item
                  name="email"
                  label={<span className="font-display block text-[11px] font-bold text-stone uppercase tracking-wider">Identifier</span>}
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-0"
                >
                  <Input
                    prefix={<UserOutlined className="text-stone mr-2" />}
                    placeholder="admin@example.com"
                    className="w-full h-[44px] bg-ink border border-charcoal rounded px-4 py-3 font-body text-[14px] text-linen focus:outline-none focus:border-vermilion hover:border-stone transition-colors placeholder:text-stone"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span className="font-display block text-[11px] font-bold text-stone uppercase tracking-wider">Security Key</span>
                      {mode === 'login' && <a href="#" className="font-display text-[11px] font-bold text-stone hover:text-vermilion transition-colors uppercase tracking-wider">Forgot?</a>}
                    </div>
                  }
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-2"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-stone mr-2" />}
                    placeholder="••••••••"
                    className="w-full h-[44px] bg-ink border border-charcoal rounded px-4 py-3 font-body text-[14px] text-linen focus:outline-none focus:border-vermilion hover:border-stone transition-colors placeholder:text-stone [&_.ant-input-suffix]:text-stone"
                  />
                </Form.Item>

                <Form.Item className="!mt-4 !mb-0">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full h-[44px] bg-vermilion hover:bg-vermilion-hover text-linen font-display font-bold text-[14px] uppercase tracking-wider rounded transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {mode === 'login' ? 'INITIATE ACCESS' : 'CREATE ACCOUNT'}
                    {!loading && <ArrowRightOutlined className="text-sm" />}
                  </motion.button>
                </Form.Item>
              </Form>

              <div className="flex items-center gap-4 mt-8 mb-6">
                <div className="flex-1 h-[1px] bg-charcoal"></div>
                <div className="font-display text-[11px] font-bold text-stone uppercase tracking-widest">
                  SECURE GATEWAYS
                </div>
                <div className="flex-1 h-[1px] bg-charcoal"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#2E2E2E' }}
                  whileTap={{ scale: 0.98 }}
                  type="button" 
                  className="flex items-center justify-center gap-2 bg-ink border border-charcoal text-linen font-display font-bold py-2.5 rounded text-[13px] uppercase tracking-wider w-full"
                >
                  Google
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#2E2E2E' }}
                  whileTap={{ scale: 0.98 }}
                  type="button" 
                  className="flex items-center justify-center gap-2 bg-ink border border-charcoal text-linen font-display font-bold py-2.5 rounded text-[13px] uppercase tracking-wider w-full"
                >
                  GitHub
                </motion.button>
              </div>

              <p className="font-body text-[12px] text-stone text-center mt-8 px-2">
                By continuing, you agree to the Queu Arena <a href="#" className="font-bold text-linen underline hover:text-vermilion transition-colors">Protocol & Terms</a>.
              </p>

            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row justify-between items-center font-body text-[12px] text-stone"
      >
        <p>© 2024 Queu Arena. Professional Grade Online Judge.</p>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
          <a href="#" className="hover:text-linen transition-colors">Documentation</a>
          <a href="#" className="hover:text-linen transition-colors">API Status</a>
          <a href="#" className="hover:text-linen transition-colors">Privacy</a>
        </div>
      </motion.footer>

    </div>
  );
}