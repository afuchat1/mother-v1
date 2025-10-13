'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context';
import { chats as allChats } from '@/lib/data';

export default function ChatPage() {
    const context = useContext(AppContext);

    if (!context) {
        return <p>Error: Chat context not found.</p>;
    }

    const { activeChat, setActiveChat } = context;

    return (
        <main className="flex flex-1 flex-col overflow-hidden">
            {activeChat ? (
                <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
            ) : (
                <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
            )}
        </main>
    )
}
