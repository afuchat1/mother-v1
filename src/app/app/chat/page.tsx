'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context';
import { chats as allChats } from '@/lib/data';
import { cn } from '@/lib/utils';

export default function ChatPage() {
    const context = useContext(AppContext);

    if (!context) {
        // This can be a loading state or an error message
        return <p>Loading chat context...</p>;
    }

    const { activeChat, setActiveChat } = context;

    return (
        <main className="flex h-screen md:h-full flex-col overflow-hidden">
             <div className="md:hidden flex-1">
                {activeChat ? (
                    <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
                ) : (
                    <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
                )}
             </div>
             <div className="hidden md:grid md:grid-cols-[300px_1fr] h-full">
                <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
                <div className="border-l">
                    {activeChat ? (
                        <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
                    ) : (
                        <div className="flex flex-col h-full items-center justify-center bg-secondary">
                            <p className="text-muted-foreground">Select a chat to start messaging</p>
                        </div>
                    )}
                </div>
             </div>
        </main>
    )
}
