import type { ApiEndpoint } from '../apiListData';

export const submissionEndpoints: ApiEndpoint[] = [
  {
    id: 'submissions-submit',
    name: 'Nộp bài giải (Submit Code)',
    category: 'Bài nộp (Submissions)',
    method: 'POST',
    path: '/api/v1/submissions',
    description: 'Nộp code giải bài tập để hệ thống chấm điểm thông qua hàng đợi BullMQ (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      problemId: 'mongodb-problem-object-id',
      language: 'python', // cpp | java | python
      code: 'import sys\nprint("Hello World")'
    }, null, 2)
  },
  {
    id: 'submissions-run',
    name: 'Chạy thử mã nguồn (Run Code)',
    category: 'Bài nộp (Submissions)',
    method: 'POST',
    path: '/api/v1/submissions/run',
    description: 'Biên dịch và chạy thử code với dữ liệu tùy chọn, không lưu vào lịch sử chấm bài (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      problemId: 'mongodb-problem-object-id',
      language: 'cpp', // cpp | java | python
      code: '#include <iostream>\nusing namespace std;\nint main() { cout << "Test"; return 0; }',
      customInput: 'some-custom-input-data'
    }, null, 2)
  },
  {
    id: 'submissions-list',
    name: 'Danh sách bài nộp',
    category: 'Bài nộp (Submissions)',
    method: 'GET',
    path: '/api/v1/submissions',
    description: 'Lấy toàn bộ lịch sử các lần nộp bài chấm điểm của người dùng hiện tại (Yêu cầu Token)',
    requiresAuth: true
  },
  {
    id: 'submissions-get-detail',
    name: 'Xem chi tiết kết quả bài nộp',
    category: 'Bài nộp (Submissions)',
    method: 'GET',
    path: '/api/v1/submissions/:id',
    description: 'Lấy trạng thái chấm bài (AC, WA, TLE, CTE...), thời gian thực thi, bộ nhớ sử dụng chi tiết (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['id']
  }
];
