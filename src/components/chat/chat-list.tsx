'use client';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat } from "@/lib/types";
import { ChatAvatar } from "./chat-avatar";
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";

type ChatListProps = {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
};

export default function ChatList({ activeChat, setActiveChat }: ChatListProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const chatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // This query now points to a subcollection on the user document
    return query(collection(firestore, `users/${user.uid}/chats`));
  }, [firestore, user]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  const handleChatSelection = (chat: Chat) => {
    setActiveChat(chat);
  }

  if (isLoading) {
    return (
        <div className="flex flex-col h-full bg-background p-4">
            <h1 className="text-2xl font-bold font-headline mb-4">Chats</h1>
            <p>Loading chats...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
        <header className="p-4 border-b sticky top-0 bg-background z-10 shrink-0">
            <h1 className="text-2xl font-bold font-headline">Chats</h1>
        </header>
        <ScrollArea className="flex-1">
            <div className="flex flex-col">
                {chats && chats.map((chat) => (
                <button
                    key={chat.id}
                    onClick={() => handleChatSelection(chat)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 text-left transition-colors border-b",
                        activeChat?.id === chat.id ? "bg-primary/10" : "hover:bg-accent/50"
                    )}
                >
                    <ChatAvatar chat={chat} />
                    <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold truncate">{chat.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                                {chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp.seconds * 1000).toLocaleTimeString() : ''}
                            </span>
                        </div>
                        <div className="flex items-start justify-between">
                            <p className={cn(
                                "truncate text-sm w-11/12",
                                activeChat?.id === chat.id ? "text-accent-foreground/90" : "text-muted-foreground"
                            )}>
                                {chat.lastMessage?.text || (chat.lastMessage?.imageUrl ? 'Image' : chat.lastMessage?.voiceUrl ? 'Voice message' : 'Video message')}
                            </p>
                             <div className="flex flex-col items-end">
                                <Check className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </div>
                </button>
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
