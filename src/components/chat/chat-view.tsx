'use client';
import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Chat, Message, UserProfile } from "@/lib/types";
import { ChatAvatar } from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, ArrowDown } from 'lucide-react';
import { aiUser } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { aiAssistantAnswersQuestions } from '@/ai/flows/ai-assistant-answers-questions';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useDoc } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useMemoFirebase } from '@/firebase/provider';


type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat: initialChat, setActiveChat }: ChatViewProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  if (!currentUser) {
    return <p>Loading...</p>
  }
  
  const chatRef = doc(firestore, `users/${currentUser.uid}/chats`, initialChat.id);
  const { data: chatData } = useDoc<Chat>(chatRef);

  const messagesRef = collection(chatRef, 'messages');
  const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));

  const { data: messages, isLoading: messagesLoading } = useCollection<Message>(messagesQuery);
  const chat = { ...initialChat, ...chatData, messages: messages || [] };

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
    scrollToBottom('auto');
  }, [chat.id]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

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
      const isScrolledUp = scrollContainer.scrollHeight - scrollContainer.clientHeight > scrollContainer.scrollTop + 150;
      
      if (!isScrolledUp) {
        scrollToBottom('smooth');
      } else {
        setShowScrollButton(true);
      }
    }
  }, [chat.messages, isAiReplying]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string, videoUrl?: string }) => {
    e.preventDefault();
    if (!input.trim() && !image && !options?.voiceUrl && !options?.videoUrl) return;
    
    const sentInput = input;
    const currentReplyTo = replyTo;
    const currentChatHistory = chat.messages;
    const timestamp = serverTimestamp();

    const newMessagePayload: Omit<Message, 'id'> = {
        text: input,
        senderId: currentUser.uid,
        imageUrl: image ? URL.createObjectURL(image) : undefined,
        voiceUrl: options?.voiceUrl,
        videoUrl: options?.videoUrl,
        replyTo: currentReplyTo ?? undefined,
        // @ts-ignore
        timestamp: timestamp,
    };
    
    addDocumentNonBlocking(messagesRef, newMessagePayload);

     await setDoc(chatRef, { lastMessage: newMessagePayload }, { merge: true });
    
    setInput('');
    setImage(null);
    setReplyTo(null);
    
    const shouldTriggerAi = chat.type === 'group' && (
        sentInput.toLowerCase().includes('@afuai') || 
        (currentReplyTo && currentReplyTo.senderId === aiUser.id)
    );

    if (shouldTriggerAi) {
        startAiTransition(async () => {
            try {
                const aiInput: any = { 
                  prompt: [ { text: `Chat History:\n${currentChatHistory.slice(-15).map(m => `${m.senderId === currentUser.uid ? 'User' : 'AI'}: ${m.text || (m.voiceUrl ? 'Voice Message' : 'Image')}`).join('\n')}\n\nUser: ${sentInput}` }]
                };

                const result = await aiAssistantAnswersQuestions(aiInput);
                const error = (result as any).error;
                if (error) {
                   throw new Error(error || 'The AI assistant returned an error.');
                }
        
                if (result.answer) {
                    const aiMessagePayload = {
                      text: result.answer,
                      senderId: aiUser.id,
                      timestamp: serverTimestamp(),
                    };
                    addDocumentNonBlocking(messagesRef, aiMessagePayload);
                } else {
                    throw new Error('The AI assistant returned an empty response.');
                }
            } catch (error: any) {
                let title = 'Error';
                let description = error.message || 'Failed to get a response from the AI assistant.';
                let text = 'Sorry, I encountered an error. Please try again.';

                if (error.message && error.message.includes('429')) {
                    title = 'API Quota Exceeded';
                    description = 'You have exceeded your free tier limit for the AI model.';
                    text = 'Sorry, I cannot respond right now due to high usage. Please try again later.';
                }

                toast({
                  variant: 'destructive',
                  title: title,
                  description: description,
                });
                const errorMessagePayload = {
                    text: text,
                    senderId: aiUser.id,
                    timestamp: serverTimestamp(),
                };
                addDocumentNonBlocking(messagesRef, errorMessagePayload);
            }
        });
    }
  };
  
  const handleBack = () => {
      setActiveChat(null);
      router.push('/app/chat');
  }
  
  const otherParticipantId = chat.participantIds?.find(id => id !== currentUser.uid);
  const otherUserRef = useMemoFirebase(() => {
    if(chat.type !== 'dm' || !otherParticipantId) return null;
    return doc(firestore, 'users', otherParticipantId);
  }, [firestore, chat.type, otherParticipantId]);

  const { data: otherUser } = useDoc<UserProfile>(otherUserRef);

  const header = (
    <header className="flex shrink-0 items-center gap-3 border-b bg-background p-3">
        <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft />
        </Button>
        <div className="relative shrink-0">
            <ChatAvatar chat={chat} senderId={chat.type === 'dm' ? otherParticipantId : undefined} />
            {chat.type === 'dm' && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold font-headline text-base truncate">
              {chat.type === 'dm' ? (otherUser?.name || 'Loading...') : chat.name}
            </h2>
            {chat.type === 'ai' && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600 dark:text-blue-400">AI</span>
              </div>
            )}
          </div>
          {chat.type !== 'ai' && (
            <p className="text-sm text-muted-foreground truncate">
                {chat.type === 'dm' 
                  ? 'Active now' 
                  : `${chat.participantIds?.length || 0} member${(chat.participantIds?.length || 0) !== 1 ? 's' : ''}`
                }
            </p>
          )}
          {chat.type === 'ai' && (
            <p className="text-xs text-muted-foreground">Your AI assistant is ready to help</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          <MoreVertical />
        </Button>
      </header>
  );

  const renderContent = () => {
    if (messagesLoading) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      )
    }

    if (!chat.messages || chat.messages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <span className="text-2xl">💬</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Start the conversation</h3>
              <p className="text-sm text-muted-foreground">
                {chat.type === 'dm' 
                  ? `Say hello to ${otherUser?.name || 'your contact'}!` 
                  : chat.type === 'ai'
                  ? 'Ask me anything! I\'m here to help.'
                  : 'Be the first to share something with the group.'
                }
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto bg-muted/30" ref={scrollRef}>
                <div className="relative">
                    <ChatMessages messages={chat.messages} onReply={handleReply} />
                    {isAiReplying && (
                        <div className="p-4">
                            <div className="flex items-end gap-2 justify-start">
                            <ChatAvatar senderId={aiUser.id} />
                            <div className="relative max-w-lg rounded-xl p-3 shadow-sm bg-secondary text-secondary-foreground rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
                                    </div>
                                    <span className="text-xs text-muted-foreground">AI is thinking...</span>
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
                    isLoading={isAiReplying}
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
  };

  return (
    <>
        {header}
        {renderContent()}
    </>
  );
}
