'use client';
import { useState, useTransition, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import ChatMessages from './chat-messages';
import AiChatInput from './ai-chat-input';
import { aiAssistantAnswersQuestions } from '@/ai/flows/ai-assistant-answers-questions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { aiUser } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


// Helper to convert file or blob to base64
const toBase64 = (file: File | Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

export default function AiChatHandler() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user, firestore } = useFirebase();

  const messagesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Corrected path: users/{uid}/aiChats/{chatId}/messages
    // Using 'default' as a consistent document ID for the single AI chat history.
    return collection(firestore, 'users', user.uid, 'aiChats', 'default', 'messages');
  }, [firestore, user]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy('timestamp', 'asc'));
  }, [messagesRef]);

  const { data: messages } = useCollection<Message>(messagesQuery);
  const aiChat = { messages: messages || [] };

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
  }, [aiChat.messages, isPending]);


  const handleSubmit = async (text: string, options?: { voiceUrl?: string, selectedModel?: string, imageFile?: File | null }) => {
    if (!text.trim() && !options?.imageFile && !options?.voiceUrl) return;

    if (!user || !messagesRef) {
        toast({ variant: 'destructive', title: 'Not signed in', description: 'You must be signed in to chat with the AI.'});
        return;
    }

    const selectedModel = options?.selectedModel || 'afuai-fast';
    
    if (options?.voiceUrl && selectedModel === 'afuai-fast') {
        const upgradeMessage: Omit<Message, 'id'> = {
            text: "It looks like you're trying to send a voice message. To have the AI analyze audio, please upgrade to AfuAi Advanced.",
            senderId: aiUser.id,
            // @ts-ignore
            timestamp: serverTimestamp(),
        };
        addDocumentNonBlocking(messagesRef, upgradeMessage);
        return; 
    }

    const userMessage: Omit<Message, 'id'> = {
      text: text || "This is a voice message. Please respond to it.",
      senderId: user.uid,
      imageUrl: options?.imageFile ? URL.createObjectURL(options.imageFile) : undefined,
      voiceUrl: options?.voiceUrl,
      // @ts-ignore
      timestamp: serverTimestamp(),
    };
    addDocumentNonBlocking(messagesRef, userMessage);

    startTransition(async () => {
      try {
        const promptParts: any[] = [];
        const currentChatHistory = aiChat.messages.slice(-15);
        
        let promptText = `Chat History:\n${currentChatHistory.map(m => `${m.senderId === user.uid ? 'User' : 'AI'}: ${m.text}`).join('\n')}\n\nUser: ${text}`;
        
        promptParts.push({ text: promptText });
        
        if (options?.imageFile) {
            const photoDataUri = await toBase64(options.imageFile);
            promptParts.push({ media: { url: photoDataUri } });
        }

        if (options?.voiceUrl && selectedModel === 'afuai-advanced') {
            const audioBlob = await fetch(options.voiceUrl).then(res => res.blob());
            const audioDataUri = await toBase64(audioBlob);
            promptParts.push({ media: { url: audioDataUri } });
        }

        const aiInput = { prompt: promptParts };
        const result = await aiAssistantAnswersQuestions(aiInput);
        
        const error = (result as any).error;
        if (error) {
           throw new Error(error || 'The AI assistant returned an error.');
        }

        if (result.answer) {
            const aiMessage: Omit<Message, 'id'> = {
              text: result.answer,
              senderId: aiUser.id,
              // @ts-ignore
              timestamp: serverTimestamp(),
            };
            addDocumentNonBlocking(messagesRef, aiMessage);
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

        const errorMessage: Omit<Message, 'id'> = {
            text: text,
            senderId: aiUser.id,
            // @ts-ignore
            timestamp: serverTimestamp(),
        };
        addDocumentNonBlocking(messagesRef, errorMessage);
      }
    });
  };
  
  return (
    <div className='h-full flex flex-col'>
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="relative p-4">
            <ChatMessages messages={aiChat.messages} onReply={() => {}} />
            {isPending && (
            <div className="flex items-end gap-2 justify-start mt-4">
                <ChatAvatar senderId={aiUser.id} />
                <div className="relative max-w-lg rounded-xl p-2 px-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-none">
                    <div className="flex items-center space-x-2 p-2">
                        <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
                        <Skeleton className="h-2 w-2 rounded-full animate-pulse delay-75" />
                        <Skeleton className="h-2 w-2 rounded-full animate-pulse delay-150" />
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
    </div>
  );
}
