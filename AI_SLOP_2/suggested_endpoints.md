# TRẠNG THÁI TRIỂN KHAI CÁC API ENDPOINTS ĐỀ XUẤT (BACKLOG)

Tất cả các API đề xuất phát triển thêm trong backlog trước đó đã được xây dựng, kiểm thử tích hợp đầy đủ bằng Jest và sẵn sàng đưa vào vận hành. Dưới đây là bảng tổng hợp trạng thái thực tế của từng nhóm.

---

## 1. PHÒNG ĐẤU TÙY CHỈNH & TRẬN ĐẤU (CUSTOM ROOMS & MATCHES)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/rooms/create` | User | **ĐÃ HOÀN THÀNH** | Tạo phòng 1v1 tùy chọn |
| **GET** | `/api/v1/rooms/active` | User | **ĐÃ HOÀN THÀNH** | Lấy phòng chờ |
| **GET** | `/api/v1/rooms/:roomId` | User | **ĐÃ HOÀN THÀNH** | Chi tiết thông tin phòng |
| **POST** | `/api/v1/rooms/join` | User | **ĐÃ HOÀN THÀNH** | Join phòng bằng mã code |
| **POST** | `/api/v1/rooms/leave` | User | **ĐÃ HOÀN THÀNH** | Rời phòng hiện tại |
| **PUT** | `/api/v1/rooms/:roomId` | User | **ĐÃ HOÀN THÀNH** | Cập nhật cấu hình phòng |
| **DELETE** | `/api/v1/rooms/:roomId` | User | **ĐÃ HOÀN THÀNH** | Hủy phòng |
| **GET** | `/api/v1/matches/history` | User | **ĐÃ HOÀN THÀNH** | Xem lịch sử đấu cá nhân |
| **GET** | `/api/v1/matches/:matchId` | User | **ĐÃ HOÀN THÀNH** | Chi tiết trận đấu |

---

## 2. GIẢI ĐẤU & CUỘC THI (CONTESTS)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/contests` | Admin | **ĐÃ HOÀN THÀNH** | Tạo contest |
| **GET** | `/api/v1/contests` | Public | **ĐÃ HOÀN THÀNH** | Danh sách contest phân trang |
| **GET** | `/api/v1/contests/:contestId` | Public | **ĐÃ HOÀN THÀNH** | Chi tiết cuộc thi |
| **PUT** | `/api/v1/contests/:contestId` | Admin | **ĐÃ HOÀN THÀNH** | Cập nhật cuộc thi |
| **DELETE** | `/api/v1/contests/:contestId` | Admin | **ĐÃ HOÀN THÀNH** | Xóa cuộc thi |
| **POST** | `/api/v1/contests/:contestId/register` | User | **ĐÃ HOÀN THÀNH** | Đăng ký tham gia |
| **POST** | `/api/v1/contests/:contestId/unregister` | User | **ĐÃ HOÀN THÀNH** | Hủy đăng ký |
| **GET** | `/api/v1/contests/:contestId/problems` | User | **ĐÃ HOÀN THÀNH** | Danh sách bài tập của contest |
| **GET** | `/api/v1/contests/:contestId/leaderboard` | Public | **ĐÃ HOÀN THÀNH** | Bảng xếp hạng Contest thời gian thực |

---

## 3. THẢO LUẬN & BÌNH LUẬN (DISCUSSIONS & COMMENTS)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/comments` | User | **ĐÃ HOÀN THÀNH** | Tạo bình luận đa diện |
| **GET** | `/api/v1/comments` | Public | **ĐÃ HOÀN THÀNH** | Danh sách bình luận theo target |
| **GET** | `/api/v1/comments/:commentId` | Public | **ĐÃ HOÀN THÀNH** | Chi tiết bình luận & replies |
| **PUT** | `/api/v1/comments/:commentId` | User | **ĐÃ HOÀN THÀNH** | Sửa bình luận |
| **DELETE** | `/api/v1/comments/:commentId` | User/Admin | **ĐÃ HOÀN THÀNH** | Xóa bình luận |
| **POST** | `/api/v1/comments/:commentId/like` | User | **ĐÃ HOÀN THÀNH** | Thích bình luận |
| **DELETE** | `/api/v1/comments/:commentId/like` | User | **ĐÃ HOÀN THÀNH** | Bỏ thích bình luận |

---

## 4. BẠN BÈ & MẠNG XÃ HỘI (SOCIAL & FRIENDS)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/friends` | User | **ĐÃ HOÀN THÀNH** | Lấy danh sách bạn bè & presence |
| **POST** | `/api/v1/friends/request` | User | **ĐÃ HOÀN THÀNH** | Gửi yêu cầu kết bạn |
| **GET** | `/api/v1/friends/requests` | User | **ĐÃ HOÀN THÀNH** | Lọc yêu cầu nhận/gửi |
| **POST** | `/api/v1/friends/respond` | User | **ĐÃ HOÀN THÀNH** | Chấp nhận/Từ chối kết bạn |
| **DELETE** | `/api/v1/friends/:friendId` | User | **ĐÃ HOÀN THÀNH** | Hủy kết bạn |

---

## 5. CỬA HÀNG & KHO ĐỒ CÁ NHÂN (SHOP & INVENTORY)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/shop/items` | Public | **ĐÃ HOÀN THÀNH** | Danh sách vật phẩm |
| **POST** | `/api/v1/shop/items` | Admin | **ĐÃ HOÀN THÀNH** | Thêm vật phẩm |
| **PUT** | `/api/v1/shop/items/:itemId` | Admin | **ĐÃ HOÀN THÀNH** | Sửa vật phẩm |
| **DELETE** | `/api/v1/shop/items/:itemId` | Admin | **ĐÃ HOÀN THÀNH** | Xóa vật phẩm |
| **POST** | `/api/v1/shop/buy` | User | **ĐÃ HOÀN THÀNH** | Mua vật phẩm bằng Code Coin |
| **GET** | `/api/v1/shop/inventory` | User | **ĐÃ HOÀN THÀNH** | Kho đồ cá nhân |
| **POST** | `/api/v1/shop/inventory/equip` | User | **ĐÃ HOÀN THÀNH** | Trang bị vật phẩm |
| **POST** | `/api/v1/shop/inventory/unequip` | User | **ĐÃ HOÀN THÀNH** | Hủy trang bị |

---

## 6. THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/notifications` | User | **ĐÃ HOÀN THÀNH** | Lấy thông báo phân trang |
| **PUT** | `/api/v1/notifications/read` | User | **ĐÃ HOÀN THÀNH** | Đánh dấu đã đọc nhiều thông báo |
| **DELETE** | `/api/v1/notifications/:notificationId` | User | **ĐÃ HOÀN THÀNH** | Xóa thông báo cụ thể |

---

## 7. BÁO CÁO & GÓP Ý (REPORTS & FEEDBACK)

| Phương thức | API Endpoint | Phân quyền | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/reports` | User | **ĐÃ HOÀN THÀNH** | Gửi báo cáo lỗi/cheat |
| **GET** | `/api/v1/reports` | Admin/User | **ĐÃ HOÀN THÀNH** | Danh sách báo cáo theo phân quyền |
| **PUT** | `/api/v1/reports/:reportId` | Admin | **ĐÃ HOÀN THÀNH** | Cập nhật trạng thái xử lý |
