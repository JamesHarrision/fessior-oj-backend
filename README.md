# Hệ thống Chấm điểm Mã nguồn Trực tuyến (Online Code Judge - OCJ)

Đây là monorepo chứa mã nguồn backend của nền tảng **Online Code Judge (OCJ)**, được phát triển trên kiến trúc Microservices sử dụng **Turborepo** và **npm workspaces**. 

Hệ thống hỗ trợ chấm điểm mã nguồn nhiều ngôn ngữ, ghép cặp thi đấu 1v1 realtime theo ELO, hỗ trợ AI phản hồi phỏng vấn và đề xuất lộ trình học thuật.

---

## 📂 Tài liệu Hướng dẫn & Tích hợp (Thư mục `AI_SLOP_2`)

Trước khi bắt đầu, hãy tham khảo các tài liệu chi tiết sau được lưu trong thư mục `AI_SLOP_2/`:

1.  **[completed_features.md](file:///d:/.Learn/Fessior/online-code-judge/AI_SLOP_2/completed_features.md)**: Tổng quan kiến trúc công nghệ và mô tả tất cả tính năng hiện có (Auth & Session, CRUD Problems & Testcases, BullMQ & Worker, Realtime Matchmaking 1v1, Gemini AI).
2.  **[test_guide.md](file:///d:/.Learn/Fessior/online-code-judge/AI_SLOP_2/test_guide.md)**: Hướng dẫn chạy thử nghiệm hệ thống, cấp quyền ADMIN và chạy script mô phỏng Realtime Solo 1v1.
3.  **[api_endpoints.md](file:///d:/.Learn/Fessior/online-code-judge/AI_SLOP_2/api_endpoints.md)**: Danh sách đầy đủ các API Endpoints hiện tại (Request, Response, Phân quyền).
4.  **[suggested_endpoints.md](file:///d:/.Learn/Fessior/online-code-judge/AI_SLOP_2/suggested_endpoints.md)**: Backlog danh sách các API đề xuất phát triển thêm (Custom Rooms, Contests, Comments, Friends, Shop & Coins) để phát triển tiếp.

---

## 🛠️ Hướng dẫn Chạy Hệ Thống

Bạn có thể chạy hệ thống bằng 2 cách: dùng Docker Compose (Khuyên dùng - Nhanh nhất) hoặc chạy thủ công từng phần để phát triển (Development).

### CÁCH 1: Chạy toàn bộ hệ thống bằng Docker Compose (Khuyên dùng)

Cách này sẽ khởi chạy tất cả 5 dịch vụ (MySQL, MongoDB, Redis, API chính và Worker chấm bài) trong container chỉ với 1 lệnh duy nhất.

1.  **Tạo file cấu hình môi trường**:
    Sao chép file template cấu hình môi trường từ thư mục gốc:
    ```bash
    cp .env.docker.example .env.docker
    ```
    *(Mở file `.env.docker` và điền key `GEMINI_API_KEY` nếu muốn thử nghiệm tính năng AI).*

2.  **Khởi động các dịch vụ**:
    ```bash
    docker compose up -d --build
    ```
    *Dịch vụ chính (API) sẽ lắng nghe tại cổng `http://localhost:6868`. Cơ sở dữ liệu và các tác vụ Prisma migration/sync tự động chạy khi container khởi động.*

3.  **Kiểm tra logs hoạt động**:
    *   API chính: `docker compose logs -f main-service`
    *   Worker chấm bài: `docker compose logs -f worker-service`

4.  **Dừng hệ thống**:
    ```bash
    docker compose down
    ```

---

### CÁCH 2: Chạy thủ công trên máy (Dành cho việc chỉnh sửa Code)

Nếu muốn phát triển và chỉnh sửa mã nguồn trực tiếp (hot-reload), hãy chạy các cơ sở dữ liệu trên Docker và chạy code trên máy thật.

1.  **Cài đặt thư viện**:
    Tại thư mục gốc dự án:
    ```bash
    npm install
    ```

2.  **Khởi động Databases & Caching**:
    Chỉ khởi động các dịch vụ hạ tầng trong file `docker-compose.yml`:
    ```bash
    docker compose up -d mysql mongodb redis
    ```

3.  **Cấu hình môi trường cho Main Service**:
    Vào thư mục `apps/main-service/`, tạo file `.env` tương tự `.env.example` và thiết lập kết nối đến localhost:
    ```env
    DATABASE_URL="mysql://root:ocj_root_secret@localhost:3307/ocj_main_db"
    ```

4.  **Đồng bộ database schema (Prisma)**:
    ```bash
    cd apps/main-service
    npm run db:push
    ```

5.  **Chạy dự án ở chế độ Dev**:
    *   Chạy song song cả API chính và Worker chấm bài từ thư mục gốc:
        ```bash
        # Tại thư mục gốc online-code-judge
        npm run dev
        ```
    *   Hoặc chạy riêng lẻ từng dịch vụ:
        *   API chính: `cd apps/main-service && npm run dev`
        *   Worker: `cd apps/worker-service && npm run dev`

---

## 📈 Các Lệnh Hữu Ích Khi Dev
*   `npm run build`: Build toàn bộ monorepo workspaces bằng Turbo.
*   `npm run lint`: Kiểm tra lỗi cú pháp/style code.
*   `npm run format`: Tự động format code với Prettier.
*   `npm run db:studio` (trong thư mục `apps/main-service`): Mở giao diện Prisma Studio trực quan để quản lý dữ liệu MySQL.
