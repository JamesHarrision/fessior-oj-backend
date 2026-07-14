import { useState, useCallback } from "react";
import type {  ChatSession, ChatMessage  } from "../types/chat.types";
import { MOCK_SESSIONS } from "../data/chatMock";
import { sendMessage } from "../api/chatApi";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("model-1");

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      model: selectedModel,
      createdAt: Date.now(),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, [selectedModel]);

  const sendUserMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let sessionId = activeSessionId;

      // Tạo session mới nếu chưa có
      if (!sessionId) {
        const newSession: ChatSession = {
          id: generateId(),
          title: content.slice(0, 40),
          model: selectedModel,
          createdAt: Date.now(),
          messages: [],
        };
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        sessionId = newSession.id;
      }

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      // Thêm message user
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, userMsg],
                title: s.messages.length === 0 ? content.slice(0, 40) : s.title,
              }
            : s
        )
      );

      setIsTyping(true);
      try {
        const reply = await sendMessage(sessionId, content, selectedModel);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, reply] }
              : s
          )
        );
      } finally {
        setIsTyping(false);
      }
    },
    [activeSessionId, selectedModel]
  );

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    isTyping,
    selectedModel,
    setSelectedModel,
    createNewSession,
    sendUserMessage,
  };
}
