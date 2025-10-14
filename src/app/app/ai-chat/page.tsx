'use client';
import { useContext } from 'react';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { AppContext } from '@/lib/context.tsx';

export default function AiChatPage() {
    const context = useContext(AppContext);

    if (!context) {
        return <p>Loading AI Chat...</p>;
    }
    
    return (
        <main className="flex h-full flex-col overflow-hidden bg-background">
            <header className="flex shrink-0 items-center justify-center gap-2 border-b bg-background p-4">
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold font-headline">AfuAi Assistant</h1>
                    <p className="text-sm text-muted-foreground">Your personal AI companion</p>
                </div>
            </header>
            
            <AiChatHandler />
        </main>
    );
}
