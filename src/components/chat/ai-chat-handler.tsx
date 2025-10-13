'use client';
import { useState, useTransition, useRef, useEffect } from 'react';
import type { Chat, Message } from '@/lib/types';
import { aiUser, currentUser } from '@/lib/data';
import ChatAvatar from './chat-avatar';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { aiAssistantAnswersQuestions } from '@/ai/flows/ai-assistant-answers-questions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export default function AiChatHandler({ chat }: { chat: Chat }) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollref.current.scrollHeight;
    }
  }, [messages, isPending]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: input,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      try {
        const result = await aiAssistantAnswersQuestions({ question: input });
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          text: result.answer,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: aiUser,
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('AI Assistant Error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to get a response from the AI assistant.',
        });
        const errorMessage: Message = {
            id: `err_${Date.now()}`,
            text: 'Sorry, I encountered an error. Please try again.',
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: aiUser,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <ChatMessages messages={messages} />
        {isPending && (
          <div className="p-4 md:p-6">
            <div className="flex items-end gap-2 justify-start">
              <ChatAvatar chat={{...chat, name: aiUser.name, avatarUrl: aiUser.avatarUrl}} />
              <div className="max-w-xs rounded-lg p-3 text-sm md:max-w-md bg-secondary shadow-sm">
                 <div className="flex items-center space-x-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isPending}
      />
    </div>
  );
}
