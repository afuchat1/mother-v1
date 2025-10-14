'use client';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';
import ChatList from '@/components/chat/chat-list';
import { AppContext } from '@/lib/context.tsx';
import type { Chat } from '@/lib/types';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

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
    
    const handleSelectChat = (chat: Chat) => {
        if (!user) return;
        setActiveChat(chat);
        router.push(`/app/chat/${chat.id}`);
    }

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-4 sticky top-0 z-10">
                <h1 className="text-2xl font-bold font-headline">Chats</h1>
            </header>
            <ChatList activeChat={activeChat} setActiveChat={handleSelectChat} />
            <Button asChild className="absolute bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
                <Link href="/app/new-chat">
                    <Pencil className="h-6 w-6" />
                    <span className="sr-only">New Chat</span>
                </Link>
            </Button>
        </div>
    )
}
