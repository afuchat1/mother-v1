'use client';
import { useState, useTransition } from 'react';
import AiChatHandler from '@/components/chat/ai-chat-handler';
import { chats } from '@/lib/data';
import type { Chat, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, PenSquare, Video, Camera, Waves } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AiAssistantLogo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import AiChatInput from '@/components/chat/ai-chat-input';
import CameraView from '@/components/chat/camera-view';
import { Card, CardContent } from '@/components/ui/card';

export default function AiChatPage() {
    const router = useRouter();
    const initialAiChat = chats.find(c => c.type === 'ai');
    
    // Create a version of the initial chat with no messages
    const blankAiChat = initialAiChat ? { ...initialAiChat, messages: [] } : undefined;

    const [chat, setChat] = useState<Chat | undefined>(blankAiChat);
    const [input, setInput] = useState('');
    const [imageToSend, setImageToSend] = useState<File | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isPending, startTransition] = useTransition();


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
    
    const isConversationStarted = chat.messages.length > 0;

    const onPhotoTaken = (imageFile: File) => {
        setImageToSend(imageFile);
        setShowCamera(false);
    };

    return (
        <main className="flex h-full flex-col overflow-hidden bg-background">
            {showCamera && <CameraView onCapture={onPhotoTaken} onClose={() => setShowCamera(false)} />}
             <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
                <Button variant="ghost" size="icon">
                    <Menu />
                </Button>
                <Tabs defaultValue="ask" className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ask">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Ask
                        </TabsTrigger>
                        <TabsTrigger value="imagine">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                            Imagine
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-600">FREE</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon">
                    <PenSquare />
                </Button>
            </header>
            
            <div className='flex-1 overflow-y-auto'>
                {!isConversationStarted ? (
                    <div className="p-4 flex flex-col gap-4 items-center justify-center h-full">
                        <Card className="w-full">
                            <CardContent className="p-4">
                                <Button variant="outline" className="w-full" onClick={() => setShowCamera(true)}>
                                    <Camera className="mr-2 h-4 w-4" /> Open Camera
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <AiChatHandler 
                        chat={chat} 
                        handleNewMessage={handleNewMessage} 
                        updateMessage={updateMessage}
                        imageToSend={imageToSend}
                        clearImageToSend={() => setImageToSend(null)}
                     />
                )}
            </div>
            

            <div className="shrink-0 p-2 border-t">
                 <AiChatInput 
                    imagePreview={imageToSend ? URL.createObjectURL(imageToSend) : null}
                    removeImage={() => setImageToSend(null)}
                    handleSubmit={(text: string) => {
                        const userMessage: Message = {
                          id: `user_${Date.now()}`,
                          text: text,
                          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          sender: { id: 'user1', name: 'You', avatarUrl: ''}, // Placeholder for current user
                          imageUrl: imageToSend ? URL.createObjectURL(imageToSend) : undefined,
                        };
                        handleNewMessage(userMessage);
                    }}
                 />
            </div>
        </main>
    );
}
