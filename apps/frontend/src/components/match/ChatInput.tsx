import React, { useState } from 'react';
import { Send } from 'lucide-react';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSendMessage(value);
    setValue('');
  };

  return (
    <div className="chat-input-section">
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-field"
            placeholder="Bạn muốn tìm hiểu về gì?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className="send-btn" aria-label="Send">
            <Send size={18} />
          </button>
        </div>
      </form>
      <p className="chat-hint">
        Mẹo: Hãy chuẩn bị tinh thần thép trước khi bước vào trận đấu.
      </p>
    </div>
  );
};
