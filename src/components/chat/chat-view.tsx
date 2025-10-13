'use client';
import { useState } from 'react';
import type { Chat, Message } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import AiChatHandler from "./ai-chat-handler";
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { currentUser } from '@/lib/data';

type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat, setActiveChat }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(chat.messages);
  const [image, setImage] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    
    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: input,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: currentUser,
        imageUrl: image ? URL.createObjectURL(image) : undefined,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // In a real app, you would upload the image to a server and get a URL.
    // For this demo, we're just using the local object URL.

    setInput('');
    setImage(null);
  };

  const commonHeader = (
    <header className="flex items-center gap-2 border-b bg-background p-2 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)}>
            <ArrowLeft />
        </Button>
        {chat.type !== 'ai' && <ChatAvatar chat={chat} />}
        <div className="flex-1">
          <h2 className="font-semibold font-headline text-base">{chat.name}</h2>
          {chat.type !== 'ai' && (
            <p className="text-sm text-muted-foreground">
                {chat.type === 'dm' ? 'Online' : `${chat.members?.length} members`}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
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
        <ChatMessages messages={messages} />
      </div>
      <ChatInput 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleImageChange={handleImageChange}
        imagePreview={image ? URL.createObjectURL(image) : null}
        removeImage={() => setImage(null)}
      />
    </div>
  );
}
