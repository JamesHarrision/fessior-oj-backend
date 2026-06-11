import type { ApiEndpoint } from '../apiListData';

export const roomEndpoints: ApiEndpoint[] = [
  {
    id: 'rooms-create',
    name: 'Tạo phòng Custom mới',
    category: 'Phòng đấu (Rooms)',
    method: 'POST',
    path: '/api/v1/rooms/create',
    description: 'Tạo phòng thi đấu tùy chỉnh (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      problemId: 'mongodb-problem-object-id', // Tùy chọn (Nếu chọn sẵn bài)
      difficulty: 'MEDIUM' // EASY | MEDIUM | HARD (Bắt buộc nếu không chọn problemId)
    }, null, 2)
  },
  {
    id: 'rooms-active',
    name: 'Lấy phòng đang hoạt động',
    category: 'Phòng đấu (Rooms)',
    method: 'GET',
    path: '/api/v1/rooms/active',
    description: 'Lấy danh sách các phòng custom pvp đang mở và ở trạng thái chờ người tham gia (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'rooms-get-detail',
    name: 'Xem chi tiết phòng',
    category: 'Phòng đấu (Rooms)',
    method: 'GET',
    path: '/api/v1/rooms/:roomId',
    description: 'Lấy thông tin chi tiết cấu hình và người chơi trong phòng đấu custom (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['roomId']
  },
  {
    id: 'rooms-join',
    name: 'Tham gia phòng custom',
    category: 'Phòng đấu (Rooms)',
    method: 'POST',
    path: '/api/v1/rooms/join',
    description: 'Tham gia phòng custom bằng mã Room Code gồm 6 ký tự (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      roomCode: 'ABCD12'
    }, null, 2)
  },
  {
    id: 'rooms-leave',
    name: 'Rời phòng custom',
    category: 'Phòng đấu (Rooms)',
    method: 'POST',
    path: '/api/v1/rooms/leave',
    description: 'Rời khỏi phòng custom hiện tại đang ở (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'rooms-update-config',
    name: 'Cập nhật cấu hình phòng',
    category: 'Phòng đấu (Rooms)',
    method: 'PUT',
    path: '/api/v1/rooms/:roomId',
    description: 'Thay đổi độ khó hoặc đổi bài tập trong phòng đấu (chỉ dành cho Chủ phòng) (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['roomId'],
    defaultBody: JSON.stringify({
      difficulty: 'HARD',
      problemId: 'mongodb-problem-object-id'
    }, null, 2)
  },
  {
    id: 'rooms-delete',
    name: 'Giải tán phòng đấu',
    category: 'Phòng đấu (Rooms)',
    method: 'DELETE',
    path: '/api/v1/rooms/:roomId',
    description: 'Hủy/xóa phòng đấu tùy chỉnh (chỉ dành cho Chủ phòng) (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['roomId']
  }
];
