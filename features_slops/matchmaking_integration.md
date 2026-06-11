# Tài liệu Tích hợp WebSocket & Ghép trận trực tuyến (Matchmaking & Sockets)

Giao diện Lobby Tìm trận đã được kết nối hoàn chỉnh với WebSocket Server thông qua `socket.io-client`.

## 1. Các Sự kiện Sockets
- **Gửi từ Client**:
  - `join-queue`: Yêu cầu tham gia hàng chờ tìm đối thủ dựa trên chỉ số ELO.
  - `leave-queue`: Hủy hàng chờ, quay lại trạng thái rảnh.
  - `forfeit-match`: Đầu hàng/rời khỏi trận đấu đang hoạt động.
- **Nhận từ Server**:
  - `queue-status`: Trạng thái hàng chờ hiện tại (`QUEUED` hoặc `IDLE`).
  - `match-found`: Trận đấu được ghép thành công (nhận thông tin trận đấu `matchId`, đề bài MongoDB `problem` và thông tin 2 kỳ phùng địch thủ).

## 2. Giao diện & Chức năng Mới
- **`services/socket.ts`**: Wrapper tập trung kết nối Socket.io, đính kèm JWT Token khi kết nối và lắng nghe các sự kiện theo thời gian thực.
- **`components/match/RoomBrowser.tsx` & `.css`**: Hiển thị danh sách phòng đấu tập luyện tùy chỉnh. Hỗ trợ người dùng tự chọn độ khó (Dễ/Trung bình/Khó) để tạo phòng riêng hoặc nhập mã phòng để tham gia.
- **`components/layout/SocialSidebar.tsx` & `.css`**: Sidebar trực quan hiển thị danh sách bạn bè, trạng thái trực tuyến (Online/Offline) cập nhật real-time từ Redis và gửi yêu cầu kết bạn mới.
