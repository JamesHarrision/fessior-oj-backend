# HƯỚNG DẪN KIỂM THỬ HỆ THỐNG ONLINE CODE JUDGE BACKEND

Tài liệu này hướng dẫn chi tiết các bước từ chạy Docker Compose, chuẩn bị dữ liệu kiểm thử (Admin rights, Problems, Testcases) đến chạy mô phỏng đấu 1v1 thời gian thực bằng Sockets.

---

## BƯỚC 1: KHỞI CHẠY HỆ THỐNG BẰNG DOCKER

1. **Chuẩn bị file cấu hình**:
   Hãy đảm bảo file `.env.docker` đã được cấu hình đúng. Bản gốc đã được điền sẵn thông số mặc định rất phù hợp với Docker Network.
   
2. **Khởi chạy container**:
   Mở terminal tại thư mục gốc của dự án và chạy lệnh sau:
   ```bash
   docker compose up -d --build
   ```
   *Lệnh này sẽ tự động tải các base-image, build mã nguồn `main-service` và `worker-service`, đồng thời khởi chạy đầy đủ 5 dịch vụ (MySQL, MongoDB, Redis, API, Worker).*

3. **Kiểm tra trạng thái**:
   ```bash
   docker compose ps
   ```
   Đảm bảo tất cả 5 container đều đang ở trạng thái `running`.
   
4. **Theo dõi Log hệ thống**:
   Để xem log hoạt động (ví dụ: Prisma migration, kết nối DB, BullMQ, Socket...):
   *   Xem log của API chính: `docker compose logs -f main-service`
   *   Xem log của Worker chấm bài: `docker compose logs -f worker-service`

---

## BƯỚC 2: CẤP QUYỀN ADMIN CHO TÀI KHOẢN KIỂM THỬ

Do hệ thống quản lý quyền chặt chẽ, chỉ tài khoản có `role = 'ADMIN'` mới có quyền thêm bài tập và testcase. Mặc định tài khoản đăng ký mới sẽ có quyền `USER`.

1. **Đăng ký tài khoản mới**:
   Gửi request `POST http://localhost:6868/api/v1/auth/register` (hoặc qua Postman):
   ```json
   {
     "username": "admin_test",
     "email": "admin@test.com",
     "password": "Password123"
   }
   ```

2. **Set quyền ADMIN trực tiếp trong Database MySQL**:
   Chạy lệnh terminal sau để cập nhật quyền cho tài khoản vừa tạo trong container MySQL:
   ```bash
   docker exec -it ocj_mysql mysql -u root -pocj_root_secret -e "USE ocj_main_db; UPDATE users SET role='ADMIN' WHERE username='admin_test';"
   ```

3. **Đăng nhập**:
   Gửi request `POST http://localhost:6868/api/v1/auth/login` với tài khoản `admin_test` để lấy **Access Token** của Admin.

---

## BƯỚC 3: TẠO DỮ LIỆU BÀI TẬP VÀ TESTCASE

Sau khi có Access Token của Admin (gửi kèm header `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`), hãy tạo bài tập mẫu bằng cURL hoặc Postman:

1. **Tạo Tag phân loại bài tập**:
   *   **URL**: `POST http://localhost:6868/api/v1/problems/tags`
   *   **Body**:
       ```json
       {
         "name": "Greedy",
         "color": "#00FF00"
       }
       ```

2. **Tạo Bài tập (Problem)**:
   *   **URL**: `POST http://localhost:6868/api/v1/problems/`
   *   **Body**:
       ```json
       {
         "title": "Sum of Two Numbers",
         "description": "Write a program that returns the sum of two integers A and B. Input consists of A and B separated by space.",
         "difficulty": "EASY",
         "timeLimit": 2000,
         "memoryLimit": 256,
         "starterCodes": {
           "cpp": "#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    if(cin >> a >> b) cout << a + b;\n    return 0;\n}",
           "java": "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.print(a + b);\n        }\n    }\n}",
           "python": "import sys\nlines = sys.stdin.read().split()\nif len(lines) >= 2:\n    print(int(lines[0]) + int(lines[1]), end='')"
         },
         "tags": ["Greedy"]
       }
       ```
   *   *Hãy lưu lại mã `_id` của bài tập vừa tạo từ JSON kết quả trả về (Ví dụ: `64a78cd9...`)*.

3. **Thêm Testcase cho bài tập**:
   *   **URL**: `POST http://localhost:6868/api/v1/problems/<problem_id_ở_trên>/testcases`
   *   **Body (Testcase 1 - Ví dụ)**:
       ```json
       {
         "input": "2 3",
         "output": "5",
         "isExample": true
       }
       ```
   *   **Body (Testcase 2 - Chấm điểm ẩn)**:
       ```json
       {
         "input": "10 20",
         "output": "30",
         "isExample": false
       }
       ```

---

## BƯỚC 4: THỬ NGHIỆM ĐẤU 1VS1 REALTIME (MÔ PHỎNG)

Để kiểm thử tính năng Realtime Solo 1vs1, bạn cần tạo thêm 2 tài khoản người dùng bình thường để tham gia đấu.

1. **Đăng ký và Đăng nhập 2 người chơi**:
   *   Đăng ký & đăng nhập tài khoản thứ nhất -> Lấy `Access Token 1`
   *   Đăng ký & đăng nhập tài khoản thứ hai -> Lấy `Access Token 2`

2. **Chạy file script mô phỏng**:
   Trong thư mục dự án có sẵn script test `ai_slop/test_matchmaking.js`.
   *   Mở file `ai_slop/test_matchmaking.js`.
   *   Thay thế giá trị biến `PLAYER_1_TOKEN` bằng `Access Token 1` và `PLAYER_2_TOKEN` bằng `Access Token 2`.
   *   Mở terminal tại local và chạy:
       ```bash
       # Vào thư mục ai_slop
       cd ai_slop
       # Chạy script mô phỏng
       node test_matchmaking.js
       ```
   *   *Kết quả màn hình sẽ hiển thị 2 người chơi cùng join hàng chờ, thuật toán ghép cặp dựa trên ELO khớp trận, tự lấy bài tập ngẫu nhiên từ database và đưa cả hai vào phòng đấu.*

3. **Nộp bài giải và phân định Thắng - Thua**:
   *   Sử dụng Token của người chơi 1, gửi request nộp bài code:
       *   **URL**: `POST http://localhost:6868/api/v1/submissions/`
       *   **Headers**: `Authorization: Bearer <Access_Token_1>`
       *   **Body**:
           ```json
           {
             "problemId": "<id_bài_tập_ở_bước_3>",
             "language": "python",
             "code": "import sys\nlines = sys.stdin.read().split()\nprint(int(lines[0]) + int(lines[1]), end='')"
           }
           ```
   *   **Quan sát Realtime**: 
       *   Hệ thống queue BullMQ sẽ xử lý bài nộp.
       *   Ở terminal chạy script `test_matchmaking.js`, bạn sẽ ngay lập tức nhìn thấy sự kiện đối thủ nộp bài `rival-submission` và kết quả trận đấu kết thúc `match-ended`.
       *   ELO của người thắng sẽ cộng `+25`, ELO của người thua trừ `-15` cập nhật ngay lập tức vào MySQL.
