import React from "react";
import { useChat } from "../hooks/useChat";
import ChatSidebar from "../components/ChatSidebar";
import ModelSelector from "../components/ModelSelector";
import ChatWelcome from "../components/ChatWelcome";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { CHAT_MODELS, SUGGESTION_CARDS } from "../data/chatMock";

const ChatPage: React.FC = () => {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    isTyping,
    selectedModel,
    setSelectedModel,
    createNewSession,
    sendUserMessage,
  } = useChat();

  const hasMessages = (activeSession?.messages.length ?? 0) > 0;

  return (
    <div className="chat-layout h-full flex overflow-hidden">
      {/* Left sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={createNewSession}
      />

      {/* Main chat area */}
      <div className="chat-main flex-1 flex flex-col relative min-w-0 border-r border-charcoal">
        {/* Model selector */}
        <div className="chat-main-header">
          <ModelSelector
            models={CHAT_MODELS}
            selectedModel={selectedModel}
            onSelect={setSelectedModel}
          />
        </div>

        {/* Messages or welcome screen */}
        <div className="chat-body flex-1 overflow-y-auto">
          {hasMessages ? (
            <ChatMessages
              messages={activeSession!.messages}
              isTyping={isTyping}
            />
          ) : (
            <ChatWelcome
              suggestions={SUGGESTION_CARDS}
              onSuggestionClick={sendUserMessage}
            />
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendUserMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatPage;
