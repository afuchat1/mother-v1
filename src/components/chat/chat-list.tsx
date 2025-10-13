'use client';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';

type ChatListProps = {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
};

export default function ChatList({ chats, activeChat, setActiveChat }: ChatListProps) {
  const regularChats = chats.filter(c => c.type !== 'ai');
  
  const handleChatSelection = (chat: Chat) => {
    setActiveChat(chat);
  }

  return (
    <div className="flex flex-col h-full bg-background">
        <header className="p-4 border-b sticky top-0 bg-background z-10">
            <h1 className="text-2xl font-bold font-headline">Chats</h1>
        </header>
        <ScrollArea className="flex-1">
            <div className="flex flex-col">
                {regularChats.map((chat) => (
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
                                {chat.messages[chat.messages.length - 1].createdAt}
                            </span>
                        </div>
                        <div className="flex items-start justify-between">
                            <p className={cn(
                                "truncate text-sm w-11/12",
                                activeChat?.id === chat.id ? "text-accent-foreground/90" : "text-muted-foreground"
                            )}>
                                {chat.messages[chat.messages.length - 1].text}
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
