import React from "react";
import type {  SuggestionCard  } from "../types/chat.types";

interface Props {
  suggestions: SuggestionCard[];
  onSuggestionClick: (text: string) => void;
}

const ChatWelcome: React.FC<Props> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="chat-welcome">
      {/* Watermark */}
      <div className="chat-watermark" aria-hidden="true">
        <span className="watermark-arya">arya</span>
        <span className="watermark-chatbot">CHATBOT</span>
      </div>

      {/* Suggestion cards */}
      <div className="suggestion-grid">
        {suggestions.map((card) => (
          <button
            key={card.id}
            className="suggestion-card"
            onClick={() => onSuggestionClick(card.title)}
          >
            <span className="suggestion-title">{card.title}</span>
            <span className="suggestion-sub">{card.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatWelcome;
