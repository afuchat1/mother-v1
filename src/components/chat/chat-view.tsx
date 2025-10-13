'use client';
import { useState, useRef, useEffect, useTransition } from 'react';
import type { Chat, Message } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import AiChatHandler from "./ai-chat-handler";
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, ArrowDown } from 'lucide-react';
import { currentUser, aiUser } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { aiAssistantAnswersQuestions } from '@/ai/flows/ai-assistant-answers-questions';
import { useToast } from '@/hooks/use-toast';


type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat: initialChat, setActiveChat }: ChatViewProps) {
  const [chat, setChat] = useState(initialChat);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAiReplying, startAiTransition] = useTransition();
  const { toast } = useToast();


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
  }, []);

   useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isScrolledUp = scrollContainer.scrollHeight - scrollContainer.clientHeight > scrollContainer.scrollTop + 150;
      
      if (!isScrolledUp) {
        scrollToBottom('smooth');
      } else {
        setShowScrollButton(true);
      }
    }
  }, [chat.messages, isAiReplying]);

  const handleNewMessage = (newMessage: Message) => {
    setChat(prevChat => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage]
    }));
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setChat(prevChat => ({
      ...prevChat,
      messages: prevChat.messages.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
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

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string }) => {
    e.preventDefault();
    if (!input.trim() && !image && !options?.voiceUrl) return;
    
    const sentInput = input;
    const currentReplyTo = replyTo;
    const currentChatHistory = chat.messages;

    const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: input,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: currentUser,
        imageUrl: image ? URL.createObjectURL(image) : undefined,
        voiceUrl: options?.voiceUrl,
        replyTo: currentReplyTo ?? undefined,
    };

    handleNewMessage(newMessage);
    
    setInput('');
    setImage(null);
    setReplyTo(null);
    
    const shouldTriggerAi = chat.type === 'group' && (
        sentInput.toLowerCase().includes('@afuai') || 
        (currentReplyTo && currentReplyTo.sender.id === aiUser.id)
    );

    if (shouldTriggerAi) {
        startAiTransition(async () => {
            try {
                const aiInput: any = { 
                  question: sentInput,
                  chatHistory: currentChatHistory.slice(-15).map(m => ({ sender: m.sender.name, text: m.text || 'Voice Message' })),
                };

                if (currentReplyTo) {
                  aiInput.repliedToMessage = {
                    sender: currentReplyTo.sender.name,
                    text: currentReplyTo.text,
                  };
                }

                const result = await aiAssistantAnswersQuestions(aiInput);
                const error = (result as any).error;
                if (error) {
                   throw new Error(error || 'The AI assistant returned an error.');
                }
        
                if (result.answer) {
                    const aiMessage: Message = {
                      id: `ai_${Date.now()}`,
                      text: result.answer,
                      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      sender: aiUser,
                    };
                    handleNewMessage(aiMessage);
                } else {
                    throw new Error('The AI assistant returned an empty response.');
                }
            } catch (error: any) {
                console.error('AI Assistant Error:', error.message || error);
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: error.message || 'Failed to get a response from the AI assistant.',
                });
                const errorMessage: Message = {
                    id: `err_${Date.now()}`,
                    text: 'Sorry, I encountered an error. Please try again.',
                    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: aiUser,
                };
                handleNewMessage(errorMessage);
            }
        });
    }
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
            <AiChatHandler chat={chat} handleNewMessage={handleNewMessage} updateMessage={updateMessage} />
        </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background relative">
      {commonHeader}
      <div className="flex-1 overflow-y-auto pb-36" ref={scrollRef}>
        <ChatMessages messages={chat.messages} onReply={handleReply} />
        {isAiReplying && (
          <div className="p-4 md:p-6">
            <div className="flex items-end gap-2 justify-start">
              <ChatAvatar chat={{...chat, name: aiUser.name, avatarUrl: aiUser.avatarUrl}} />
              <div className="relative max-w-lg rounded-xl p-2 px-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-none">
                 <div className="flex items-center space-x-2 p-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
       {showScrollButton && (
            <div className="absolute bottom-24 right-4 z-20">
                <Button onClick={() => scrollToBottom()} size="icon" className="rounded-full shadow-lg">
                    <ArrowDown className="h-5 w-5" />
                </Button>
            </div>
        )}
      <ChatInput 
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isAiReplying}
        handleImageChange={handleImageChange}
        imagePreview={image ? URL.createObjectURL(image) : null}
        removeImage={() => setImage(null)}
        replyTo={replyTo}
        cancelReply={cancelReply}
      />
    </div>
  );
}
