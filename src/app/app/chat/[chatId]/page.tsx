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

    const chatId = params.chatId as string;

    const chatDocRef = user ? doc(firestore, `users/${user.uid}/chats/${chatId}`) : null;
    const { data: currentChat, isLoading, error } = useDoc<Chat>(chatDocRef);
    
    useEffect(() => {
        // Only redirect if loading is finished and there's a definite problem
        if (!isLoading) {
            if (error) {
                console.error("Error fetching chat:", error);
                router.replace('/app/chat');
            } else if (!currentChat) {
                // This means loading finished and the document doesn't exist.
                router.replace('/app/chat');
            }
        }
    }, [isLoading, currentChat, error, router]);

    if (isLoading || !user) {
        return <p>Loading chat...</p>;
    }

    if (error) {
        return <p>Error loading chat. Redirecting...</p>;
    }
    
    if (!context) {
        return <p>Loading context...</p>;
    }

    // By this point, isLoading is false and we have a currentChat
    if (!currentChat) {
        return <p>Chat not found. Redirecting...</p>;
    }
    
    const { setActiveChat } = context;

    return (
        <main className="flex h-full flex-col overflow-hidden">
            <ChatView key={currentChat.id} chat={currentChat} setActiveChat={setActiveChat} />
        </main>
    )
}
