# Tài liệu Tích hợp Giải đấu, Xếp hạng, Cửa hàng & Cài đặt (Social, Shop & Extras)

Tất cả các mô-đun chức năng phụ trợ đã được kết nối đồng bộ với Backend REST API.

## 1. Các APIs & Mô tả Hoạt động
- **Xếp hạng (Leaderboard)**:
  - `GET /api/v1/leaderboard`: Tải danh sách top người chơi có số ELO và chuỗi thắng cao nhất hiển thị trực quan trong `RankingView`.
- **Cửa hàng & Kho đồ (Shop & Inventory)**:
  - `GET /api/v1/shop/items`: Tải danh sách vật phẩm đang bày bán.
  - `POST /api/v1/shop/buy`: Thực hiện mua vật phẩm bằng điểm tích lũy đấu trường.
  - `GET /api/v1/shop/inventory`: Tải danh sách vật phẩm người chơi đang sở hữu.
  - `POST /api/v1/shop/inventory/equip`: Đổi ảnh đại diện, danh hiệu hoặc khung viền đang trang bị.
- **Giải đấu (Contests)**:
  - `GET /api/v1/contests`: Lấy danh sách giải đấu sắp diễn ra, đang chạy hoặc đã kết thúc.
  - `POST /api/v1/contests/:id/register`: Đăng ký tham gia giải đấu.
  - `GET /api/v1/contests/:id/leaderboard`: Xem chi tiết bảng điểm thời gian thực của giải đấu đó.
- **Công cụ & Báo cáo (Settings & Tools)**:
  - `POST /api/v1/reports`: Gửi phản hồi báo cáo lỗi (BUG), gian lận (PLAGIARISM), hoặc đóng góp tính năng trực tiếp cho quản trị viên.
