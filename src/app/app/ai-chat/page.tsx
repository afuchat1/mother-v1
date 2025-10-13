'use client';
import { useContext, useEffect, useState } from 'react';
import ChatView from '@/components/chat/chat-view';
import { AppContext } from '@/lib/context';
import { chats } from '@/lib/data';
import type { Chat } from '@/lib/types';

export default function AiChatPage() {
    const context = useContext(AppContext);
    const [aiChat, setAiChat] = useState<Chat | null>(null);

    useEffect(() => {
        const foundChat = chats.find(c => c.type === 'ai');
        if (foundChat) {
            setAiChat(foundChat);
        }
    }, []);

    if (!context) {
        return <p>Loading chat context...</p>;
    }
    
    const { setActiveChat } = context;

    if (!aiChat) {
        return <p>Loading AI Chat...</p>;
    }

    return (
        <main className="flex h-full flex-col overflow-hidden">
            <ChatView key={aiChat.id} chat={aiChat} setActiveChat={setActiveChat} />
        </main>
    );
}
