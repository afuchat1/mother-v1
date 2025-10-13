'use client';
import { useState } from 'react';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { chats } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ChatAvatar from '@/components/chat/chat-avatar';

export default function AiChatPage() {
    const router = useRouter();
    const initialAiChat = chats.find(c => c.type === 'ai');
    
    const [chat, setChat] = useState<Chat | undefined>(initialAiChat);

    if (!chat) {
        return <p>Loading AI Chat...</p>;
    }

    const handleNewMessage = (newMessage: Message) => {
        setChat(prevChat => {
            if (!prevChat) return undefined;
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
        <main className="flex h-full flex-col overflow-hidden">
             <header className="flex shrink-0 items-center gap-2 border-b bg-background p-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <ChatAvatar chat={chat} />
                <div className="flex-1">
                <h2 className="font-semibold font-headline text-base">{chat.name}</h2>
                </div>
            </header>
            <AiChatHandler chat={chat} handleNewMessage={handleNewMessage} updateMessage={updateMessage} />
        </main>
    );
}
