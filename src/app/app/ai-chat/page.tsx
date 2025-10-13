'use client';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { chats } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, PenSquare, MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AiChatInput from '@/components/chat/ai-chat-input';
import { Skeleton } from '@/components/ui/skeleton';
import { generateImage } from '@/ai/flows/image-generation-flow';
import SideMenu from '@/components/side-menu';
import { useToast } from '@/hooks/use-toast';

function ImagineTab() {
    const [prompt, setPrompt] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, startGeneration] = useTransition();
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!prompt) return;
        startGeneration(async () => {
            try {
                const result = await generateImage({ prompt });
                if (result.imageUrl) {
                    setGeneratedImage(result.imageUrl);
                }
            } catch (error: any) {
                console.error("Image generation error:", error);
                 toast({
                    variant: 'destructive',
                    title: 'Image Generation Failed',
                    description: error.message || 'Could not generate image.',
                });
            }
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4 h-full">
            <div className="flex gap-2">
                <Input 
                    placeholder="Describe the image you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                />
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
            </div>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg bg-secondary/50">
                {isGenerating ? (
                    <Skeleton className="w-full h-full" />
                ) : generatedImage ? (
                    <Image src={generatedImage} alt={prompt} width={512} height={512} className="object-contain max-w-full max-h-full rounded-lg" />
                ) : (
                    <p className="text-muted-foreground text-center">Your generated image will appear here.</p>
                )}
            </div>
        </div>
    );
}


export default function AiChatPage() {
    const initialAiChat = chats.find(c => c.type === 'ai');
    const blankAiChat = initialAiChat ? { ...initialAiChat, messages: [] } : undefined;

    const [chat, setChat] = useState<Chat | undefined>(blankAiChat);
    const [activeTab, setActiveTab] = useState('ask');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!chat) {
        return <p>Loading AI Chat...</p>;
    }

    const handleNewMessage = (newMessage: Message) => {
        setChat(prevChat => {
            if (!prevChat) return undefined;
            return {
                ...prevChat,
                messages: [...prevChat.messages, newMessage]
            };
        });
    };

    const updateMessage = (messageId: string, updates: Partial<Message>) => {
        setChat(prevChat => {
            if (!prevChat) return undefined;
            return {
                ...prevChat,
                messages: prevChat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                )
            };
        });
    };

    const startNewConversation = () => {
        setChat(blankAiChat);
    }
    
    return (
        <>
            <SideMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            <main className="flex h-full flex-col overflow-hidden bg-background">
                <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
                        <Menu />
                    </Button>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ask">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Ask
                            </TabsTrigger>
                            <TabsTrigger value="imagine">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                                Imagine
                                <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-600">FREE</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="ghost" size="icon" onClick={startNewConversation}>
                        <PenSquare />
                    </Button>
                </header>
                
                {activeTab === 'ask' ? (
                     <AiChatHandler 
                        chat={chat} 
                        handleNewMessage={handleNewMessage} 
                        updateMessage={updateMessage}
                    />
                ) : (
                    <ImagineTab />
                )}
            </main>
        </>
    );
}
