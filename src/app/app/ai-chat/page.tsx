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
             <header className="flex shrink-0 items-center justify-center p-4">
                <h2 className="text-xl font-bold font-headline">AfuAi</h2>
            </header>
            <AiChatHandler chat={chat} handleNewMessage={handleNewMessage} updateMessage={updateMessage} />
        </main>
    );
}
