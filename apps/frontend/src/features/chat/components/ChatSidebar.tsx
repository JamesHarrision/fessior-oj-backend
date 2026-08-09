import React from "react";
import type {  ChatSession  } from "../types/chat.types";

interface Props {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<Props> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}) => {
  return (
    <aside className="chat-sidebar">
      {/* Header */}
      <div className="chat-sidebar-header">
        <div className="chat-sidebar-brand">
          <span className="chat-brand-title">ARYA</span>
          <span className="chat-brand-sub">CHATBOT</span>
        </div>
      </div>

      {/* New Chat button */}
      <button className="chat-new-btn" onClick={onNewChat}>
        <span>+</span> New Chat
      </button>

      {/* Session list */}
      <div className="chat-session-list">
        {sessions.map((session) => (
          <button
            key={session.id}
            className={`chat-session-item${session.id === activeSessionId ? " active" : ""}`}
            onClick={() => onSelectSession(session.id)}
          >
            <span className="chat-session-title">{session.title}</span>
          </button>
        ))}
      </div>

    </aside>
  );
};

export default ChatSidebar;
