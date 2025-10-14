'use client';
import { useState, useTransition, useRef, useEffect } from 'react';
import type { Chat, Message } from '@/lib/types';
import { aiUser, currentUser } from '@/lib/data';
import ChatAvatar from './chat-avatar';
import ChatMessages from './chat-messages';
import AiChatInput from './ai-chat-input';
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

type AiChatHandlerProps = {
    chat: Chat;
    handleNewMessage: (message: Message) => void;
    updateMessage: (messageId: string, updates: Partial<Message>) => void;
    imageToSend?: File | null;
    clearImageToSend?: () => void;
};

export default function AiChatHandler({ chat, handleNewMessage, updateMessage, imageToSend, clearImageToSend }: AiChatHandlerProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: behavior,
        });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

   useEffect(() => {
    scrollToBottom('smooth');
  }, [chat.messages, isPending]);


  const handleSubmit = async (text: string, options?: { voiceUrl?: string, selectedModel?: string }) => {
    if (!text.trim() && !imageToSend && !options?.voiceUrl) return;

    let userQuestion = text;
    const userMessageId = `user_${Date.now()}`;
    const currentImageToSend = imageToSend;
    const selectedModel = options?.selectedModel || 'afuai-fast';
    
    // Use a callback with setChat to get the most up-to-date history
    const currentChatHistory = chat.messages;

    if (clearImageToSend) {
        clearImageToSend();
    }

    const userMessage: Message = {
      id: userMessageId,
      text: text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: currentUser,
      imageUrl: currentImageToSend ? URL.createObjectURL(currentImageToSend) : undefined,
      voiceUrl: options?.voiceUrl,
    };

    handleNewMessage(userMessage);
    
    if (options?.voiceUrl && selectedModel === 'afuai-fast') {
        updateMessage(userMessageId, { text: "Voice message" });
        const upgradeMessage: Message = {
            id: `ai_upgrade_${Date.now()}`,
            text: "It looks like you're trying to send a voice message. To have the AI analyze audio, please upgrade to AfuAi Advanced.",
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: aiUser,
        };
        handleNewMessage(upgradeMessage);
        return; // Stop further processing
    }

    startTransition(async () => {
      try {
        const photoDataUri = currentImageToSend ? await toBase64(currentImageToSend) : undefined;
        let audioDataUri: string | undefined = undefined;

        if (options?.voiceUrl && selectedModel === 'afuai-advanced') {
            const audioBlob = await fetch(options.voiceUrl).then(res => res.blob());
            audioDataUri = await toBase64(audioBlob);
             if (!userQuestion) {
                userQuestion = "This is a voice message. Please respond to it.";
                updateMessage(userMessageId, { text: "Voice message" });
            }
        }

        const aiInput: any = { 
            question: userQuestion, 
            photoDataUri,
            audioDataUri,
            chatHistory: currentChatHistory.slice(-15).map(m => ({ sender: m.sender.name, text: m.text || 'Voice Message' })),
        };
        
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
        let title = 'Error';
        let description = error.message || 'Failed to get a response from the AI assistant.';
        let text = 'Sorry, I encountered an error. Please try again.';

        if (error.message && error.message.includes('billed users')) {
            title = 'Billing Required';
            description = 'This AI feature is only accessible to billed users at this time.';
            text = 'Sorry, this feature requires a billing-enabled account.';
        } else if (error.message && error.message.includes('429')) {
            title = 'API Quota Exceeded';
            description = 'You have exceeded your free tier limit for the AI model.';
            text = 'Sorry, I cannot respond right now due to high usage. Please try again later.';
        }

        toast({
          variant: 'destructive',
          title: title,
          description: description,
        });

        const errorMessage: Message = {
            id: `err_${Date.now()}`,
            text: text,
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
        <div className="relative p-4">
            <ChatMessages messages={chat.messages} onReply={() => {}} />
            {isPending && (
            <div className="flex items-end gap-2 justify-start mt-4">
                <ChatAvatar chat={{...chat, name: aiUser.name, avatarUrl: aiUser.avatarUrl}} />
                <div className="relative max-w-lg rounded-xl p-2 px-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-none">
                    <div className="flex items-center space-x-2 p-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                    </div>
                </div>
            </div>
            )}
        </div>
      </div>
      <div className="shrink-0 p-2 border-t">
        <AiChatInput
            handleSubmit={handleSubmit}
            isLoading={isPending}
        />
      </div>
    </>
  );
}
