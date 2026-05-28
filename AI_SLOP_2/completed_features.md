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
    *   Cấp cặp mã thông báo JWT: **Access Token** (hết hạn ngắn) và **Refresh Token** (lưu database MySQL để duy trì trạng thái đăng nhập).
*   **Quản lý Phiên Hoạt Động (Session Management)**:
    *   Ghi nhận địa chỉ IP, User-Agent và thời điểm tương tác cuối cùng của mỗi phiên hoạt động.
    *   Cho phép người dùng xem danh sách các phiên đăng nhập đang hoạt động.
    *   Cho phép đăng xuất đơn lẻ, thu hồi một phiên cụ thể (Revoke Session), hoặc thu hồi toàn bộ các phiên hoạt động khác để bảo mật (Revoke All Sessions).
*   **Khôi phục Mật khẩu (Password Recovery)**:
    *   Yêu cầu đổi mật khẩu khi đang đăng nhập (Change Password).
    *   Yêu cầu đặt lại mật khẩu qua email khi quên mật khẩu (Forgot/Reset Password): Tạo token khôi phục dùng 1 lần (hạn 15 phút) và gửi link qua email (Sử dụng `nodemailer`).

### B. Quản Lý Bài Tập & Kiểm Thử (Problem & Testcase Management)
*   **Quản lý Thẻ phân loại (Tags)**:
    *   Admin có thể tạo mới thẻ (ví dụ: `Dynamic Programming`, `Greedy`, `Array`).
    *   Người dùng có thể liệt kê toàn bộ thẻ.
*   **Quản lý Bài tập (Problems)**:
    *   CRUD bài tập (chỉ dành cho Admin). Thông tin lưu trong MongoDB bao gồm: Tiêu đề, Slug, Mô tả (Markdown), Độ khó (`EASY`, `MEDIUM`, `HARD`), Giới hạn thời gian (ms), Giới hạn bộ nhớ (MB), Starter Codes mẫu (C++, Java, Python), Lời giải chi tiết (Editorial Markdown/Video URL).
    *   Tự động đồng bộ hóa thông tin cơ bản sang bảng `problem_index` trong MySQL để tối ưu hóa việc query và lọc danh sách bài tập.
*   **Quản lý Testcase**:
    *   Thêm/Xóa testcase cho một bài tập cụ thể.
    *   Cấu hình testcase làm ví dụ minh họa (`isExample: true` hiện mô tả đề bài) hoặc ẩn đi để làm bài test chấm điểm (`isExample: false`).

### C. Nộp Bài & Chấm Điểm Tự Động (Submissions & Judge Worker)
*   **Tiến trình Nộp bài**:
    *   Người dùng gửi code lên kèm ID bài tập và ngôn ngữ lựa chọn (C++, Java, Python).
    *   Hệ thống tạo bản ghi nộp bài ở trạng thái `PENDING` trong MongoDB và đưa tác vụ vào hàng đợi `submission_queue` qua BullMQ.
*   **Dịch vụ Worker chấm bài (worker-service)**:
    *   Chạy độc lập để lắng nghe hàng đợi BullMQ.
    *   Khi nhận được bài nộp, cập nhật trạng thái thành `PROCESSING`.
    *   Lấy toàn bộ danh sách testcase ẩn của bài tập từ MongoDB.
    *   Gửi từng testcase tuần tự qua API của Judge0 để biên dịch và chạy thử code.
    *   Kiểm tra kết quả trả về từ Judge0 để xác định kết quả: `ACCEPTED` (Đạt), `WA` (Sai kết quả), `TLE` (Quá thời hạn chạy), `MLE` (Tràn bộ nhớ), `RE` (Lỗi runtime), hoặc `CE` (Lỗi biên dịch).
    *   Cập nhật trạng thái bài nộp, số lượng testcase vượt qua, thời gian chạy tối đa, bộ nhớ tiêu thụ tối đa và chi tiết lỗi biên dịch nếu có.
    *   **Simulation Mode (Dev)**: Nếu chưa cấu hình `RAPIDAPI_KEY`, Worker tự động chạy ở chế độ giả lập (luôn trả về ACCEPTED) giúp lập trình viên kiểm thử luồng code offline dễ dàng.
    *   Sau khi chấm xong, Worker phát thông điệp (Publish) trạng thái kết quả bài nộp lên Redis channel `submission-updates` phục vụ realtime.

### D. Thi Đấu Solo 1vs1 Thời Gian Thực (Realtime Matchmaking 1v1)
Đây là tính năng điểm nhấn của hệ thống, cho phép hai người dùng thi đấu giải bài tập trực tuyến với nhau.
*   **Hàng đợi ghép cặp (Matchmaking Queue)**:
    *   Người dùng kết nối và xác thực Socket.io bằng JWT.
    *   Gửi sự kiện `join-queue` để vào hàng đợi. Hệ thống tự lấy thông tin ELO hiện tại của người chơi trong MySQL.
*   **Thuật toán Ghép cặp theo ELO**:
    *   Khi hàng đợi có từ 2 người trở lên, hệ thống sắp xếp danh sách theo ELO và ghép cặp 2 người có khoảng cách điểm ELO gần nhất với nhau để đảm bảo công bằng.
*   **Tiến trình trận đấu (Match Lifecycle)**:
    *   Khi tìm thấy đối thủ, hệ thống chọn ngẫu nhiên một bài tập từ MongoDB, tạo bản ghi `Match` với trạng thái `PENDING` trong MySQL.
    *   Tự động đưa socket của 2 đối thủ vào phòng chat chung `match:${match.id}`.
    *   Gửi sự kiện `match-found` kèm đầy đủ đề bài, code mẫu và thông tin đối thủ.
    *   **Đồng bộ realtime**: Khi một người chơi nộp bài và worker chấm xong, hệ thống nhận tín hiệu qua Redis Pub/Sub và phát sự kiện `rival-submission` đến người chơi còn lại để cập nhật tiến trình làm bài của đối thủ (ví dụ: Đối thủ đã pass `5/10` testcases).
    *   **Xử lý thắng cuộc**: Người đầu tiên nhận kết quả `ACCEPTED` cho bài nộp sẽ thắng trận đấu. Hệ thống sẽ:
        *   Cập nhật trạng thái Match thành `FINISHED`.
        *   Tự động cộng `+25` ELO cho người thắng và cập nhật chuỗi thắng (Streak).
        *   Tự động trừ `-15` ELO của người thua (ELO tối thiểu là 800) và reset chuỗi thắng về 0.
        *   Thông báo kết quả `match-ended` kèm cập nhật ELO cho cả phòng đấu.
    *   **Xin hàng (Forfeit)**: Người chơi có thể chọn xin thua giữa trận đấu bằng cách gửi sự kiện `forfeit-match`, đối thủ sẽ tự động được xử thắng và nhận ELO.

### E. Tích Hợp AI Trí Tuệ Nhân Tạo (AI Features)
*   **Vẽ Lộ trình học tập (Roadmap Generator)**:
    *   Nhận thông tin chủ đề lập trình hoặc mục tiêu học tập từ người dùng.
    *   Sử dụng Gemini AI thiết lập một lộ trình học tập chi tiết, chia thành các chặng kèm các bài tập thực hành.
*   **Đánh giá bài làm & Phản hồi Phỏng vấn (Mock Interview Feedback)**:
    *   Nhận thông tin mã nguồn của một bài nộp cụ thể (`submissionId`).
    *   Gemini AI phân tích thuật toán, tính tối ưu của mã nguồn về mặt độ phức tạp thời gian/không gian ($O(N)$), nhận xét lỗi sai, hướng dẫn cải tiến và đưa ra các câu hỏi phỏng vấn gợi mở liên quan trực tiếp đến bài tập đó để rèn luyện tư duy.

### F. Bảng Xếp Hạng (Leaderboard)
*   Liệt kê danh sách người dùng sắp xếp giảm dần theo điểm **ELO Rating**.
*   Hỗ trợ phân trang phục vụ xây dựng giao diện hiển thị vinh danh.
