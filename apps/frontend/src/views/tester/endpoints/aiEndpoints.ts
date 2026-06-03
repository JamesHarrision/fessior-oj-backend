import type { ApiEndpoint } from '../apiListData';

export const aiEndpoints: ApiEndpoint[] = [
  {
    id: 'ai-roadmap',
    name: 'Tạo lộ trình học thuật (DSA Roadmap)',
    category: 'Trí tuệ nhân tạo (AI)',
    method: 'POST',
    path: '/api/v1/ai/roadmap',
    description: 'Sử dụng Google Gemini AI để sinh lộ trình học thuật cá nhân hóa cho một chủ đề DSA cụ thể (Yêu cầu Token)',
    requiresAuth: true,
    defaultBody: JSON.stringify({
      topic: 'Dynamic Programming', // Đề tài học thuật
      level: 'INTERMEDIATE' // EASY | INTERMEDIATE | HARD
    }, null, 2)
  },
  {
    id: 'ai-feedback',
    name: 'Phản hồi giả lập phỏng vấn (Mock Interview Feedback)',
    category: 'Trí tuệ nhân tạo (AI)',
    method: 'POST',
    path: '/api/v1/ai/feedback/:submissionId',
    description: 'Nhận nhận xét, đánh giá chuyên sâu và giải pháp tối ưu từ AI cho một bài nộp cụ thể qua Submission ID (Yêu cầu Token)',
    requiresAuth: true,
    pathParams: ['submissionId']
  }
];
