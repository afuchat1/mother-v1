'use client';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col h-full bg-background border-r">
        <header className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Chats</h1>
        </header>
        <ScrollArea className="flex-1">
            <div className="flex flex-col">
                {regularChats.map((chat) => (
                <button
                    key={chat.id}
                    onClick={() => handleChatSelection(chat)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        activeChat?.id === chat.id ? "bg-accent" : "hover:bg-accent/50"
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
                        <p className={cn(
                            "truncate text-sm",
                            activeChat?.id === chat.id ? "text-accent-foreground/90" : "text-muted-foreground"
                        )}>
                        {chat.messages[chat.messages.length - 1].text}
                        </p>
                    </div>
                </button>
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
