import type {  ChatSession, ChatModel, SuggestionCard  } from "../types/chat.types";

export const CHAT_MODELS: ChatModel[] = [
  { id: "model-1", label: "Model 1" },
  { id: "model-2", label: "Model 2" },
  { id: "model-3", label: "Model 3" },
];

export const SUGGESTION_CARDS: SuggestionCard[] = [
  { id: 1, title: "Thử trình độ hiện tại", subtitle: "Kiểm tra xem bạn hiểu code tới đâu" },
  { id: 2, title: "Tạo roadmap cho tôi", subtitle: "Tạo roadmap với những gì bạn muốn" },
  { id: 3, title: "Lên kế hoạch cho phỏng vấn", subtitle: "Cần ôn lại gì cho buổi phỏng vấn" },
  { id: 4, title: "Giải thích đoạn code sau", subtitle: "Giải thích cho tôi tại sao code này..." },
  { id: 5, title: "Solo code 1vs1 là gì?", subtitle: "Tìm hiểu về hệ thống solo code" },
  { id: 6, title: "AI mock interview", subtitle: "Tìm hiểu về hệ thống AI mock inter" },
];

export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: "s1",
    title: "Giải thích Big O notation",
    model: "model-1",
    createdAt: Date.now() - 86400000,
    messages: [
      { id: "m1", role: "user", content: "Big O notation là gì?", timestamp: Date.now() - 86400000 },
      { id: "m2", role: "assistant", content: "Big O notation là cách ký hiệu để mô tả độ phức tạp thời gian hoặc không gian của một thuật toán...", timestamp: Date.now() - 86390000 },
    ],
  },
  {
    id: "s2",
    title: "Roadmap học Frontend",
    model: "model-1",
    createdAt: Date.now() - 172800000,
    messages: [
      { id: "m3", role: "user", content: "Tạo roadmap học Frontend cho tôi", timestamp: Date.now() - 172800000 },
      { id: "m4", role: "assistant", content: "Đây là roadmap học Frontend từ cơ bản đến nâng cao...", timestamp: Date.now() - 172790000 },
    ],
  },
];
