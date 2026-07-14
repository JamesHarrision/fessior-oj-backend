import type {  ChatMessage, ChatSession  } from "../types/chat.types";
import { MOCK_SESSIONS } from "../data/chatMock";

// ─── Toggle để chuyển giữa mock và API thật ───────────────────────────────────
const USE_MOCK = false;
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:6868/api/v1";

// ── Mock implementations ──────────────────────────────────────────────────────

async function fetchSessionsMock(): Promise<ChatSession[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_SESSIONS), 200));
}

async function sendMessageMock(
  _sessionId: string,
  content: string
): Promise<ChatMessage> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    id: `mock-${Date.now()}`,
    role: "assistant",
    content: `Đây là phản hồi mock cho: "${content}". Khi có API thật, hãy đặt USE_MOCK = false.`,
    timestamp: Date.now(),
  };
}

// ── Real API implementations (implement khi có backend) ───────────────────────

async function fetchSessionsFromApi(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/chat/sessions`);
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json() as Promise<ChatSession[]>;
}

async function sendMessageToApi(
  sessionId: string,
  content: string,
  model: string
): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, model }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json() as Promise<ChatMessage>;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<ChatSession[]> {
  return USE_MOCK ? fetchSessionsMock() : fetchSessionsFromApi();
}

export async function sendMessage(
  sessionId: string,
  content: string,
  model: string = "model-1"
): Promise<ChatMessage> {
  return USE_MOCK
    ? sendMessageMock(sessionId, content)
    : sendMessageToApi(sessionId, content, model);
}
