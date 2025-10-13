'use client';
import { useState } from 'react';
import type { Chat } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import AiChatHandler from "./ai-chat-handler";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat, setActiveChat }: ChatViewProps) {
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    // This is not yet implemented.
    console.log("Submitting:", input);
    setInput('');
  };

  const commonHeader = (
    <header className="flex items-center gap-2 border-b bg-background p-2 md:p-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)} className="md:hidden">
            <ArrowLeft />
        </Button>
        {chat.type !== 'ai' && <ChatAvatar chat={chat} />}
        <div className="flex-1">
          <h2 className="font-semibold font-headline text-sm md:text-base">{chat.name}</h2>
          {chat.type !== 'ai' && (
            <p className="text-xs text-muted-foreground md:text-sm">
                {chat.type === 'dm' ? 'Direct Message' : 'Group Chat'}
            </p>
          )}
        </div>
      </header>
  );

  if (chat.type === 'ai') {
    return (
        <div className="flex h-full flex-col bg-background">
            {commonHeader}
            <AiChatHandler chat={chat} />
        </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {commonHeader}
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={chat.messages} />
      </div>
      <ChatInput 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
