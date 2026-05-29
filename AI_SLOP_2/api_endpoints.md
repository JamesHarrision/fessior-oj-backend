# DANH SÁCH CHI TIẾT API ENDPOINTS (ONLINE JUDGE SYSTEM)

Hệ thống cung cấp các API RESTful phục vụ cho giao diện Frontend. Toàn bộ các API đều bắt đầu bằng tiền tố `/api/v1`.

---

## 1. PHÂN QUYỀN TRUY CẬP (ACCESS ROLES)
*   **Public**: Bất kỳ ai cũng có thể truy cập mà không cần mã thông báo.
*   **User (Authenticated)**: Yêu cầu đính kèm header `Authorization: Bearer <Access_Token>`.
*   **Admin**: Yêu cầu đính kèm header `Authorization: Bearer <Access_Token>` và tài khoản phải có quyền `ADMIN`.

---

## 2. API XÁC THỰC & TÀI KHOẢN (AUTHENTICATION)

### Đăng ký tài khoản (Register)
*   **Endpoint**: `POST /api/v1/auth/register`
*   **Phân quyền**: Public
*   **Request Body**:
    ```json
    {
      "username": "user123",
      "email": "user@example.com",
      "password": "SecretPassword123"
    }
    ```

### Đăng nhập (Login)
*   **Endpoint**: `POST /api/v1/auth/login`
*   **Phân quyền**: Public
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "SecretPassword123"
    }
    ```

### Đăng xuất (Logout)
*   **Endpoint**: `POST /api/v1/auth/logout`
*   **Phân quyền**: User

---

## 3. API BÀI TẬP & NHÃN PHÂN LOẠI (PROBLEMS & TAGS)

### Liệt kê thẻ phân loại (Get Tags)
*   **Endpoint**: `GET /api/v1/problems/tags`

### Tạo mới thẻ phân loại (Create Tag)
*   **Endpoint**: `POST /api/v1/problems/tags`
*   **Phân quyền**: Admin

### Liệt kê bài tập (List Problems)
*   **Endpoint**: `GET /api/v1/problems`
*   **Query Parameters**: `difficulty`, `tag`, `page`, `limit`

### Lấy chi tiết bài tập (Get Problem Details)
*   **Endpoint**: `GET /api/v1/problems/:slug`

### Tạo bài tập mới (Create Problem)
*   **Endpoint**: `POST /api/v1/problems`
*   **Phân quyền**: Admin

---

## 4. API NỘP BÀI CHẤM ĐIỂM (SUBMISSIONS)

### Nộp mã nguồn chấm bài (Submit Code)
*   **Endpoint**: `POST /api/v1/submissions`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "problemId": "64a78cd9...",
      "language": "python",
      "code": "import sys\nprint(sum(map(int, sys.stdin.read().split())))"
    }
    ```

### Lấy danh sách bài nộp của User (Get User Submissions)
*   **Endpoint**: `GET /api/v1/submissions`

---

## 5. API TÍCH HỢP TRÍ TUỆ NHÂN TẠO AI (AI TOOLS)

### Tạo lộ trình học thuật thuật toán (Generate DSA Roadmap)
*   **Endpoint**: `POST /api/v1/ai/roadmap`

### Đánh giá và nhận xét code bài nộp (AI Mock Interview Feedback)
*   **Endpoint**: `POST /api/v1/ai/feedback/:submissionId`

---

## 6. API PHÒNG ĐẤU TÙY CHỈNH & TRẬN ĐẤU (CUSTOM ROOMS & MATCHES)

### Tạo phòng đấu tùy chỉnh (Create Custom Room)
*   **Endpoint**: `POST /api/v1/rooms/create`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "problemId": "64a78cd9...", // MongoDB Problem ObjectId (Tùy chọn)
      "difficulty": "EASY" // EASY | MEDIUM | HARD (Bắt buộc nếu không chọn problemId)
    }
    ```

### Lấy phòng đấu đang hoạt động (Get Active Rooms)
*   **Endpoint**: `GET /api/v1/rooms/active`
*   **Phân quyền**: User

### Tham gia phòng đấu (Join Room)
*   **Endpoint**: `POST /api/v1/rooms/join`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "roomCode": "ABCD12"
    }
    ```

### Cập nhật cấu hình phòng (Update Room Config)
*   **Endpoint**: `PUT /api/v1/rooms/:roomId`
*   **Phân quyền**: User (Chủ phòng)
*   **Request Body**:
    ```json
    {
      "difficulty": "MEDIUM",
      "problemId": "64a78cd9..."
    }
    ```

### Rời khỏi phòng (Leave Room)
*   **Endpoint**: `POST /api/v1/rooms/leave`
*   **Phân quyền**: User

---

## 7. API GIẢI ĐẤU & CUỘC THI (CONTESTS)

### Tạo cuộc thi mới (Create Contest)
*   **Endpoint**: `POST /api/v1/contests`
*   **Phân quyền**: Admin
*   **Request Body**:
    ```json
    {
      "title": "Summer Code Clash",
      "description": "Contest description",
      "startTime": "2026-06-01T12:00:00.000Z",
      "endTime": "2026-06-01T15:00:00.000Z",
      "problems": [
        { "problemId": "64a78...", "points": 100, "order": 1 }
      ]
    }
    ```

### Đăng ký tham gia (Register Contest)
*   **Endpoint**: `POST /api/v1/contests/:contestId/register`
*   **Phân quyền**: User

### Bảng xếp hạng cuộc thi (Get Contest Standings/Leaderboard)
*   **Endpoint**: `GET /api/v1/contests/:contestId/leaderboard`
*   **Phân quyền**: Public

---

## 8. API THẢO LUẬN & BÌNH LUẬN (DISCUSSIONS & COMMENTS)

### Gửi bình luận mới (Create Comment)
*   **Endpoint**: `POST /api/v1/comments`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "targetId": "64a78...", // Target ID (Problem, Contest hoặc Comment)
      "targetType": "PROBLEM", // PROBLEM | CONTEST | DISCUSSION | COMMENT
      "content": "This is a great task!"
    }
    ```

### Lấy danh sách bình luận (Get Comments)
*   **Endpoint**: `GET /api/v1/comments`
*   **Query Parameters**: `targetId`, `targetType`

---

## 9. API BẠN BÈ & TRẠNG THÁI ONLINE (SOCIAL & FRIENDS)

### Lấy danh sách bạn bè & Trạng thái Online (Get Friends & Presence)
*   **Endpoint**: `GET /api/v1/friends`
*   **Phân quyền**: User
*   **Response mẫu**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "friend-user-uuid",
          "username": "coder_friend",
          "avatar_url": "https://...",
          "elo_rating": 1300,
          "is_online": true // Trạng thái online thực tế lấy từ Redis
        }
      ]
    }
    ```

### Gửi yêu cầu kết bạn (Send Friend Request)
*   **Endpoint**: `POST /api/v1/friends/request`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "receiverId": "receiver-user-uuid"
    }
    ```

### Phản hồi yêu cầu kết bạn (Respond to Friend Request)
*   **Endpoint**: `POST /api/v1/friends/respond`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "senderId": "sender-user-uuid",
      "action": "ACCEPT" // ACCEPT | DECLINE
    }
    ```

---

## 10. API CỬA HÀNG & KHO ĐỒ (SHOP & INVENTORY)

### Lấy danh sách vật phẩm shop (Get Shop Items)
*   **Endpoint**: `GET /api/v1/shop/items`

### Mua vật phẩm (Buy Item)
*   **Endpoint**: `POST /api/v1/shop/buy`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "itemId": "shop-item-uuid"
    }
    ```

### Xem kho đồ cá nhân (Get Inventory)
*   **Endpoint**: `GET /api/v1/shop/inventory`
*   **Phân quyền**: User

### Trang bị vật phẩm (Equip Item)
*   **Endpoint**: `POST /api/v1/shop/inventory/equip`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "inventoryItemId": "inventory-item-uuid"
    }
    ```

---

## 11. API THÔNG BÁO (NOTIFICATIONS)

### Lấy danh sách thông báo (Get Notifications)
*   **Endpoint**: `GET /api/v1/notifications`
*   **Phân quyền**: User
*   **Query Parameters**: `page`, `limit`

### Đánh dấu thông báo đã đọc (Mark Read)
*   **Endpoint**: `PUT /api/v1/notifications/read`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "notificationIds": ["uuid-1", "uuid-2"]
    }
    ```

---

## 12. API BÁO CÁO (REPORTS)

### Gửi báo cáo lỗi/gian lận (Submit Report)
*   **Endpoint**: `POST /api/v1/reports`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "type": "BUG", // BUG | TYPO | CHEATING | OTHERS
      "content": "Description of the report...",
      "problemId": "64a78..." // Tùy chọn (Nếu báo cáo lỗi bài tập)
    }
    ```

### Cập nhật trạng thái báo cáo (Update Report Status)
*   **Endpoint**: `PUT /api/v1/reports/:reportId`
*   **Phân quyền**: Admin
*   **Request Body**:
    ```json
    {
      "status": "RESOLVED" // PENDING | RESOLVED | REJECTED
    }
    ```
