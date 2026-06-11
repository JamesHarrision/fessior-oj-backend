import type { ApiEndpoint } from '../apiListData';

export const contestEndpoints: ApiEndpoint[] = [
  {
    id: 'contests-list',
    name: 'Xem danh sách các cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'GET',
    path: '/api/v1/contests',
    description: 'Lấy toàn bộ các giải đấu lập trình đang diễn ra, sắp diễn ra hoặc đã kết thúc',
    requiresAuth: false
  },
  {
    id: 'contests-get-detail',
    name: 'Xem chi tiết cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'GET',
    path: '/api/v1/contests/:contestId',
    description: 'Lấy thông tin mô tả, thể lệ, thời gian bắt đầu và kết thúc của cuộc thi qua Contest ID',
    requiresAuth: false,
    pathParams: ['contestId']
  },
  {
    id: 'contests-get-leaderboard',
    name: 'Bảng xếp hạng cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'GET',
    path: '/api/v1/contests/:contestId/leaderboard',
    description: 'Xem bảng xếp hạng điểm số hiện tại của những người tham gia cuộc thi qua Contest ID',
    requiresAuth: false,
    pathParams: ['contestId']
  },
  {
    id: 'contests-create',
    name: 'Tạo cuộc thi mới (Admin)',
    category: 'Giải đấu (Contests)',
    method: 'POST',
    path: '/api/v1/contests',
    description: 'Tạo một cuộc thi lập trình mới kèm bộ bài tập chọn sẵn (Yêu cầu Admin)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      title: 'Summer Code Challenge 2026',
      description: 'Chinh phục bảng xếp hạng cùng những bài tập hấp dẫn!',
      startTime: new Date(Date.now() + 86400000).toISOString(), // ngày mai
      endTime: new Date(Date.now() + 86400000 + 10800000).toISOString(), // 3 tiếng sau khi bắt đầu
      problems: [
        {
          problemId: 'mongodb-problem-object-id',
          points: 100,
          order: 1
        }
      ]
    }, null, 2)
  },
  {
    id: 'contests-update',
    name: 'Cập nhật cuộc thi (Admin)',
    category: 'Giải đấu (Contests)',
    method: 'PUT',
    path: '/api/v1/contests/:contestId',
    description: 'Thay đổi thông tin, cập nhật danh sách bài tập hoặc thời gian giải đấu (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['contestId'],
    defaultBody: JSON.stringify({
      title: 'Summer Code Challenge 2026 (Updated)',
      description: 'Updated description here...',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 + 14400000).toISOString(), // 4 tiếng
      problems: []
    }, null, 2)
  },
  {
    id: 'contests-delete',
    name: 'Xóa cuộc thi (Admin)',
    category: 'Giải đấu (Contests)',
    method: 'DELETE',
    path: '/api/v1/contests/:contestId',
    description: 'Xóa vĩnh viễn một cuộc thi lập trình khỏi hệ thống qua Contest ID (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['contestId']
  },
  {
    id: 'contests-register',
    name: 'Đăng ký tham gia cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'POST',
    path: '/api/v1/contests/:contestId/register',
    description: 'Đăng ký ghi danh tham gia giải đấu để có quyền nộp bài khi giải đấu bắt đầu (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['contestId']
  },
  {
    id: 'contests-unregister',
    name: 'Hủy đăng ký cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'POST',
    path: '/api/v1/contests/:contestId/unregister',
    description: 'Hủy đăng ký ghi danh tham gia giải đấu (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['contestId']
  },
  {
    id: 'contests-problems',
    name: 'Xem bài tập trong cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'GET',
    path: '/api/v1/contests/:contestId/problems',
    description: 'Lấy toàn bộ danh sách bài tập của cuộc thi (chỉ xem được khi cuộc thi đang diễn ra) (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['contestId']
  },
  {
    id: 'contests-submissions',
    name: 'Xem bài nộp trong cuộc thi',
    category: 'Giải đấu (Contests)',
    method: 'GET',
    path: '/api/v1/contests/:contestId/submissions',
    description: 'Lấy các bài nộp của user trong khuôn khổ cuộc thi hiện tại (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['contestId']
  }
];
