'use client';
import { useState } from 'react';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { chats } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, PenSquare, Video, Camera, Waves } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ChatAvatar from '@/components/chat/chat-avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GrokLogo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import AiChatInput from '@/components/chat/ai-chat-input';


export default function AiChatPage() {
    const router = useRouter();
    const initialAiChat = chats.find(c => c.type === 'ai');
    
    const [chat, setChat] = useState<Chat | undefined>(initialAiChat);
    const [input, setInput] = useState('');

    if (!chat) {
        return <p>Loading AI Chat...</p>;
    }

    const handleNewMessage = (newMessage: Message) => {
        setChat(prevChat => {
            if (!prevChat) return undefined;
            // When user sends first message, remove the empty state logo
            const newMessages = prevChat.messages[0]?.sender.id === 'ai' && prevChat.messages.length === 1 && prevChat.messages[0].text.startsWith('Hello!')
                ? [newMessage]
                : [...prevChat.messages, newMessage];

            return {
                ...prevChat,
                messages: newMessages
            };
        });
    };

    const updateMessage = (messageId: string, updates: Partial<Message>) => {
        setChat(prevChat => {
            if (!prevChat) return undefined;
            return {
                ...prevChat,
                messages: prevChat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                )
            };
        });
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // This is a placeholder for the real submit logic which is in AiChatHandler
    }

    const isConversationStarted = !(chat.messages.length === 1 && chat.messages[0].sender.id === 'ai');

    return (
        <main className="flex h-full flex-col overflow-hidden bg-background">
             <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
                <Button variant="ghost" size="icon">
                    <Menu />
                </Button>
                <Tabs defaultValue="ask" className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ask">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Ask
                        </TabsTrigger>
                        <TabsTrigger value="imagine">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                            Imagine
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-600">FREE</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon">
                    <PenSquare />
                </Button>
            </header>
            
            <div className="flex-1 overflow-y-auto">
                {!isConversationStarted && (
                     <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <GrokLogo className="w-20 h-20 text-muted-foreground/50 mb-12" />
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                            <Button variant="secondary" className="h-auto flex-col gap-2 p-3">
                                <Video className="h-6 w-6"/>
                                <span className="text-xs">Create Videos</span>
                            </Button>
                             <Button variant="secondary" className="h-auto flex-col gap-2 p-3">
                                <Camera className="h-6 w-6"/>
                                <span className="text-xs">Open Camera</span>
                            </Button>
                             <Button variant="secondary" className="h-auto flex-col gap-2 p-3">
                                <Waves className="h-6 w-6"/>
                                <span className="text-xs">Voice Mode</span>
                            </Button>
                        </div>
                    </div>
                )}
                <AiChatHandler chat={chat} handleNewMessage={handleNewMessage} updateMessage={updateMessage} hideInput={true} />
            </div>

            <div className="shrink-0 p-2 border-t">
                 <AiChatInput />
            </div>
        </main>
    );
}
