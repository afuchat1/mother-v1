'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import { AppContext } from '@/lib/context.tsx';
import { chats } from '@/lib/data';

export default function AiChatPage() {
    const context = useContext(AppContext);

    const aiChat = chats.find(c => c.type === 'ai');

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
