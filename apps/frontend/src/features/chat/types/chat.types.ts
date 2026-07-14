export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  model: string;
}

export interface ChatModel {
  id: string;
  label: string;
}

export interface SuggestionCard {
  id: number;
  title: string;
  subtitle: string;
}
