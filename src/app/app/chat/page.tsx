'use client';
import { useContext, useEffect } from 'react';
import ChatView from '@/components/chat/chat-view';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context';
import { chats as allChats } from '@/lib/data';
import { usePathname } from 'next/navigation';

export default function ChatPage() {
    const context = useContext(AppContext);
    const pathname = usePathname();

    if (!context) {
        return <p>Loading chat context...</p>;
    }

    const { activeChat, setActiveChat } = context;
    
    // On mobile, if no chat is active, show the list.
    // If a chat is active, show the chat view.
    const showChatListOnMobile = !activeChat;

    return (
        <main className="flex h-full flex-col overflow-hidden">
            {showChatListOnMobile ? (
                <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
            ) : (
                activeChat && <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
            )}
        </main>
    )
}
