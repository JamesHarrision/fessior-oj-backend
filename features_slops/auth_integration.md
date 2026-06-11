# Tài liệu Tích hợp Xác thực (Authentication Integration)

Chúng ta đã triển khai hệ thống đăng nhập, đăng ký và theo dõi phiên làm việc thực tế cho Client đồng bộ với Backend API.

## 1. Danh sách APIs Sử dụng
- `POST /api/v1/auth/register`: Đăng ký tài khoản mới (nhận `username`, `email`, `password`).
- `POST /api/v1/auth/login`: Đăng nhập lấy mã `accessToken` và `refreshToken` lưu vào `localStorage`.
- `POST /api/v1/auth/logout`: Xóa phiên làm việc trên database và dọn sạch tokens tại Client.
- `GET /api/v1/auth/me`: Lấy thông tin tài khoản đang đăng nhập (nhận thông tin `username`, ELO rating `elo_rating`, chuỗi thắng `streak_count`, ảnh đại diện `avatar_url`).

## 2. Cấu trúc Components & Logic
- **`services/api.ts`**: Wrapper fetch tự động thêm header `Authorization: Bearer <token>` nếu có token trong `localStorage`.
- **`context/AuthContext.tsx`**: Provider quản lý tập trung trạng thái đăng nhập, profile người dùng và cung cấp các hàm `login()`, `register()`, `logout()`. Tự động gọi API `/auth/me` để phục hồi phiên khi tải lại trang.
- **`components/auth/AuthModal.tsx` & `.css`**: Overlay mờ kính cường lực (glassmorphism) cho phép chuyển đổi nhanh chóng giữa chế độ Đăng nhập và Đăng ký.
