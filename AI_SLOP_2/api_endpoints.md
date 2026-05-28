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
      "username": "user123", // String, min 3, max 50 (Bắt buộc)
      "email": "user@example.com", // String, email format (Bắt buộc)
      "password": "SecretPassword123" // String, min 6, max 100 (Bắt buộc)
    }
    ```
*   **Response mẫu (201 Created)**:
    ```json
    {
      "id": "12345678-abcd-ef01-2345-6789abcdef01",
      "username": "user123",
      "email": "user@example.com",
      "avatar_url": null,
      "role": "USER",
      "elo_rating": 1200,
      "streak_count": 0,
      "max_streak": 0,
      "code_coins": 0,
      "created_at": "2026-05-28T06:00:00.000Z",
      "updated_at": "2026-05-28T06:00:00.000Z"
    }
    ```

### Đăng nhập (Login)
*   **Endpoint**: `POST /api/v1/auth/login`
*   **Phân quyền**: Public
*   **Request Body**:
    ```json
    {
      "email": "user@example.com", // String, email format (Bắt buộc)
      "password": "SecretPassword123" // String (Bắt buộc)
    }
    ```
*   **Response mẫu (200 OK)**:
    ```json
    {
      "user": {
        "id": "12345678-abcd-ef01-2345-6789abcdef01",
        "username": "user123",
        "email": "user@example.com",
        "avatar_url": null,
        "role": "USER",
        "elo_rating": 1200
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
    ```

### Đăng xuất (Logout)
*   **Endpoint**: `POST /api/v1/auth/logout`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "refreshToken": "eyJhbGciOi..." // Refresh token cần thu hồi (Bắt buộc)
    }
    ```
*   **Response mẫu (200 OK)**:
    ```json
    {
      "status": "Success",
      "message": "Logged out successfully"
    }
    ```

### Làm mới token (Refresh Token)
*   **Endpoint**: `POST /api/v1/auth/refresh`
*   **Phân quyền**: Public
*   **Request Body**:
    ```json
    {
      "refreshToken": "eyJhbGciOi..." // Refresh token hiện tại (Bắt buộc)
    }
    ```
*   **Response mẫu (200 OK)**:
    ```json
    {
      "accessToken": "eyJhbGciOi_new..."
    }
    ```

### Lấy thông tin cá nhân (Get Current User)
*   **Endpoint**: `GET /api/v1/auth/me`
*   **Phân quyền**: User
*   **Response mẫu (200 OK)**:
    ```json
    {
      "id": "12345678-abcd-ef01-2345-6789abcdef01",
      "username": "user123",
      "email": "user@example.com",
      "role": "USER",
      "elo_rating": 1200,
      "streak_count": 0,
      "max_streak": 0
    }
    ```

### Đổi mật khẩu (Change Password)
*   **Endpoint**: `POST /api/v1/auth/change-password`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "oldPassword": "SecretPassword123", // String (Bắt buộc)
      "newPassword": "NewSecretPassword456" // String, min 6, max 100 (Bắt buộc)
    }
    ```

### Lấy danh sách phiên đăng nhập (Get User Sessions)
*   **Endpoint**: `GET /api/v1/auth/sessions`
*   **Phân quyền**: User
*   **Response mẫu (200 OK)**:
    ```json
    {
      "sessions": [
        {
          "id": "session-uuid",
          "token": "eyJ...",
          "user_id": "user-uuid",
          "expires_at": "2026-06-04T00:00:00Z",
          "user_agent": "Mozilla/5.0...",
          "ip_address": "127.0.0.1",
          "last_used_at": "2026-05-28T06:00:00Z",
          "is_revoked": false,
          "created_at": "2026-05-28T06:00:00Z"
        }
      ]
    }
    ```

### Thu hồi phiên cụ thể (Revoke Specific Session)
*   **Endpoint**: `DELETE /api/v1/auth/sessions/:sessionId`
*   **Phân quyền**: User

### Thu hồi toàn bộ các phiên khác (Revoke All Sessions)
*   **Endpoint**: `DELETE /api/v1/auth/sessions`
*   **Phân quyền**: User

### Yêu cầu quên mật khẩu (Forgot Password)
*   **Endpoint**: `POST /api/v1/auth/forgot-password`
*   **Phân quyền**: Public
*   **Request Body**:
    ```json
    {
      "email": "user@example.com" // String, email format (Bắt buộc)
    }
    ```

### Đặt lại mật khẩu (Reset Password)
*   **Endpoint**: `POST /api/v1/auth/reset-password`
*   **Phân quyền**: Public
*   **Request Body**:
    ```json
    {
      "token": "reset-token-uuid-sent-via-email", // String (Bắt buộc)
      "newPassword": "BrandNewPassword123" // String, min 6, max 100 (Bắt buộc)
    }
    ```

---

## 3. API BÀI TẬP & NHÃN PHÂN LOẠI (PROBLEMS & TAGS)

### Liệt kê thẻ phân loại (Get Tags)
*   **Endpoint**: `GET /api/v1/problems/tags`
*   **Phân quyền**: Public
*   **Response mẫu (200 OK)**:
    ```json
    {
      "status": "Success",
      "data": [
        { "id": "tag-uuid", "name": "Greedy", "slug": "greedy", "color": "#00FF00" }
      ]
    }
    ```

### Tạo mới thẻ phân loại (Create Tag)
*   **Endpoint**: `POST /api/v1/problems/tags`
*   **Phân quyền**: Admin
*   **Request Body**:
    ```json
    {
      "name": "Greedy", // String, unique (Bắt buộc)
      "color": "#00FF00" // String hex code, optional
    }
    ```

### Liệt kê bài tập (List Problems)
*   **Endpoint**: `GET /api/v1/problems`
*   **Phân quyền**: Public
*   **Query Parameters**:
    *   `difficulty`: Cấp độ (`EASY`, `MEDIUM`, `HARD`) - Tùy chọn.
    *   `tag`: Slug của tag (Ví dụ: `greedy`) - Tùy chọn.
    *   `page`: Trang hiện tại (Mặc định: 1) - Tùy chọn.
    *   `limit`: Số lượng/trang (Mặc định: 10) - Tùy chọn.
*   **Response mẫu (200 OK)**:
    ```json
    {
      "status": "Success",
      "data": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "items": [
          {
            "mongo_problem_id": "64a78cd9...",
            "title": "Sum of Two Numbers",
            "slug": "sum-of-two-numbers",
            "difficulty": "EASY",
            "created_at": "2026-05-28T06:00:00Z",
            "tags": [
              { "tag": { "name": "Greedy", "slug": "greedy", "color": "#00FF00" } }
            ]
          }
        ]
      }
    }
    ```

### Lấy chi tiết bài tập (Get Problem Details)
*   **Endpoint**: `GET /api/v1/problems/:slug`
*   **Phân quyền**: Public
*   **Response mẫu (200 OK)**:
    ```json
    {
      "status": "Success",
      "data": {
        "_id": "64a78cd9...",
        "title": "Sum of Two Numbers",
        "slug": "sum-of-two-numbers",
        "description": "Write a program that returns the sum of two integers...",
        "difficulty": "EASY",
        "timeLimit": 2000,
        "memoryLimit": 256,
        "starterCodes": {
          "cpp": "#include...",
          "java": "public class...",
          "python": "import sys..."
        },
        "editorialMarkdown": "Explain logic here...",
        "editorialVideoUrl": "https://..."
      }
    }
    ```

### Tạo bài tập mới (Create Problem)
*   **Endpoint**: `POST /api/v1/problems`
*   **Phân quyền**: Admin
*   **Request Body**:
    ```json
    {
      "title": "Sum of Two Numbers", // String, min 3, max 255 (Bắt buộc)
      "description": "Problem desc...", // String, min 10 (Bắt buộc)
      "difficulty": "EASY", // 'EASY' | 'MEDIUM' | 'HARD' (Bắt buộc)
      "timeLimit": 2000, // Number, ms (Bắt buộc)
      "memoryLimit": 256, // Number, MB (Bắt buộc)
      "starterCodes": { // Optional
        "cpp": "code_here",
        "java": "code_here",
        "python": "code_here"
      },
      "editorialMarkdown": "Markdown solved solution...", // Optional
      "editorialVideoUrl": "https://...", // Optional
      "tags": ["uuid-tag-1", "uuid-tag-2"] // Array of tag UUIDs (Bắt buộc)
    }
    ```

### Cập nhật bài tập (Update Problem)
*   **Endpoint**: `PUT /api/v1/problems/:id`
*   **Phân quyền**: Admin
*   **Request Body**: Gửi các trường tương tự như tạo mới để cập nhật (Không bắt buộc gửi đầy đủ).

### Xóa bài tập (Delete Problem)
*   **Endpoint**: `DELETE /api/v1/problems/:id`
*   **Phân quyền**: Admin

### Thêm testcase cho bài tập (Add Testcase)
*   **Endpoint**: `POST /api/v1/problems/:problemId/testcases`
*   **Phân quyền**: Admin
*   **Request Body**:
    ```json
    {
      "input": "2 3", // Dữ liệu đầu vào (Bắt buộc)
      "output": "5", // Dữ liệu mong muốn đầu ra (Bắt buộc)
      "isExample": true // True nếu làm ví dụ mô tả, False để làm test ẩn (Mặc định: false)
    }
    ```

### Xem danh sách testcase của bài tập (Get Testcases)
*   **Endpoint**: `GET /api/v1/problems/:problemId/testcases`
*   **Phân quyền**: User
*   **Query Parameters**:
    *   `example`: `true` nếu chỉ muốn lấy testcase ví dụ, `false` lấy toàn bộ (Mặc định: false).

### Xóa testcase (Delete Testcase)
*   **Endpoint**: `DELETE /api/v1/problems/testcases/:testcaseId`
*   **Phân quyền**: Admin

---

## 4. API NỘP BÀI CHẤM ĐIỂM (SUBMISSIONS)

### Nộp mã nguồn chấm bài (Submit Code)
*   **Endpoint**: `POST /api/v1/submissions`
*   **Phân quyền**: User
*   **Request Body**:
    ```json
    {
      "problemId": "64a78cd9...", // MongoDB Problem ObjectId hoặc Slug (Bắt buộc)
      "language": "python", // 'cpp' | 'java' | 'python' (Bắt buộc)
      "code": "import sys\nprint(sum(map(int, sys.stdin.read().split())))" // Min 10 chars (Bắt buộc)
    }
    ```
*   **Response mẫu (201 Created)**:
    ```json
    {
      "status": "Success",
      "data": {
        "_id": "65b9cd20...",
        "userId": "user-uuid",
        "problemId": "64a78cd9...",
        "code": "...",
        "language": "python",
        "status": "PENDING",
        "testCasesPassed": 0,
        "testCasesTotal": 0,
        "createdAt": "2026-05-28T06:10:00Z"
      }
    }
    ```

### Lấy danh sách bài nộp của User (Get User Submissions)
*   **Endpoint**: `GET /api/v1/submissions`
*   **Phân quyền**: User
*   **Query Parameters**:
    *   `problemId`: ID bài tập để lọc - Tùy chọn.
    *   `page`: Trang hiện tại (Mặc định: 1) - Tùy chọn.
    *   `limit`: Số lượng/trang (Mặc định: 10) - Tùy chọn.

### Lấy chi tiết một bài nộp (Get Submission Details)
*   **Endpoint**: `GET /api/v1/submissions/:id`
*   **Phân quyền**: User (Chỉ tác giả của bài nộp hoặc Admin mới có quyền truy cập)

---

## 5. API TÍCH HỢP TRÍ TUỆ NHÂN TẠO AI (AI TOOLS)

### Tạo lộ trình học thuật thuật toán (Generate DSA Roadmap)
*   **Endpoint**: `POST /api/v1/ai/roadmap`
*   **Phân quyền**: User
*   **Request Body**: Nhận bất kỳ JSON đối tượng câu hỏi nào, ví dụ:
    ```json
    {
      "skillLevel": "BEGINNER",
      "focusArea": "Dynamic Programming",
      "studyHoursPerWeek": 10
    }
    ```
*   **Response mẫu (200 OK)**: Trả về Roadmap JSON dạng cấu trúc cây (Topic, mô tả, số tuần ước lượng và bài tập gợi ý).

### Đánh giá và nhận xét code bài nộp (AI Mock Interview Feedback)
*   **Endpoint**: `POST /api/v1/ai/feedback/:submissionId`
*   **Phân quyền**: User
*   **Response mẫu (200 OK)**:
    ```json
    {
      "status": "Success",
      "data": {
        "feedback": "### AI Interviewer Feedback...\n1. Code Correctness...\n2. Time Complexity: O(N)..."
      }
    }
    ```

---

## 6. API BẢNG XẾP HẠNG (LEADERBOARD)

### Lấy bảng xếp hạng theo ELO (Get ELO Leaderboard)
*   **Endpoint**: `GET /api/v1/leaderboard`
*   **Phân quyền**: Public
*   **Query Parameters**:
    *   `page`: Trang hiện tại (Mặc định: 1) - Tùy chọn.
    *   `limit`: Số lượng/trang (Mặc định: 10) - Tùy chọn.
