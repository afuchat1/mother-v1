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
import { Button } from '../ui/button';
import { ArrowDown } from 'lucide-react';

// Helper to convert file or blob to base64
const toBase64 = (file: File | Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export default function AiChatHandler({ chat, handleNewMessage, updateMessage }: { chat: Chat, handleNewMessage: (message: Message) => void, updateMessage: (messageId: string, updates: Partial<Message>) => void }) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
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
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Auto-scroll on initial load
    scrollToBottom('auto');

    const handleScroll = () => {
        if (scrollContainer) {
            const isAtBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + 1;
            setShowScrollButton(!isAtBottom);
        }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

   useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      // A generous threshold to decide if the user has scrolled up
      const isScrolledUp = scrollContainer.scrollHeight - scrollContainer.clientHeight > scrollContainer.scrollTop + 150;
      
      if (!isScrolledUp) {
        scrollToBottom('smooth');
      } else {
        setShowScrollButton(true);
      }
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

  const handleImageFile = (file: File) => {
    setImage(file);
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string }) => {
    e.preventDefault();
    if (!input.trim() && !image && !options?.voiceUrl) return;

    let userQuestion = input;
    const currentReplyTo = replyTo;
    const userMessageId = `user_${Date.now()}`;

    const userMessage: Message = {
      id: userMessageId,
      text: input,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser,
      imageUrl: image ? URL.createObjectURL(image) : undefined,
      voiceUrl: options?.voiceUrl,
      replyTo: currentReplyTo ?? undefined,
    };

    handleNewMessage(userMessage);
    setInput('');
    setImage(null);
    setReplyTo(null);
    const sentImage = image;

    startTransition(async () => {
      try {
        if (options?.voiceUrl) {
            const audioBlob = await fetch(options.voiceUrl).then(res => res.blob());
            const audioDataUri = await toBase64(audioBlob);
            const transcriptionResult = await speechToText(audioDataUri);

            if (transcriptionResult && transcriptionResult.text) {
                userQuestion = transcriptionResult.text;
                // Update the original message with the transcribed text
                updateMessage(userMessageId, { text: transcriptionResult.text });
            } else {
                 throw new Error("Failed to transcribe audio.");
            }
        }

        const photoDataUri = sentImage ? await toBase64(sentImage) : undefined;
        
        const aiInput: any = { question: userQuestion, photoDataUri };
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
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="relative">
            <ChatMessages messages={chat.messages} onReply={handleReply} />
            {isPending && (
            <div className="p-4">
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
      </div>
      {showScrollButton && (
        <div className="absolute bottom-24 right-4 z-20">
            <Button onClick={() => scrollToBottom()} size="icon" className="rounded-full shadow-lg">
                <ArrowDown className="h-5 w-5" />
            </Button>
        </div>
        )}
      <div className="shrink-0">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isPending}
          handleImageChange={handleImageChange}
          handleImageFile={handleImageFile}
          imagePreview={image ? URL.createObjectURL(image) : null}
          removeImage={() => setImage(null)}
          replyTo={replyTo}
          cancelReply={cancelReply}
        />
      </div>
    </>
  );
}
