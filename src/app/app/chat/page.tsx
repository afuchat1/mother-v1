'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context';
import { chats as allChats } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


export default function ChatPage() {
    const context = useContext(AppContext);
    const isMobile = useIsMobile();

    if (!context) {
        return <p>Error: Chat context not found.</p>;
    }

    const { activeChat, setActiveChat } = context;

    if (isMobile) {
        return (
            <main className="flex flex-1 flex-col-reverse overflow-hidden">
                {activeChat ? (
                    <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
                ) : (
                    <div className="md:hidden">
                        <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
                    </div>
                )}
            </main>
        )
    }

  return (
    <main className={cn(
        "flex flex-1 flex-col-reverse overflow-hidden",
        "md:grid md:grid-cols-[320px_1fr]"
    )}>
        <div className="hidden md:flex md:flex-col md:border-r">
            <ChatList chats={allChats} activeChat={activeChat} setActiveChat={setActiveChat} />
        </div>

        {activeChat ? (
            <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
        ) : (
             <div className="hidden h-full flex-col items-center justify-center bg-background p-8 text-center md:flex">
                <h2 className="text-2xl font-bold font-headline">Welcome to AfuChat</h2>
                <p className="text-muted-foreground">Select a chat to start messaging.</p>
            </div>
        )}
    </main>
  );
}
