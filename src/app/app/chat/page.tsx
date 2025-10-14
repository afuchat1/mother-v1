'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import ChatView from '@/components/chat/chat-view';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context.tsx';
import type { Chat } from '@/lib/types';

export default function ChatPage() {
    const context = useContext(AppContext);
    const router = useRouter();

    if (!context) {
        return <p>Loading chat context...</p>;
    }

    const { chats, activeChat, setActiveChat } = context;
    
    // On mobile, if no chat is active, show the list.
    // If a chat is active, show the chat view.
    const showChatList = !activeChat;

    const handleSelectChat = (chat: Chat) => {
        setActiveChat(chat);
        // Navigate to a dynamic route for the chat
        router.push(`/app/chat/${chat.id}`);
    }

    return (
        <main className="flex h-full flex-col overflow-hidden">
            {showChatList ? (
                <ChatList chats={chats} activeChat={activeChat} setActiveChat={handleSelectChat} />
            ) : (
                activeChat && <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
            )}
        </main>
    )
}
