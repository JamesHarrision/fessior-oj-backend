import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { FaPlus, FaCheck } from "react-icons/fa";
import type { ChatMessage } from "../types/chat.types";
import { useCustomRoadmaps } from "../../ai-roadmap/hooks/useCustomRoadmaps";

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatMessages: React.FC<Props> = ({ messages, isTyping }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { addRoadmap } = useCustomRoadmaps();
  const [savedMsgs, setSavedMsgs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSaveRoadmap = (msg: ChatMessage) => {
    addRoadmap(msg.content);
    setSavedMsgs((prev) => ({ ...prev, [msg.id]: true }));
  };

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
              <div className="flex flex-col gap-2">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <div className="flex justify-end mt-1">
                  <button 
                    onClick={() => handleSaveRoadmap(msg)}
                    className="flex items-center gap-1.5 text-xs bg-washi border border-charcoal text-stone hover:text-vermilion hover:border-vermilion px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    {savedMsgs[msg.id] ? <FaCheck className="text-green-500" /> : <FaPlus />}
                    {savedMsgs[msg.id] ? "Đã lưu vào Roadmap" : "Lưu vào Roadmap"}
                  </button>
                </div>
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
