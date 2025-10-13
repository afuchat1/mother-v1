
'use client';
import { useState } from 'react';
import type { Chat } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import AiChatHandler from "./ai-chat-handler";

type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat, setActiveChat }: ChatViewProps) {
  const [input, setInput] = useState('');

  if (chat.type === 'ai') {
    return <AiChatHandler chat={chat} />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Handle message submission for regular chats.
    // This is not yet implemented.
    console.log("Submitting:", input);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b bg-card p-4">
        <ChatAvatar chat={chat} />
        <div className="flex-1">
          <h2 className="font-semibold font-headline">{chat.name}</h2>
          <p className="text-sm text-muted-foreground">
            {chat.type === 'dm' ? 'Direct Message' : 'Group Chat'}
          </p>
        </div>
      </header>
      <ChatMessages messages={chat.messages} />
      <ChatInput 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
