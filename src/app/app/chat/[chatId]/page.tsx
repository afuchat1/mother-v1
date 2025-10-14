'use client';
import { useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatView from '@/components/chat/chat-view';
import { AppContext } from '@/lib/context.tsx';

export default function ChatPage() {
    const context = useContext(AppContext);
    const params = useParams();
    const router = useRouter();

    if (!context) {
        return <p>Loading chat context...</p>;
    }

    const { chats, activeChat, setActiveChat } = context;
    const { chatId } = params;

    const currentChat = chats.find(c => c.id === chatId);

    // If the active chat from context doesn't match the URL, something is wrong.
    // Or if the chat doesn't exist, redirect back.
    if (!currentChat) {
        // Redirect to the main chat page if the chat is not found.
        router.replace('/app/chat');
        return <p>Chat not found. Redirecting...</p>;
    }
    
    // Ensure the active chat in context matches the one from the URL
    if (!activeChat || activeChat.id !== currentChat.id) {
        setActiveChat(currentChat);
    }
    
    return (
        <main className="flex h-full flex-col overflow-hidden">
            {activeChat && <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />}
        </main>
    )
}
