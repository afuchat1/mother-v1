'use client';
import { useContext, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatView from '@/components/chat/chat-view';
import { AppContext } from '@/lib/context.tsx';
import { useDoc, useFirestore, useUser } from '@/firebase';
import type { Chat } from '@/lib/types';
import { doc } from 'firebase/firestore';

export default function ChatPage() {
    const context = useContext(AppContext);
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();

    const { chatId } = params;

    const chatDocRef = user ? doc(firestore, `users/${user.uid}/chats/${chatId}`) : null;
    const { data: currentChat, isLoading, error } = useDoc<Chat>(chatDocRef);
    
    useEffect(() => {
        if (error) {
            console.error("Error fetching chat:", error);
            router.replace('/app/chat');
        }
        if (!isLoading && !currentChat) {
            router.replace('/app/chat');
        }
    }, [isLoading, currentChat, error, router]);

    if (!context || isLoading || !user) {
        return <p>Loading chat...</p>;
    }

    if (error) {
        return <p>Error loading chat. Redirecting...</p>;
    }

    if (!currentChat) {
        return <p>Chat not found. Redirecting...</p>;
    }
    
    // setActiveChat is still useful for other parts of the UI that might react to the active chat
    const { setActiveChat } = context;

    return (
        <main className="flex h-full flex-col overflow-hidden">
            {currentChat && <ChatView key={currentChat.id} chat={currentChat} setActiveChat={setActiveChat} />}
        </main>
    )
}
