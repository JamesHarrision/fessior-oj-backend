import type { ApiEndpoint } from '../apiListData';

export const problemEndpoints: ApiEndpoint[] = [
  {
    id: 'problems-tags-get',
    name: 'Xem danh sách thẻ nhãn (Tags)',
    category: 'Bài tập (Problems)',
    method: 'GET',
    path: '/api/v1/problems/tags',
    description: 'Lấy toàn bộ các tag/nhãn phân loại thuật toán của bài tập',
    requiresAuth: false
  },
  {
    id: 'problems-tags-post',
    name: 'Tạo thẻ nhãn mới',
    category: 'Bài tập (Problems)',
    method: 'POST',
    path: '/api/v1/problems/tags',
    description: 'Tạo nhãn phân loại bài tập mới (Yêu cầu Admin)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      name: 'Dynamic Programming'
    }, null, 2)
  },
  {
    id: 'problems-list',
    name: 'Xem danh sách bài tập',
    category: 'Bài tập (Problems)',
    method: 'GET',
    path: '/api/v1/problems',
    description: 'Lấy danh sách các bài tập lập trình trên hệ thống (có thể lọc theo tag, độ khó)',
    requiresAuth: false
  },
  {
    id: 'problems-get-detail',
    name: 'Xem chi tiết bài tập',
    category: 'Bài tập (Problems)',
    method: 'GET',
    path: '/api/v1/problems/:slug',
    description: 'Lấy thông tin đề bài, giới hạn thời gian/bộ nhớ của bài tập qua Slug',
    requiresAuth: false,
    pathParams: ['slug']
  },
  {
    id: 'problems-create',
    name: 'Tạo bài tập mới',
    category: 'Bài tập (Problems)',
    method: 'POST',
    path: '/api/v1/problems',
    description: 'Tạo bài tập lập trình mới lên hệ thống (Yêu cầu Admin)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target...',
      difficulty: 'EASY', // EASY | MEDIUM | HARD
      timeLimit: 2000, // milliseconds
      memoryLimit: 256, // MB
      tags: ['Array', 'Hash Table']
    }, null, 2)
  },
  {
    id: 'problems-update',
    name: 'Cập nhật bài tập',
    category: 'Bài tập (Problems)',
    method: 'PUT',
    path: '/api/v1/problems/:id',
    description: 'Chỉnh sửa thông tin bài tập thông qua Problem ID (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['id'],
    defaultBody: JSON.stringify({
      title: 'Two Sum (Updated)',
      description: 'New updated description here...',
      difficulty: 'EASY',
      timeLimit: 1500,
      memoryLimit: 128,
      tags: ['Array']
    }, null, 2)
  },
  {
    id: 'problems-delete',
    name: 'Xóa bài tập',
    category: 'Bài tập (Problems)',
    method: 'DELETE',
    path: '/api/v1/problems/:id',
    description: 'Xóa bài tập khỏi hệ thống thông qua Problem ID (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['id']
  },
  {
    id: 'problems-testcases-add',
    name: 'Thêm Testcase cho bài tập',
    category: 'Bài tập (Problems)',
    method: 'POST',
    path: '/api/v1/problems/:problemId/testcases',
    description: 'Thêm cặp dữ liệu đầu vào (input) và kết quả mong muốn (output) để chấm điểm (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['problemId'],
    defaultBody: JSON.stringify({
      input: '2 7 11 15\n9',
      output: '0 1',
      isSample: true // Testcase mẫu hiển thị cho người dùng hoặc ẩn
    }, null, 2)
  },
  {
    id: 'problems-testcases-get',
    name: 'Lấy danh sách Testcase',
    category: 'Bài tập (Problems)',
    method: 'GET',
    path: '/api/v1/problems/:problemId/testcases',
    description: 'Xem tất cả các testcase đã cấu hình cho bài tập (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['problemId']
  },
  {
    id: 'problems-testcases-delete',
    name: 'Xóa Testcase',
    category: 'Bài tập (Problems)',
    method: 'DELETE',
    path: '/api/v1/problems/testcases/:testcaseId',
    description: 'Xóa một testcase cụ thể thông qua Testcase ID (Yêu cầu Admin)',
    requiresAuth: true,
    pathParams: ['testcaseId']
  }
];
