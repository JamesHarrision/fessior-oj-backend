# Tài liệu Tích hợp Trợ lý AI, Thảo luận, Lịch sử & Thông báo

Tài liệu này hướng dẫn cách thức hoạt động của các nhóm APIs Backend đã được tích hợp đầy đủ vào Frontend React.

---

## 1. Trợ lý AI (AI Assistant)
- **Tạo lộ trình DSA (`POST /api/v1/ai/roadmap`):**
  - Người dùng cung cấp chủ đề cần học và cấp độ.
  - Gemini AI phân tích và trả về danh sách các node lộ trình chi tiết.
- **Xem xét & Đánh giá Code (`POST /api/v1/ai/feedback/:submissionId`):**
  - AI đọc mã nguồn bài nộp và phân tích độ phức tạp thời gian/không gian kèm khuyến nghị tối ưu hóa.

## 2. Thảo luận (Discussions / Comments)
- **Danh sách bình luận (`GET /api/v1/comments?problemId=...`):**
  - Hiển thị danh sách các bài thảo luận của đề bài tương ứng.
- **Đăng thảo luận (`POST /api/v1/comments`):**
  - Gửi bình luận thảo luận mới.
- **Thích & Xóa thảo luận (`POST /api/v1/comments/:commentId/like` & `DELETE`):**
  - Tăng/giảm số lượt thích hoặc xóa bài viết của chính người dùng.

## 3. Lịch sử Đấu (Match History)
- **Danh sách trận đấu (`GET /api/v1/matches/history`):**
  - Hiển thị trong phần Thiết lập danh sách các trận đối đầu, điểm ELO tăng/giảm và kết quả (Thắng/Thua/Hòa).

## 4. Thông báo (Notifications)
- **Bảng điều khiển quả chuông (`GET /api/v1/notifications`):**
  - Hiển thị các thông báo thời gian thực ngay trên thanh Navbar, hỗ trợ đánh dấu đã đọc hoặc xóa thông báo.
