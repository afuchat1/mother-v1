'use client';
import { useState, useRef, useEffect } from 'react';
import type { Chat, Message } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import AiChatHandler from "./ai-chat-handler";
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, ArrowDown } from 'lucide-react';
import { currentUser } from '@/lib/data';

type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat: initialChat, setActiveChat }: ChatViewProps) {
  const [chat, setChat] = useState(initialChat);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);


  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: behavior,
        });
    }
  };

  useEffect(() => {
    setChat(initialChat);
    scrollToBottom('auto');
  }, [initialChat]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let isScrolledToBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 1;

    // Auto-scroll if we are already at the bottom
    if (isScrolledToBottom) {
        scrollToBottom('auto');
    } else {
        setShowScrollButton(true);
    }
    
    const handleScroll = () => {
        if (scrollContainer) {
            const isAtBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 1;
            if (isAtBottom) {
                setShowScrollButton(false);
            }
        }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [chat.messages]);

  const handleNewMessage = (newMessage: Message) => {
    setChat(prevChat => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string }) => {
    e.preventDefault();
    if (!input.trim() && !image && !options?.voiceUrl) return;
    
    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: input,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: currentUser,
        imageUrl: image ? URL.createObjectURL(image) : undefined,
        voiceUrl: options?.voiceUrl,
    };

    handleNewMessage(newMessage);
    
    setInput('');
    setImage(null);
  };

  const commonHeader = (
    <header className="flex items-center gap-2 border-b bg-background/80 backdrop-blur-sm p-2 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)}>
            <ArrowLeft />
        </Button>
        <ChatAvatar chat={chat} />
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
            <AiChatHandler chat={chat} handleNewMessage={handleNewMessage} />
        </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background relative">
      {commonHeader}
      <div className="flex-1 overflow-y-auto pb-24" ref={scrollRef}>
        <ChatMessages messages={chat.messages} />
      </div>
       {showScrollButton && (
            <div className="absolute bottom-20 right-4 z-20">
                <Button onClick={() => scrollToBottom()} size="icon" className="rounded-full shadow-lg">
                    <ArrowDown className="h-5 w-5" />
                </Button>
            </div>
        )}
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
