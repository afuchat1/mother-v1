'use client';
import { useContext, useEffect } from 'react';
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

    useEffect(() => {
        // If the chat doesn't exist, redirect back.
        if (!currentChat) {
            router.replace('/app/chat');
            return;
        }

        // Ensure the active chat in context matches the one from the URL
        if (!activeChat || activeChat.id !== currentChat.id) {
            setActiveChat(currentChat);
        }
    }, [currentChat, activeChat, router, setActiveChat]);


    if (!currentChat) {
        return <p>Chat not found. Redirecting...</p>;
    }
    
    return (
        <main className="flex h-full flex-col overflow-hidden">
            {activeChat && activeChat.id === chatId && <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />}
        </main>
    )
}
