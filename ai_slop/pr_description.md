# 🚀 PR: Hệ Thống Trận Đấu Solo 1vs1, Đánh Giá AI Roadmap & Hàng Đợi Chấm Bài

## 📝 Tóm Tắt Công Việc Đã Thực Hiện

Chúng ta đã tái cấu trúc và phát triển thành công hệ thống Backend với kiến trúc **Monorepo gồm 2 Service lớn** chạy song song:
1. **`main-service`** (Cổng HTTP API Express + Socket.io Server): Phục vụ các API Auth, Problem CRUD, nộp bài, xem bảng xếp hạng ELO và hàng đợi tìm trận Solo 1vs1 trong thời gian thực.
2. **`worker-service`** (Background Worker): Lắng nghe hàng đợi BullMQ để chấm bài thông qua **Judge0 API** và xuất bản trạng thái kết quả thông qua **Redis Pub/Sub** về `main-service`.

---

## 🛠️ Chi Tiết Thay Đổi Kiến Trúc & Thiết Kế CSDL

Theo thống nhất tinh giản cơ sở dữ liệu để tối ưu hóa hiệu năng và phục vụ demo:
- **Loại bỏ Contest & Hack**: Tập trung hoàn toàn vào tính năng Solo 1vs1 thời gian thực.
- **Loại bỏ Badge & Snapshot ELO**: Chỉ lưu trữ thông số ELO (`elo_rating`), Streak (`streak_count`), Streak cao nhất (`max_streak`) trực tiếp trên bảng `User`.
- **Hệ thống Problem Lai (Hybrid DB)**:
  - **MySQL (`problem_index`)**: Lưu trữ chỉ mục tìm kiếm nhanh (slug, title, difficulty) và liên kết tag.
  - **MongoDB (`problems`)**: Lưu trữ chi tiết bài toán, starter code, cấu trúc giới hạn bộ nhớ/thời gian, và nội dung bài giải (`editorialMarkdown`, `editorialVideoUrl`).
- **Constant Languages**: Dùng hằng số định danh ngôn ngữ map trực tiếp sang Judge0 API (C++: 54, Java: 62, Python: 71).

---

## 🤖 Tích Hợp AI Gemini & Solo 1vs1 Realtime

1. **AI Personalized Roadmap & Interview Feedback**:
   - Tích hợp qua SDK `@google/generative-ai` (`gemini-1.5-flash`).
   - Hỗ trợ cơ chế **fallback** trả về dữ liệu mẫu chất lượng cao nếu chưa cấu hình `GEMINI_API_KEY`, giúp tránh lỗi trong quá trình chấm điểm hay chạy offline.
2. **Realtime Solo 1vs1 Matchmaking**:
   - Sử dụng thuật toán khớp cặp theo khoảng ELO gần nhất trên bộ nhớ đệm hàng đợi Socket.io.
   - Sử dụng **Redis Pub/Sub** để đồng bộ kết quả chấm bài từ `worker-service` về `main-service` để cập nhật ELO (+25 cho Winner, -15 cho Loser) và cập nhật realtime tiến độ làm bài của đối thủ.

---

## 🧪 Hướng Dẫn Chạy & Kiểm Thử Hệ Thống (Testing Guide)

### 1. Khởi chạy cơ sở dữ liệu và môi trường local
Đảm bảo bạn có sẵn:
- **MySQL**: Cổng `3307`
- **MongoDB**: Cổng `27017`
- **Redis**: Cổng `6379`

Cập nhật các biến môi trường trong file `.env` của `main-service` và `worker-service`:
```env
DATABASE_URL="mysql://root:password@localhost:3307/ocj_main_db"
MONGO_URI="mongodb://mongoadmin:mongosecret@localhost:27017/ocj_database?authSource=admin"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_ACCESS_SECRET="your-jwt-access-secret"
# RAPIDAPI_KEY="your-judge0-rapidapi-key" (Nếu không có, hệ thống tự động chạy Mock Runner)
# GEMINI_API_KEY="your-gemini-key" (Nếu không có, hệ thống tự động dùng Mock Interviewer Feedback)
```

Chạy lệnh cài đặt và build toàn bộ monorepo:
```bash
npm install
npm run build
```

Khởi chạy cả 2 Service:
```bash
# Terminal 1: Chạy main-service
npm run dev --workspace=main-service

# Terminal 2: Chạy worker-service
npm run dev --workspace=worker-service
```

---

### 2. Các Endpoint API HTTP Chính & Kịch Bản Kiểm Thử

#### A. Quản lý Bài toán (CRUD Problems)
*Yêu cầu quyền Admin (Token có Role: ADMIN)*

* **Tạo Bài toán mới** (`POST /api/v1/problems`):
  ```json
  {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "EASY",
    "timeLimit": 2000,
    "memoryLimit": 256,
    "starterCodes": {
      "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
      "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
      "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass"
    },
    "tags": ["Array", "Hash Table"]
  }
  ```

* **Thêm Testcase cho Bài toán** (`POST /api/v1/problems/:problemId/testcases`):
  ```json
  {
    "input": "[2,7,11,15]\n9",
    "output": "[0,1]",
    "isExample": true
  }
  ```

* **Lấy danh sách Bài toán** (`GET /api/v1/problems`): Phân trang, lọc theo độ khó/tag.

---

#### B. Nộp Bài Giải & Hàng Đợi BullMQ
*Yêu cầu đăng nhập (Token Auth)*

* **Nộp code giải bài** (`POST /api/v1/submissions`):
  ```json
  {
    "problemId": "ID_HOAC_SLUG_CUA_PROBLEM",
    "code": "print('hello')",
    "language": "python"
  }
  ```
  *Phản hồi ngay lập tức trả về status: `PENDING` và gửi Job chấm bài vào hàng đợi BullMQ.*

* **Xem danh sách nộp bài của User** (`GET /api/v1/submissions`)
* **Xem chi tiết Submission** (`GET /api/v1/submissions/:id`): Xem chi tiết số testcase đã qua, bộ nhớ sử dụng, và log lỗi compiler (nếu có).

---

#### C. AI & Bảng Xếp Hạng ELO

* **AI Sinh Lộ Trình Học** (`POST /api/v1/ai/roadmap`):
  * Body: `{"skills": ["basic array", "recursion"]}`
  * Kết quả trả về cấu trúc JSON Lộ trình gồm các node bài học và đề xuất bài tập DSA phù hợp.

* **AI Nhận Xét Mock Interview** (`POST /api/v1/ai/feedback/:submissionId`):
  * Nhận xét chi tiết về độ tối ưu Time & Space Complexity của code đã nộp.

* **Lấy Bảng Xếp Hạng ELO** (`GET /api/v1/leaderboard`): Trả về danh sách user sắp xếp theo ELO giảm dần, hiển thị streak hiện tại.

---

#### D. Kiểm Thử Solo 1vs1 Realtime (Socket.io)

1. Thiết lập kết nối socket đến cổng `6868` kèm theo auth token trong handshake payload:
   ```javascript
   const socket = io("http://localhost:6868", {
     auth: { token: "JWT_ACCESS_TOKEN" }
   });
   ```
2. Gửi sự kiện **`join-queue`** để xếp hàng chờ tìm trận.
3. Khi hệ thống tìm được đối thủ có ELO gần nhất:
   - Cả hai client nhận sự kiện **`match-found`** kèm theo chi tiết trận đấu (`matchId`), thông tin đối thủ và đề bài giải thuật ngẫu nhiên được chọn từ MongoDB.
4. Khi một trong hai người chơi nộp bài giải:
   - `worker-service` tiến hành chấm bài.
   - Khi hoàn thành, phát tín hiệu update qua **Redis Pub/Sub**.
   - Nếu kết quả là `ACCEPTED`, người nộp bài đầu tiên được công nhận là **Winner** (+25 ELO), đối thủ là **Loser** (-15 ELO), reset streak. Cả hai nhận sự kiện realtime **`match-ended`** báo cáo ELO mới.
5. Người chơi cũng có thể gửi sự kiện **`forfeit-match`** để đầu hàng đối thủ.
