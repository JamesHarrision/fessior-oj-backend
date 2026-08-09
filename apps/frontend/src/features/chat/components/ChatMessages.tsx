import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { ChatMessage } from "../types/chat.types";

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatMessages: React.FC<Props> = ({ messages, isTyping }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="chat-messages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`chat-bubble-wrap${msg.role === "user" ? " user" : " assistant"}`}
        >
          {msg.role === "assistant" && (
            <div className="chat-avatar-icon">A</div>
          )}
          <div className={`chat-bubble${msg.role === "user" ? " user" : " assistant"}`}>
            {msg.role === "assistant" ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              msg.content
            )}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="chat-bubble-wrap assistant">
          <div className="chat-avatar-icon">A</div>
          <div className="chat-bubble assistant chat-typing">
            <span /><span /><span />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
