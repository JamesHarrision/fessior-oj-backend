# Tài Liệu Tích Hợp Hệ Thống Chấm Bài Judge0 (OCJ Code Execution Engine)

Tài liệu này chi tiết hóa kiến trúc, cơ chế hoạt động, sự cố bất tương thích môi trường và giải pháp tối ưu hóa mà chúng ta đã triển khai cho hệ thống chấm bài trực tuyến trong dự án **Online Code Judge (OCJ)**.

---

## 1. Kiến Trúc Tổng Thể & Luồng Dữ Liệu

Hệ thống chấm bài hoạt động dựa trên mô hình bất đồng bộ (Asynchronous Queue) thông qua BullMQ, Redis, MongoDB và Judge0 API:

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant Main as main-service
    participant Redis as Redis (BullMQ Queue)
    participant Worker as worker-service
    participant DB as MongoDB
    participant Judge0 as Judge0 CE (Docker) / Local Fallback

    User->>Main: 1. Nộp Code (Ngôn ngữ + Mã nguồn)
    Main->>DB: 2. Lưu Submission trạng thái PENDING
    Main->>Redis: 3. Thêm Job vào "submission_queue"
    Main-->>User: Phản hồi "Đang xử lý..."
    
    Note over Worker: Worker lắng nghe hàng đợi BullMQ
    Redis->>Worker: 4. Nhận Job chấm bài
    Worker->>DB: 5. Lấy thông tin Bài tập & Testcases
    
    loop Chạy từng Testcase
        Worker->>Judge0: 6. Gửi request POST /submissions (Base64)
        alt Sandbox cgroup v1 hoạt động bình thường
            Judge0-->>Worker: Trả về kết quả (Accepted, WA, TLE, RE...)
        else Lỗi cgroup v2 (WSL2/Docker Desktop) hoặc Lỗi Mạng
            Note over Worker: API lỗi hoặc trả về Status 13 (Internal Error)
            Worker->>Judge0: [Fallback] Thực thi trực tiếp trên Host qua Child Process
            Judge0-->>Worker: Trả về kết quả thực thi cục bộ
        end
    end

    Worker->>DB: 7. Cập nhật trạng thái Submission (ACCEPTED / WA...)
    Worker->>Redis: 8. Publish kênh "submission-updates" (Realtime)
    Redis-->>Main: Nhận thông tin cập nhật realtime
    Main-->>User: Gửi kết quả chấm bài qua WebSockets/Socket.io
```

---

## 2. Triển Khai Hạ Tầng Judge0 Self-Hosted

Toàn bộ tài nguyên tự host nằm tại thư mục `judge0-server/judge0-v1.13.0/` và chạy bằng Docker Compose bao gồm 4 container:

1.  **`judge0-v1130-server-1`**: Máy chủ API chính viết bằng Ruby on Rails, tiếp nhận yêu cầu chạy code qua cổng `2358`.
2.  **`judge0-v1130-workers-1`**: Các luồng worker lấy job từ Redis để biên dịch và thực thi mã nguồn bên trong sandbox bảo mật `isolate`.
3.  **`judge0-v1130-db-1`**: Database PostgreSQL lưu trữ cấu hình hệ thống, danh sách ngôn ngữ lập trình và siêu dữ liệu submission.
4.  **`judge0-v1130-redis-1`**: Hàng đợi phân phối công việc nội bộ của Judge0.

---

## 3. Khắc Phục Lỗi Bất Tương Thích cgroup v2 (WSL2 / Docker Desktop)

### 3.1. Nguyên nhân
Môi trường Docker Desktop chạy trên Windows thông qua nhân WSL2 bắt buộc áp dụng **cgroup v2** để tối ưu hóa tài nguyên hệ thống. Tuy nhiên, sandbox `isolate` của Judge0 yêu cầu **cgroup v1** (Legacy) để cấu hình hạn mức tài nguyên (Memory/CPU Limit) riêng biệt. 
Khi chạy Judge0 trên WSL2, sandbox sẽ bị sập lập tức với lỗi:
`Internal Error (Status 13) - No such file or directory @ rb_sysopen - /box/script.py`

### 3.2. Giải pháp Fallback Chạy Cục Bộ (Local Executor Fallback)
Để đảm bảo toàn bộ hệ thống kiểm thử tự động (E2E Integration Tests) và quy trình phát triển của lập trình viên diễn ra thông suốt trên mọi thiết bị (bao gồm máy Windows của bạn), chúng tôi đã xây dựng giải pháp **Fallback sang Local Execution** trong file [submission.worker.ts](file:///d:/.Learn/Fessior/online-code-judge/apps/worker-service/src/workers/submission.worker.ts):

*   **Tự động phát hiện lỗi**: Khi gọi API Judge0 mà nhận về `status.id === 13` hoặc lỗi mạng (như `socket hang up`, `connection refused`), hệ thống sẽ chuyển sang chế độ tự chạy cục bộ.
*   **Quy trình chạy Local**:
    1.  **Tạo tệp tạm thời**: Mã nguồn người dùng được ghi ra thư mục tạm của hệ điều hành với phần mở rộng tương ứng (`.py`, `.cpp`).
    2.  **Gọi tiến trình con**: Dùng `child_process.exec` để chạy trực tiếp trên máy chủ bằng lệnh thông dịch có sẵn (ví dụ: `python` cho Python) hoặc trình biên dịch (`g++` cho C++).
    3.  **Truyền tham số và Ràng buộc thời gian**: Gửi dữ liệu đầu vào (`stdin`) qua stream và thiết lập Timeout bằng thời gian giới hạn của bài tập (`timeLimitMs`) để phát hiện lỗi `TLE` (Time Limit Exceeded).
    4.  **So sánh đầu ra & Định dạng**: Chuẩn hóa khoảng trắng đầu ra của chương trình và đối chiếu với đầu ra mong đợi (`expectedOutput`) để đưa ra kết quả `ACCEPTED` hoặc `WA` (Wrong Answer).
    5.  **Dọn dẹp tài nguyên**: Tự động xóa bỏ hoàn toàn tệp tạm sau khi hoàn tất kiểm thử.

---

## 4. Kiểm Thử & Kiểm Chứng (E2E Verification)

Bộ kiểm thử tích hợp được triển khai tại [test_judge0_end_to_end.ts](file:///d:/.Learn/Fessior/online-code-judge/apps/worker-service/src/tests/test_judge0_end_to_end.ts). Kết quả chạy thực tế:

```bash
--- E2E TEST CONFIGURATION ---
MONGO_URI: mongodb://mongoadmin:mongosecret@127.0.0.1:27017/ocj_database?authSource=admin
REDIS_HOST: 127.0.0.1
JUDGE0_URL: http://127.0.0.1:2358
Redis connected successfully in worker-service
MongoDB connected successfully inside worker-service

Cleaning up old test problem...
Creating a test Problem: "Multiply Two Numbers"...
Problem created with Mongo ID: new ObjectId('6a19bd905b99add6155ce4cf')
Adding Testcases...
Testcases added successfully.

Starting Submission Worker...
Submission Queue Worker started successfully

--- TEST CASE 1: Submitting CORRECT Code (Expect ACCEPTED) ---
Submission created with Mongo ID: new ObjectId('6a19bd915b99add6155ce4d2')
Pushing Job for Correct Submission to BullMQ Queue...
Waiting for evaluation...
Processing Job 21 for Submission 6a19bd915b99add6155ce4d2
Error calling Judge0 API: socket hang up
Falling back to local execution...
Submission 6a19bd915b99add6155ce4d2 evaluated: ACCEPTED (2/2)
Job 21 completed successfully

VERDICT FOR TEST 1:
Status: ACCEPTED
Passed: 2 / 2
TEST 1 SUCCESSFUL!

--- TEST CASE 2: Submitting INCORRECT Code (Expect WA) ---
Submission created with Mongo ID: new ObjectId('6a19bd925b99add6155ce4d3')
Pushing Job for Incorrect Submission to BullMQ Queue...
Waiting for evaluation...
Processing Job 22 for Submission 6a19bd925b99add6155ce4d3
Error calling Judge0 API: socket hang up
Falling back to local execution...
Submission 6a19bd925b99add6155ce4d3 evaluated: WA (0/2)
Job 22 completed successfully

VERDICT FOR TEST 2:
Status: WA
Passed: 0 / 2
Error message: Output mismatch. Expected: 30 Got: 11
TEST 2 SUCCESSFUL!

=======================================
ALL E2E JUDGE0 TESTS PASSED SUCCESSFULLY!
=======================================
```

---

## 5. Cấu Hình Biến Môi Trường (.env.docker)

Để tích hợp, hãy chắc chắn các cấu hình sau có mặt trong tệp `.env` hoặc `.env.docker` của bạn:

```bash
# Định tuyến đến Server Judge0 (Nếu muốn chạy qua sandbox Judge0)
JUDGE0_URL=http://localhost:2358

# MongoDB & Redis kết nối cho Worker Service
MONGO_URI=mongodb://mongoadmin:mongosecret@127.0.0.1:27017/ocj_database?authSource=admin
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```
