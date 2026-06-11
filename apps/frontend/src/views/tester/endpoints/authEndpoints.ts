import type { ApiEndpoint } from '../apiListData';

export const authEndpoints: ApiEndpoint[] = [
  {
    id: 'auth-register',
    name: 'Đăng ký tài khoản',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/register',
    description: 'Đăng ký tài khoản mới cho người dùng',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      username: 'tester123',
      email: 'tester123@example.com',
      password: 'Password123'
    }, null, 2)
  },
  {
    id: 'auth-login',
    name: 'Đăng nhập',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Đăng nhập để nhận mã thông báo Access/Refresh Token',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      email: 'tester123@example.com',
      password: 'Password123'
    }, null, 2)
  },
  {
    id: 'auth-logout',
    name: 'Đăng xuất',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/logout',
    description: 'Đăng xuất tài khoản và thu hồi Refresh Token hiện tại',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      refreshToken: ''
    }, null, 2)
  },
  {
    id: 'auth-refresh',
    name: 'Làm mới Token',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    description: 'Sử dụng Refresh Token để tạo Access Token mới',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      refreshToken: ''
    }, null, 2)
  },
  {
    id: 'auth-me',
    name: 'Thông tin cá nhân (Get Me)',
    category: 'Xác thực (Auth)',
    method: 'GET',
    path: '/api/v1/auth/me',
    description: 'Lấy thông tin cá nhân của người dùng đăng nhập hiện tại',
    requiresAuth: true
  },
  {
    id: 'auth-change-password',
    name: 'Đổi mật khẩu',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/change-password',
    description: 'Đổi mật khẩu tài khoản hiện tại',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      currentPassword: 'Password123',
      newPassword: 'NewPassword123'
    }, null, 2)
  },
  {
    id: 'auth-get-sessions',
    name: 'Danh sách Session hoạt động',
    category: 'Xác thực (Auth)',
    method: 'GET',
    path: '/api/v1/auth/sessions',
    description: 'Xem tất cả các thiết bị/phiên đang đăng nhập',
    requiresAuth: true
  },
  {
    id: 'auth-revoke-session',
    name: 'Thu hồi Session cụ thể',
    category: 'Xác thực (Auth)',
    method: 'DELETE',
    path: '/api/v1/auth/sessions/:sessionId',
    description: 'Hủy phiên đăng nhập của thiết bị khác bằng Session ID',
    requiresAuth: true,
    pathParams: ['sessionId']
  },
  {
    id: 'auth-revoke-all-sessions',
    name: 'Thu hồi toàn bộ Session khác',
    category: 'Xác thực (Auth)',
    method: 'DELETE',
    path: '/api/v1/auth/sessions',
    description: 'Đăng xuất tất cả các thiết bị khác ngoại trừ thiết bị hiện tại',
    requiresAuth: true
  },
  {
    id: 'auth-forgot-password',
    name: 'Quên mật khẩu',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/forgot-password',
    description: 'Gửi yêu cầu reset mật khẩu qua Email',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      email: 'tester123@example.com'
    }, null, 2)
  },
  {
    id: 'auth-reset-password',
    name: 'Đặt lại mật khẩu mới',
    category: 'Xác thực (Auth)',
    method: 'POST',
    path: '/api/v1/auth/reset-password',
    description: 'Khôi phục mật khẩu sử dụng OTP/Token được gửi từ Email',
    requiresAuth: false,
    defaultBody: JSON.stringify({
      token: 'otp-or-token-here',
      newPassword: 'NewPassword123'
    }, null, 2)
  }
];
