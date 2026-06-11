# Tài liệu Tích hợp Trình soạn thảo & Tiến độ Đấu trường (Editor & Submission Polling)

Trình soạn thảo mã nguồn `SoloEditorView` đã kết nối hoàn chỉnh với dịch vụ biên dịch mã nguồn và đồng bộ PvP.

## 1. APIs Sử dụng & Cơ chế Chấm bài
- `POST /api/v1/submissions`: Gửi mã nguồn lên server (`problemId`, `language`, `code`). Server sẽ thêm tác vụ vào BullMQ queue để Worker nhận dạng và chấm thông qua Judge0 (hoặc fallback sandbox).
- `GET /api/v1/submissions/:id`: Lấy chi tiết trạng thái đánh giá của mã nguồn. Client thực hiện cơ chế Polling (1.5 giây một lần) cho đến khi trạng thái khác `PENDING`.
- `GET /api/v1/problems`: Danh sách đề bài được lấy tự động khi người dùng ở chế độ luyện tập độc lập (Standalone Practice Mode).

## 2. Kết nối Socket & Trạng thái Đối thủ
- **Đồng bộ thời gian thực**: Lắng nghe kênh Socket `rival-submission` để nhận phần trăm testcase đã hoàn thành của đối phương và hiển thị thanh tiến độ kép song hành cực kỳ kịch tính.
- **Kết thúc Trận đấu**: Lắng nghe sự kiện `match-ended` từ WebSocket để khóa biên dịch, dừng đồng hồ đếm ngược và hiển thị Modal kết quả trận đấu PvP đẹp mắt cùng số ELO thay đổi tăng/giảm của cả hai.
