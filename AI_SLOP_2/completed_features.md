# HỆ THỐNG ONLINE CODE JUDGE BACKEND - CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

Tài liệu này tổng hợp chi tiết các công nghệ sử dụng, kiến trúc hệ thống và toàn bộ các tính năng đã được xây dựng hoàn tất trong dự án Online Code Judge.

---

## 1. Công Nghệ Sử Dụng & Kiến Trúc Hệ Thống

Dự án được xây dựng dưới dạng **Monorepo** sử dụng công cụ quản lý **Turborepo** và trình quản lý gói **npm workspaces**.

### Công Nghệ Core:
*   **Ngôn ngữ chính**: TypeScript (Node.js)
*   **Web Framework**: Express.js
*   **Cơ sở dữ liệu Quan hệ (SQL)**: MySQL (Sử dụng **Prisma ORM** để quản trị database schema, migrations và truy vấn thông tin người dùng, lịch sử đấu 1v1).
*   **Cơ sở dữ liệu Phi quan hệ (NoSQL)**: MongoDB (Sử dụng **Mongoose** để lưu trữ tài liệu bài tập, danh sách testcase lớn và thông tin chi tiết bài nộp).
*   **Hàng đợi & Tác vụ nền (Message Queue)**: Redis & **BullMQ** (Được dùng để đẩy các bài nộp code vào queue xử lý bất đồng bộ nhằm tránh nghẽn server chính).
*   **Kết nối thời gian thực**: **Socket.io** (Tích hợp Redis Pub/Sub để đồng bộ hóa trạng thái đấu 1vs1 Solo và cập nhật tiến trình chấm bài thời gian thực).
*   **Trí tuệ nhân tạo (AI)**: Google Gemini AI (Sử dụng SDK `@google/generative-ai` để tự động chấm điểm phản hồi phỏng vấn giả định và vẽ lộ trình học tập lập trình).
*   **Trình chấm bài (Online Judge Runner)**: Tích hợp dịch vụ **Judge0** (Hỗ trợ chấm đa ngôn ngữ C++, Java, Python, kiểm tra Time Limit, Memory Limit).

---

## 2. Các Tính Năng Đã Thực Hiện (Chi Tiết)

### A. Hệ Thống Xác Thực & Quản Lý Phiên (Authentication & Sessions)
*   **Đăng ký & Đăng nhập (Register & Login)**:
    *   Mã hóa mật khẩu bằng `bcrypt`.
    *   Cập nhật cặp mã thông báo JWT: **Access Token** và **Refresh Token**.
*   **Quản lý Phiên Hoạt Động (Session Management)**:
    *   Ghi nhận địa chỉ IP, User-Agent và thời điểm tương tác của phiên.
    *   Xem danh sách các phiên đăng nhập, thu hồi một phiên (Revoke Session) hoặc toàn bộ các phiên khác.
*   **Khôi phục Mật khẩu (Password Recovery)**:
    *   Yêu cầu đổi mật khẩu khi đang đăng nhập (Change Password) hoặc đặt lại mật khẩu qua email khi quên mật khẩu (Forgot/Reset Password) qua `nodemailer`.

### B. Quản Lý Bài Tập & Kiểm Thử (Problem & Testcase Management)
*   **Quản lý Thẻ phân loại (Tags)**: Admin tạo mới thẻ tag, người dùng liệt kê danh sách tag.
*   **Quản lý Bài tập (Problems)**: CRUD bài tập lưu trữ trong MongoDB và tự động đồng bộ hóa thông tin cơ bản sang bảng `problem_index` trong MySQL phục vụ tìm kiếm/lọc.
*   **Quản lý Testcase**: Cấu hình các testcase ví dụ (`isExample: true`) hoặc ẩn làm test chấm điểm (`isExample: false`).

### C. Nộp Bài & Chấm Điểm Tự Động (Submissions & Judge Worker)
*   **Tiến trình Nộp bài**: Tạo bản ghi nộp bài ở trạng thái `PENDING` và đẩy job vào hàng đợi BullMQ.
*   **Dịch vụ Worker chấm bài (worker-service)**:
    *   Chạy bất đồng bộ, cập nhật trạng thái `PROCESSING`.
    *   Biên dịch và chạy thử code qua Judge0 API, so sánh đầu ra để trả về: `ACCEPTED`, `WA`, `TLE`, `MLE`, `RE`, `CE`.
    *   Phát kết quả chấm bài qua Redis Pub/Sub lên channel `submission-updates`.

### D. Thi Đấu Solo 1vs1 Thời Gian Thực (Realtime Matchmaking 1v1)
*   **Hàng đợi ghép cặp**: Người chơi gửi sự kiện `join-queue` qua Socket.io.
*   **Thuật toán Ghép cặp**: Ghép cặp 2 người có khoảng cách điểm ELO gần nhất.
*   **Trận đấu (Match Lifecycle)**: Chọn bài tập ngẫu nhiên, tự động join room socket `match:${match.id}`, đồng bộ tiến trình làm bài của đối thủ và cộng/trừ ELO (thắng +25, thua -15), cập nhật streak thắng.

### E. Tích Hợp AI Trí Tuệ Nhân Tạo (AI Features)
*   **Vẽ Lộ trình học tập (Roadmap Generator)**: Gemini AI sinh lộ trình học DSA tự động dựa trên trình độ người chơi.
*   **Đánh giá bài làm & Phản hồi Phỏng vấn (Mock Interview Feedback)**: Gemini AI nhận xét độ phức tạp của code bài nộp, hướng dẫn cải tiến và đưa câu hỏi phỏng vấn giả định.

### F. Bảng Xếp Hạng (Leaderboard)
*   Liệt kê danh sách người dùng sắp xếp giảm dần theo điểm **ELO Rating** (phân trang).

### G. Phòng Đấu Tùy Chỉnh (Custom Rooms)
*   Cho phép người chơi tự tạo phòng đấu 1v1 riêng tư (`POST /api/v1/rooms/create`), gửi mã phòng cho bạn bè tham gia.
*   Chủ phòng có quyền cập nhật cấu hình phòng (độ khó, thời gian đấu) hoặc hủy phòng.
*   Đồng bộ socket cho phép bắt đầu trận đấu tùy chỉnh sau khi có đối thủ tham gia.

### H. Giải Đấu & Cuộc Thi (Contests)
*   Quản lý cuộc thi (đăng ký tham gia, xem danh sách bài tập, xem lịch sử nộp bài trong khuôn khổ contest).
*   **Bảng xếp hạng Contest**: Tự động tổng hợp điểm số và thời gian penalty của tất cả thí sinh tham dự thời gian thực.

### I. Thảo Luận & Bình Luận (Discussions & Comments)
*   Bình luận đa diện (polymorphic) trên nhiều đối tượng (Problems, Contests, Discussions).
*   Hỗ trợ bình luận phân cấp dạng cây (Threaded Replies), lượt thích bình luận (Likes).

### J. Bạn Bè & Mạng Xã Hội (Social & Friends)
*   Gửi, chấp nhận, từ chối yêu cầu kết bạn, hủy kết bạn.
*   **Theo dõi Trạng thái Online/Offline**: Tích hợp Redis `online_users` và sự kiện socket kết nối/ngắt kết nối giúp lấy danh sách bạn bè kèm trạng thái hoạt động thực tế.

### K. Cửa Hàng & Kho Đồ Cá Nhân (Shop & Inventory)
*   Admin đăng bán vật phẩm (Avatar Frames, Themes).
*   Người dùng mua vật phẩm bằng `code_coins` qua giao dịch an toàn (Prisma Transaction).
*   Xem kho đồ cá nhân, trang bị/hủy trang bị vật phẩm ảo (ví dụ: Avatar Frame) và hiển thị lên profile.

### L. Thông Báo Hệ Thống (Notifications)
*   Gửi thông báo hệ thống và thông báo cá nhân (kết bạn, kết quả thi đấu).
*   **Realtime Push**: Tích hợp Socket.io, đẩy thông báo thời gian thực tới room riêng tư `user:${userId}` của người nhận.

### M. Báo Cáo & Góp Ý (Reports & Feedback)
*   Người dùng gửi báo cáo lỗi hệ thống, đề bài sai hoặc hành vi gian lận (Target type: USER, PROBLEM, COMMENT).
*   Admin kiểm tra danh sách báo cáo toàn hệ thống, cập nhật trạng thái xử lý (`PENDING`, `RESOLVED`, `REJECTED`).
