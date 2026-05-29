# HƯỚNG DẪN KIỂM THỬ HỆ THỐNG ONLINE CODE JUDGE BACKEND

Tài liệu này hướng dẫn chi tiết các bước chạy kiểm thử tự động qua Jest test suite và chạy kiểm thử thủ công qua Docker + Scripts mô phỏng.

---

## BƯỚC 1: KHỞI CHẠY KIỂM THỬ TỰ ĐỘNG (INTEGRATION TESTS)

Hệ thống đã được tích hợp đầy đủ 7 suite kiểm thử tự động bằng **Jest** và **Supertest** bao quát toàn bộ logic cơ sở dữ liệu (MySQL & MongoDB).

### 1. Cấu hình môi trường Test:
Hãy đảm bảo bạn đã tạo file `.env.test` (nếu cần thiết) hoặc cấu hình database kiểm thử riêng biệt để tránh ghi đè dữ liệu đang phát triển.

### 2. Chạy toàn bộ các Test Suites:
Mở terminal tại thư mục `apps/main-service` và chạy:
```bash
npm run test
```
*Lệnh này sẽ tự động khởi chạy và chạy tuần tự 12 suite kiểm thử bao phủ toàn bộ hệ thống:*
1.  **Auth & Session**: `src/tests/auth.test.ts`
2.  **Problems & Tags**: `src/tests/problem.test.ts`
3.  **Submissions & BullMQ**: `src/tests/submission.test.ts`
4.  **Leaderboard & ELO**: `src/tests/leaderboard.test.ts`
5.  **AI (Roadmap & Interview Feedback)**: `src/tests/ai.test.ts`
6.  **Custom Rooms**: `src/tests/room.test.ts`
7.  **Contests**: `src/tests/contest.test.ts`
8.  **Comments & Discussions**: `src/tests/comment.test.ts`
9.  **Friends & Social**: `src/tests/friendship.test.ts`
10. **Shop & Equip**: `src/tests/shop.test.ts`
11. **Notifications**: `src/tests/notification.test.ts`
12. **Reports & Flagging**: `src/tests/report.test.ts`

### 3. Chạy một Test Suite đơn lẻ:
Để chạy kiểm thử duy nhất một tính năng cụ thể (ví dụ: Shop):
```bash
npm run test src/tests/shop.test.ts
```

---

## BƯỚC 2: KHỞI CHẠY HỆ THỐNG BẰNG DOCKER (CHO KIỂM THỬ THỦ CÔNG)

1.  **Khởi chạy container**:
    Mở terminal tại thư mục gốc của dự án và chạy:
    ```bash
    docker compose up -d --build
    ```
2.  **Kiểm tra logs**:
    *   Xem log main-service: `docker compose logs -f main-service`
    *   Xem log worker-service: `docker compose logs -f worker-service`

---

## BƯỚC 3: CẤP QUYỀN ADMIN CHO TÀI KHOẢN KIỂM THỬ

Do hệ thống kiểm tra quyền phân vai nghiêm ngặt, bạn cần cấp role `ADMIN` để thêm bài tập hoặc quản lý shop:

1.  **Đăng ký tài khoản mới**:
    Gửi request `POST http://localhost:6868/api/v1/auth/register` (hoặc qua Postman):
    ```json
    {
      "username": "admin_test",
      "email": "admin@test.com",
      "password": "Password123"
    }
    ```
2.  **Cập nhật quyền trong container MySQL**:
    Chạy lệnh sau:
    ```bash
    docker exec -it ocj_mysql mysql -u root -pocj_root_secret -e "USE ocj_main_db; UPDATE users SET role='ADMIN' WHERE username='admin_test';"
    ```

---

## BƯỚC 4: THỬ NGHIỆM ĐẤU 1VS1 REALTIME (MÔ PHỎNG)

1.  **Chạy script mô phỏng**:
    *   Đăng ký & đăng nhập 2 người chơi khác nhau để lấy `Access Token 1` và `Access Token 2`.
    *   Mở file `ai_slop/test_matchmaking.js` thay thế các token tương ứng vào.
    *   Chạy script:
        ```bash
        cd ai_slop
        node test_matchmaking.js
        ```
2.  **Nộp bài giải và theo dõi socket**:
    *   Gửi request nộp bài `POST http://localhost:6868/api/v1/submissions/` với token của người chơi 1.
    *   Quan sát log hiển thị sự kiện realtime kết thúc trận đấu, tính điểm ELO và chuỗi thắng cập nhật lập tức trên console.
