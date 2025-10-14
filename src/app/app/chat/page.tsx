'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import ChatView from '@/components/chat/chat-view';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context.tsx';
import type { Chat } from '@/lib/types';
import { useUser } from '@/firebase';

export default function ChatPage() {
    const context = useContext(AppContext);
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    if (!context) {
        return <p>Loading chat context...</p>;
    }
     if (isUserLoading) {
        return <p>Loading user...</p>;
    }

    const { activeChat, setActiveChat } = context;
    
    const showChatList = !activeChat;

    const handleSelectChat = (chat: Chat) => {
        if (!user) return;
        setActiveChat(chat);
        router.push(`/app/chat/${chat.id}`);
    }

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {showChatList ? (
                <>
                    <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-4 sticky top-0 z-10">
                        <h1 className="text-2xl font-bold font-headline">Chats</h1>
                    </header>
                    <ChatList activeChat={activeChat} setActiveChat={handleSelectChat} />
                </>
            ) : (
                activeChat && <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
            )}
        </div>
    )
}
