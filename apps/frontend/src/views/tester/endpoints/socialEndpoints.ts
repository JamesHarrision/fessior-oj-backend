import type { ApiEndpoint } from '../apiListData';

export const socialEndpoints: ApiEndpoint[] = [
  // --- LEADERBOARD ---
  {
    id: 'leaderboard-get',
    name: 'Xem bảng xếp hạng chung',
    category: 'BXH & Trận đấu (Leaderboard & Matches)',
    method: 'GET',
    path: '/api/v1/leaderboard',
    description: 'Lấy bảng xếp hạng tất cả lập trình viên xếp theo điểm ELO (Public)',
    requiresAuth: false
  },

  // --- MATCHES ---
  {
    id: 'matches-history',
    name: 'Lấy lịch sử đấu 1v1',
    category: 'BXH & Trận đấu (Leaderboard & Matches)',
    method: 'GET',
    path: '/api/v1/matches/history',
    description: 'Lấy danh sách các trận đấu solo 1v1 đã tham gia của user hiện tại (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'matches-detail',
    name: 'Chi tiết một trận đấu',
    category: 'BXH & Trận đấu (Leaderboard & Matches)',
    method: 'GET',
    path: '/api/v1/matches/:matchId',
    description: 'Lấy thông tin chi tiết kết quả, thời gian hoàn thành bài của hai đấu thủ qua Match ID (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['matchId']
  },
  {
    id: 'matches-delete',
    name: 'Xóa trận đấu (Admin)',
    category: 'BXH & Trận đấu (Leaderboard & Matches)',
    method: 'DELETE',
    path: '/api/v1/matches/:matchId',
    description: 'Xóa một trận đấu khỏi hệ thống (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['matchId']
  },

  // --- COMMENTS ---
  {
    id: 'comments-list',
    name: 'Lấy danh sách bình luận',
    category: 'Bình luận (Comments)',
    method: 'GET',
    path: '/api/v1/comments',
    description: 'Lấy danh sách thảo luận/bình luận theo bài tập hoặc cuộc thi (Public). Ví dụ query: `?targetId=xxx&targetType=PROBLEM`'
  },
  {
    id: 'comments-create',
    name: 'Gửi bình luận mới',
    category: 'Bình luận (Comments)',
    method: 'POST',
    path: '/api/v1/comments',
    description: 'Gửi thảo luận hoặc trả lời bình luận của người khác dưới một bài tập (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      targetId: 'mongodb-problem-or-comment-id',
      targetType: 'PROBLEM', // PROBLEM | CONTEST | DISCUSSION | COMMENT
      content: 'Giải pháp này tối ưu O(N) bộ nhớ tuyệt vời!'
    }, null, 2)
  },
  {
    id: 'comments-update',
    name: 'Sửa nội dung bình luận',
    category: 'Bình luận (Comments)',
    method: 'PUT',
    path: '/api/v1/comments/:commentId',
    description: 'Cập nhật lại nội dung thảo luận đã gửi trước đó qua Comment ID (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['commentId'],
    defaultBody: JSON.stringify({
      content: 'Nội dung bình luận đã được chỉnh sửa để rõ ràng hơn...'
    }, null, 2)
  },
  {
    id: 'comments-delete',
    name: 'Xóa bình luận',
    category: 'Bình luận (Comments)',
    method: 'DELETE',
    path: '/api/v1/comments/:commentId',
    description: 'Xóa bình luận đã gửi trước đó qua Comment ID (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['commentId']
  },
  {
    id: 'comments-like-toggle',
    name: 'Thích/Bỏ thích bình luận',
    category: 'Bình luận (Comments)',
    method: 'POST',
    path: '/api/v1/comments/:commentId/like',
    description: 'Thích hoặc bỏ thích bình luận của người khác để đẩy thảo luận hữu ích lên đầu (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['commentId']
  },

  // --- FRIENDS ---
  {
    id: 'friends-request-send',
    name: 'Gửi lời mời kết bạn',
    category: 'Bạn bè & Kết nối (Friends & Social)',
    method: 'POST',
    path: '/api/v1/friends/request',
    description: 'Gửi lời mời kết bạn cho người dùng khác qua User ID (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      receiverId: 'uuid-of-other-user'
    }, null, 2)
  },
  {
    id: 'friends-request-accept',
    name: 'Chấp nhận kết bạn',
    category: 'Bạn bè & Kết nối (Friends & Social)',
    method: 'POST',
    path: '/api/v1/friends/accept',
    description: 'Đồng ý lời mời kết bạn từ người khác qua User ID gửi đến (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      senderId: 'uuid-of-request-sender'
    }, null, 2)
  },
  {
    id: 'friends-request-decline',
    name: 'Từ chối kết bạn',
    category: 'Bạn bè & Kết nối (Friends & Social)',
    method: 'POST',
    path: '/api/v1/friends/decline',
    description: 'Từ chối lời mời kết bạn từ người khác qua User ID (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      senderId: 'uuid-of-request-sender'
    }, null, 2)
  },
  {
    id: 'friends-remove',
    name: 'Hủy kết bạn',
    category: 'Bạn bè & Kết nối (Friends & Social)',
    method: 'DELETE',
    path: '/api/v1/friends/:friendId',
    description: 'Xóa một người dùng ra khỏi danh sách bạn bè qua Friend ID (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['friendId']
  },
  {
    id: 'friends-list',
    name: 'Xem danh sách bạn bè',
    category: 'Bạn bè & Kết nối (Friends & Social)',
    method: 'GET',
    path: '/api/v1/friends',
    description: 'Xem toàn bộ danh sách bạn bè cùng trạng thái online/offline realtime từ Redis (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'friends-requests-pending',
    name: 'Xem danh sách lời mời đang chờ',
    category: 'Bạn bè & Kết nối (Friends & Social)',
    method: 'GET',
    path: '/api/v1/friends/requests',
    description: 'Lấy các yêu cầu kết bạn đang chờ bạn phê duyệt (Yêu cầu Token)',
    requiresAuth: true
  },

  // --- SHOP ---
  {
    id: 'shop-list',
    name: 'Xem danh sách cửa hàng',
    category: 'Cửa hàng & Kho đồ (Shop & Inventory)',
    method: 'GET',
    path: '/api/v1/shop',
    description: 'Xem danh sách các vật phẩm khung avatar, giao diện trang trí đang bán (Public)',
    requiresAuth: false
  },
  {
    id: 'shop-create-item',
    name: 'Thêm vật phẩm vào cửa hàng (Admin)',
    category: 'Cửa hàng & Kho đồ (Shop & Inventory)',
    method: 'POST',
    path: '/api/v1/shop',
    description: 'Đăng bán vật phẩm trang trí mới vào shop của hệ thống (Yêu cầu Admin)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      name: 'Khung Avatar Neon Vàng',
      description: 'Khung avatar neon lấp lánh cực ngầu cho các đấu thủ hàng đầu',
      type: 'AVATAR_FRAME', // AVATAR_FRAME | PROFILE_THEME
      price: 500, // giá xu Code Coins
      imageUrl: 'https://example.com/assets/neon_frame.png'
    }, null, 2)
  },
  {
    id: 'shop-buy-item',
    name: 'Mua vật phẩm',
    category: 'Cửa hàng & Kho đồ (Shop & Inventory)',
    method: 'POST',
    path: '/api/v1/shop/buy',
    description: 'Dùng xu Code Coins tích lũy được từ việc giải bài tập để mua vật phẩm (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      itemId: 'uuid-of-shop-item'
    }, null, 2)
  },
  {
    id: 'shop-inventory',
    name: 'Xem kho đồ cá nhân',
    category: 'Cửa hàng & Kho đồ (Shop & Inventory)',
    method: 'GET',
    path: '/api/v1/shop/inventory',
    description: 'Xem toàn bộ các vật phẩm trang trí đã mua của user (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'shop-equip-item',
    name: 'Trang bị / Tháo trang bị vật phẩm',
    category: 'Cửa hàng & Kho đồ (Shop & Inventory)',
    method: 'POST',
    path: '/api/v1/shop/equip',
    description: 'Trang bị khung hoặc theme đã sở hữu lên hồ sơ cá nhân, hoặc tháo ra nếu đã trang bị (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      inventoryItemId: 'uuid-of-owned-inventory-item'
    }, null, 2)
  },

  // --- NOTIFICATIONS ---
  {
    id: 'notifications-create',
    name: 'Tạo thông báo mới (Admin)',
    category: 'Thông báo hệ thống (Notifications)',
    method: 'POST',
    path: '/api/v1/notifications',
    description: 'Gửi thông báo hệ thống đến cho người dùng cụ thể hoặc toàn bộ user (Yêu cầu Admin)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      userId: 'uuid-of-receiver-or-null-for-all',
      title: 'Bảo trì hệ thống định kỳ',
      content: 'Hệ thống sẽ bảo trì từ 2h00 đến 4h00 sáng mai.'
    }, null, 2)
  },
  {
    id: 'notifications-list',
    name: 'Xem các thông báo',
    category: 'Thông báo hệ thống (Notifications)',
    method: 'GET',
    path: '/api/v1/notifications',
    description: 'Xem danh sách các thông báo của người dùng đăng nhập hiện tại (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'notifications-read',
    name: 'Đánh dấu đã xem',
    category: 'Thông báo hệ thống (Notifications)',
    method: 'PUT',
    path: '/api/v1/notifications/read',
    description: 'Đánh dấu một hoặc nhiều thông báo là đã xem (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      notificationIds: ['uuid-of-notification-1', 'uuid-of-notification-2']
    }, null, 2)
  },
  {
    id: 'notifications-delete',
    name: 'Xóa thông báo',
    category: 'Thông báo hệ thống (Notifications)',
    method: 'DELETE',
    path: '/api/v1/notifications/:notificationId',
    description: 'Xóa thông báo không muốn hiển thị nữa qua Notification ID (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['notificationId']
  },

  // --- REPORTS ---
  {
    id: 'reports-create',
    name: 'Gửi báo cáo lỗi/vi phạm',
    category: 'Báo cáo & Tố cáo (Reports)',
    method: 'POST',
    path: '/api/v1/reports',
    description: 'Gửi báo cáo lỗi hệ thống, sai đề bài hoặc gian lận đấu pvp (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      type: 'BUG', // BUG | TYPO | CHEATING | OTHERS
      content: 'Chức năng nộp bài bị lỗi hiển thị định dạng...',
      problemId: 'mongodb-problem-object-id' // Tùy chọn
    }, null, 2)
  },
  {
    id: 'reports-list',
    name: 'Xem danh sách báo cáo',
    category: 'Báo cáo & Tố cáo (Reports)',
    method: 'GET',
    path: '/api/v1/reports',
    description: 'Xem danh sách các báo cáo lỗi/tố cáo trên hệ thống (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'reports-update-status',
    name: 'Cập nhật trạng thái báo cáo (Admin)',
    category: 'Báo cáo & Tố cáo (Reports)',
    method: 'PUT',
    path: '/api/v1/reports/:reportId',
    description: 'Cập nhật trạng thái xử lý báo cáo lỗi của người dùng (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['reportId'],
    defaultBody: JSON.stringify({
      status: 'RESOLVED' // PENDING | RESOLVED | REJECTED
    }, null, 2)
  }
];
