import type {  ChatSession, ChatModel, SuggestionCard  } from "../types/chat.types";

export const CHAT_MODELS: ChatModel[] = [
  { id: "model-1", label: "Model 1" },
  { id: "model-2", label: "Model 2" },
  { id: "model-3", label: "Model 3" },
];

export const SUGGESTION_CARDS: SuggestionCard[] = [
  { id: 1, title: "Thử trình độ hiện tại", subtitle: "Kiểm tra xem bạn hiểu code tới đâu" },
  { id: 2, title: "Gợi ý bài luyện tiếp theo", subtitle: "Chọn bài theo trình độ hiện tại" },
  { id: 3, title: "Giải thích đoạn code sau", subtitle: "Giải thích cho tôi tại sao code này..." },
  { id: 4, title: "Solo code 1vs1 là gì?", subtitle: "Tìm hiểu về hệ thống solo code" },
  { id: 5, title: "Tối ưu lời giải", subtitle: "Phân tích độ phức tạp và cách cải thiện" },
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
    title: "Tối ưu lời giải Two Sum",
    model: "model-1",
    createdAt: Date.now() - 172800000,
    messages: [
      { id: "m3", role: "user", content: "Giúp tôi tối ưu lời giải Two Sum", timestamp: Date.now() - 172800000 },
      { id: "m4", role: "assistant", content: "Với Two Sum, cách tối ưu phổ biến là dùng hash map để giảm từ O(n^2) xuống O(n).", timestamp: Date.now() - 172790000 },
    ],
  },
];
