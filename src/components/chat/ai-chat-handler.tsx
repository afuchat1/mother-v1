'use client';
import { useState, useTransition, useRef, useEffect } from 'react';
import type { Chat, Message } from '@/lib/types';
import { aiUser, currentUser } from '@/lib/data';
import ChatAvatar from './chat-avatar';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import { aiAssistantAnswersQuestions } from '@/ai/flows/ai-assistant-answers-questions';
import { speechToText } from '@/ai/flows/speech-to-text';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

// Helper to convert file or blob to base64
const toBase64 = (file: File | Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export default function AiChatHandler({ chat, handleNewMessage }: { chat: Chat, handleNewMessage: (message: Message) => void }) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages, isPending]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string }) => {
    e.preventDefault();
    if (!input.trim() && !image && !options?.voiceUrl) return;

    let userQuestion = input;
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: input,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser,
      imageUrl: image ? URL.createObjectURL(image) : undefined,
      voiceUrl: options?.voiceUrl,
    };

    handleNewMessage(userMessage);
    setInput('');
    const sentImage = image;
    setImage(null);

    startTransition(async () => {
      try {
        if (options?.voiceUrl) {
            const audioBlob = await fetch(options.voiceUrl).then(res => res.blob());
            const audioDataUri = await toBase64(audioBlob);
            const transcriptionResult = await speechToText(audioDataUri);

            if (transcriptionResult && transcriptionResult.text) {
                userQuestion = transcriptionResult.text;
                // Optionally update the message with the transcribed text
                 const transcribedMessage: Message = {
                    ...userMessage,
                    text: `🎤 Voice note: "${userQuestion}"`
                };
                // This will replace the original voice message placeholder
                // setMessages(prev => prev.map(m => m.id === userMessage.id ? transcribedMessage : m));
            } else {
                 throw new Error("Failed to transcribe audio.");
            }
        }

        const photoDataUri = sentImage ? await toBase64(sentImage) : undefined;
        const result = await aiAssistantAnswersQuestions({ question: userQuestion, photoDataUri });
        
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
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <ChatMessages messages={chat.messages} />
        {isPending && (
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
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isPending}
        handleImageChange={handleImageChange}
        imagePreview={image ? URL.createObjectURL(image) : null}
        removeImage={() => setImage(null)}
      />
    </div>
  );
}
