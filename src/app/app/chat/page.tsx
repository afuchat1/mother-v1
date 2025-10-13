'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import { Skeleton } from '@/components/ui/skeleton';
import { AppContext } from '@/lib/context';

export default function ChatPage() {
    const context = useContext(AppContext);

    if (!context) {
        // This can happen if the provider is not found.
        // You might want to render an error message or a loading state.
        return <p>Error: Chat context not found.</p>;
    }

    const { activeChat, setActiveChat } = context;

    if (!activeChat) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-background p-8 text-center">
                <h2 className="text-2xl font-bold font-headline">Welcome to AfuChat</h2>
                <p className="text-muted-foreground">Select a chat to start messaging.</p>
            </div>
        )
    }

  return (
    <main className="flex flex-1 flex-col-reverse overflow-hidden">
        {activeChat ? (
            <ChatView key={activeChat.id} chat={activeChat} setActiveChat={setActiveChat} />
        ) : (
            <div className="p-4">
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-32 w-full" />
            </div>
        )}
    </main>
  );
}
