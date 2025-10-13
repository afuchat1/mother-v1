'use client';
import { useState, useTransition } from 'react';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { chats } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Menu, PenSquare, MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AiChatInput from '@/components/chat/ai-chat-input';

export default function AiChatPage() {
    const initialAiChat = chats.find(c => c.type === 'ai');
    
    // Create a version of the initial chat with no messages for a clean start
    const blankAiChat = initialAiChat ? { ...initialAiChat, messages: [] } : undefined;

    const [chat, setChat] = useState<Chat | undefined>(blankAiChat);
    const [imageToSend, setImageToSend] = useState<File | null>(null);
    const [showCamera, setShowCamera] = useState(false);

    if (!chat) {
        return <p>Loading AI Chat...</p>;
    }

    const handleNewMessage = (newMessage: Message) => {
        setChat(prevChat => {
            if (!prevChat) return undefined;
            // The AI now gets context from the handler, so we just add the new message
            return {
                ...prevChat,
                messages: [...prevChat.messages, newMessage]
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
    
    return (
        <main className="flex h-full flex-col overflow-hidden bg-background">
             <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
                <Button variant="ghost" size="icon">
                    <Menu />
                </Button>
                <Tabs defaultValue="ask" className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ask">
                            <MessageSquare className="mr-2 h-5 w-5" />
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
            
            <AiChatHandler 
                chat={chat} 
                handleNewMessage={handleNewMessage} 
                updateMessage={updateMessage}
                imageToSend={imageToSend}
                clearImageToSend={() => setImageToSend(null)}
            />
        </main>
    );
}
