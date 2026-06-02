import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validateUsername, validateEmail, checkPasswordStrength } from '@ocj/validators';
import './AuthModal.css';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!validateUsername(username)) {
          setError('Tên hiển thị không hợp lệ! Tên phải từ 3-30 ký tự, chỉ gồm chữ, số hoặc dấu gạch dưới.');
          setLoading(false);
          return;
        }
        if (!validateEmail(email)) {
          setError('Email không hợp lệ!');
          setLoading(false);
          return;
        }
        const pwdStrength = checkPasswordStrength(password);
        if (!pwdStrength.isStrong) {
          setError('Mật khẩu quá yếu! ' + pwdStrength.feedback.join(' '));
          setLoading(false);
          return;
        }
        await register(username, email, password);
        // Switch to login tab on success
        setIsLogin(true);
        setError('Đăng ký thành công! Hãy đăng nhập.');
      }
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card glass-card">
        <h2 className="auth-title">{isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}</h2>
        <p className="auth-subtitle">Trang đấu trường trực tuyến QUEU</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <label>Tên hiển thị</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên của bạn"
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : isLogin ? 'Vào đấu trường' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</span>
          <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
};
