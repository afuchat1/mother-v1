'use client';
import { useContext } from 'react';
import ChatView from '@/components/chat/chat-view';
import { Skeleton } from '@/components/ui/skeleton';

// This is a bit of a hack to get the state from the layout.
// In a real app, this would be managed with a proper state management library or context provider at a higher level.
const AppContext = require('react').createContext(null);

export default function ChatPage() {
    // We are reaching into the parent layout's state. This is not a standard pattern
    // but works for this specific MVP structure to avoid prop drilling.
    const { activeChat, setActiveChat } = useContext(AppContext);

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
