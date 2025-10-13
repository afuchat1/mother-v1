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

    useEffect(() => {
        // This logic now correctly differentiates between the user's intent
        // for AI chat versus regular chat.
        const aiChat = allChats.find(c => c.type === 'ai');
        const firstRegularChat = allChats.find(c => c.type !== 'ai');

        if (pathname === '/app/ai-chat' || (activeChat?.type === 'ai' && pathname.startsWith('/app/chat'))) {
            if (aiChat && activeChat?.id !== aiChat.id) {
                setActiveChat(aiChat);
            }
        } else if (pathname.startsWith('/app/chat')) {
            // If we are on the main chat page, and an AI chat is active,
            // switch to the first regular chat.
            if (activeChat?.type === 'ai') {
                setActiveChat(firstRegularChat || null);
            }
        }
    }, [pathname, activeChat, setActiveChat]);

    // On mobile, if no chat is active, show the list.
    // If a chat is active, show the chat view.
    const showChatListOnMobile = !activeChat;

    return (
        <main className="flex h-screen md:h-full flex-col overflow-hidden">
             <div className="md:hidden flex-1">
                {showChatListOnMobile ? (
                    <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
                ) : (
                    activeChat && <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
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
