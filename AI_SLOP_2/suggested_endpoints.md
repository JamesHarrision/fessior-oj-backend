# DANH SÁCH API ENDPOINTS ĐỀ XUẤT PHÁT TRIỂN THÊM (BACKLOG)

Tài liệu này tổng hợp danh sách các API đề xuất phát triển thêm, phân chia theo từng nhóm chức năng cụ thể và cung cấp đầy đủ các thao tác Thêm, Đọc, Sửa, Xóa (CRUD) giúp lập trình viên khác dễ dàng tích hợp và phát triển code.

---

## 1. PHÒNG ĐẤU TÙY CHỈNH & TRẬN ĐẤU (CUSTOM ROOMS & MATCHES)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/rooms/create` | User | Tạo phòng đấu 1v1 tùy chỉnh (nhận `roomCode`) |
| **GET** | `/api/v1/rooms/active` | User | Lấy danh sách các phòng đấu custom đang chờ đối thủ |
| **GET** | `/api/v1/rooms/:roomId` | User | Xem chi tiết phòng đấu (thông tin người tham gia, trạng thái) |
| **POST** | `/api/v1/rooms/join` | User | Tham gia phòng đấu bằng mã `roomCode` |
| **POST** | `/api/v1/rooms/leave` | User | Rời khỏi phòng đấu custom hiện tại |
| **PUT** | `/api/v1/rooms/:roomId` | User | Cập nhật cấu hình phòng (độ khó bài, thời gian...) - Chủ phòng |
| **DELETE** | `/api/v1/rooms/:roomId` | User | Hủy phòng đấu custom - Chủ phòng |
| **GET** | `/api/v1/matches/history` | User | Xem danh sách lịch sử đấu 1v1 của bản thân (phân trang) |
| **GET** | `/api/v1/matches/:matchId` | User | Xem chi tiết thông số của một trận đấu đã kết thúc |
| **DELETE** | `/api/v1/matches/:matchId` | Admin | Xóa bản ghi lịch sử trận đấu cụ thể khỏi hệ thống |

---

## 2. GIẢI ĐẤU & CUỘC THI (CONTESTS)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/contests` | Admin | Tạo cuộc thi/giải đấu mới (lên lịch bắt đầu/kết thúc) |
| **GET** | `/api/v1/contests` | Public | Lấy danh sách cuộc thi (lọc theo: Đang diễn ra, Sắp tới, Đã qua) |
| **GET** | `/api/v1/contests/:contestId` | Public | Lấy chi tiết thông tin cuộc thi |
| **PUT** | `/api/v1/contests/:contestId` | Admin | Chỉnh sửa thông tin cuộc thi (tên, mô tả, danh sách bài tập) |
| **DELETE** | `/api/v1/contests/:contestId` | Admin | Xóa hoàn toàn cuộc thi khỏi hệ thống |
| **POST** | `/api/v1/contests/:contestId/register` | User | Đăng ký tham gia cuộc thi |
| **POST** | `/api/v1/contests/:contestId/unregister` | User | Hủy đăng ký tham gia cuộc thi |
| **GET** | `/api/v1/contests/:contestId/problems` | User | Lấy danh sách bài tập của cuộc thi (chỉ mở khi cuộc thi bắt đầu) |
| **GET** | `/api/v1/contests/:contestId/submissions` | User | Xem các bài nộp của bản thân hoặc toàn bộ thí sinh trong cuộc thi |
| **GET** | `/api/v1/contests/:contestId/leaderboard` | Public | Bảng xếp hạng thời gian thực của cuộc thi (Contest Standings) |

---

## 3. THẢO LUẬN & BÌNH LUẬN (DISCUSSIONS & COMMENTS)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/problems/:problemId/comments` | User | Gửi bình luận/thảo luận mới hoặc reply dưới một bài tập |
| **GET** | `/api/v1/problems/:problemId/comments` | Public | Lấy danh sách thảo luận của bài tập (hỗ trợ phân trang) |
| **GET** | `/api/v1/comments/:commentId` | Public | Xem chi tiết bình luận kèm theo toàn bộ câu trả lời (replies) |
| **PUT** | `/api/v1/comments/:commentId` | User | Cập nhật/Sửa nội dung bình luận của bản thân |
| **DELETE** | `/api/v1/comments/:commentId` | User/Admin | Xóa bình luận (chỉ tác giả bình luận hoặc Admin được xóa) |
| **POST** | `/api/v1/comments/:commentId/like` | User | Thích (Like) bình luận của người khác |
| **DELETE** | `/api/v1/comments/:commentId/like` | User | Bỏ thích (Unlike) bình luận |

---

## 4. BẠN BÈ & MẠNG XÃ HỘI (SOCIAL & FRIENDS)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/social/friends` | User | Xem danh sách bạn bè hiện tại (và trạng thái online/offline) |
| **POST** | `/api/v1/social/friends/request` | User | Gửi yêu cầu kết bạn tới người chơi khác |
| **GET** | `/api/v1/social/friends/requests/received` | User | Xem danh sách các yêu cầu kết bạn đã nhận |
| **GET** | `/api/v1/social/friends/requests/sent` | User | Xem danh sách các yêu cầu kết bạn đã gửi đi |
| **POST** | `/api/v1/social/friends/respond` | User | Chấp nhận (ACCEPT) hoặc từ chối (REJECT) yêu cầu kết bạn |
| **DELETE** | `/api/v1/social/friends/:friendId` | User | Hủy kết bạn (Unfriend) |
| **POST** | `/api/v1/social/block/:userId` | User | Chặn (Block) người dùng khác |
| **DELETE** | `/api/v1/social/unblock/:userId` | User | Hủy chặn (Unblock) người dùng |

---

## 5. CỬA HÀNG & KHO ĐỒ CÁ NHÂN (SHOP & INVENTORY)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/shop/items` | Public | Xem danh sách vật phẩm ảo bán trong shop (Avatar Frame, Khung viền,...) |
| **POST** | `/api/v1/shop/items` | Admin | Tạo/Thêm vật phẩm mới vào shop |
| **PUT** | `/api/v1/shop/items/:itemId` | Admin | Sửa đổi thông tin vật phẩm trong shop (giá xu, hình ảnh) |
| **DELETE** | `/api/v1/shop/items/:itemId` | Admin | Xóa vật phẩm khỏi shop |
| **POST** | `/api/v1/shop/buy` | User | Mua vật phẩm từ shop bằng xu (`code_coins`) |
| **GET** | `/api/v1/inventory` | User | Lấy danh sách các vật phẩm cá nhân đang sở hữu |
| **POST** | `/api/v1/inventory/equip` | User | Trang bị vật phẩm (Ví dụ: Đổi khung viền avatar đang dùng) |
| **POST** | `/api/v1/inventory/unequip` | User | Hủy trang bị vật phẩm đang dùng |

---

## 6. THÔNG BÁO HỆ THỐNG (NOTIFICATIONS)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/notifications` | User | Lấy danh sách thông báo cá nhân (kết bạn, kết quả chấm, đấu 1v1) |
| **PUT** | `/api/v1/notifications/:notificationId/read` | User | Đánh dấu một thông báo cụ thể là đã đọc |
| **PUT** | `/api/v1/notifications/read-all` | User | Đánh dấu đã đọc tất cả thông báo |
| **DELETE** | `/api/v1/notifications/:notificationId` | User | Xóa một thông báo cụ thể |
| **DELETE** | `/api/v1/notifications` | User | Xóa toàn bộ thông báo |

---

## 7. BÁO CÁO & GÓP Ý (REPORTS & FEEDBACK)

| Phương thức | API Endpoint | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/reports` | User | Gửi báo cáo lỗi hệ thống, đề bài sai hoặc hành vi gian lận |
| **GET** | `/api/v1/reports` | Admin | Lấy danh sách báo cáo cần xử lý |
| **GET** | `/api/v1/reports/:reportId` | Admin | Xem chi tiết nội dung báo cáo |
| **PUT** | `/api/v1/reports/:reportId` | Admin | Cập nhật trạng thái xử lý của báo cáo (`PENDING`, `RESOLVED`) |
| **DELETE** | `/api/v1/reports/:reportId` | Admin | Xóa bỏ bản ghi báo cáo khỏi hệ thống |
