'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import { AppContext } from '@/lib/context';
import { chats } from '@/lib/data';

export default function AiChatPage() {
    const context = useContext(AppContext);
    
    if (!context) {
        return <p>Loading chat context...</p>;
    }
    
    const { activeChat, setActiveChat } = context;
    const aiChat = chats.find(c => c.type === 'ai');

    if (!aiChat) {
        return <p>AI Chat not configured.</p>;
    }

    // Since this page is dedicated to the AI chat, we can render it directly
    // The activeChat state is managed in the layout
    return (
        <main className="flex h-full flex-col overflow-hidden">
            {activeChat && activeChat.type === 'ai' ? (
                <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
            ) : (
                <p>Loading AI Chat...</p>
            )}
        </main>
    );
}
