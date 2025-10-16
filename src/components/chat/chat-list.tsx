'use client';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat } from "@/lib/types";
import { ChatAvatar } from "./chat-avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from 'lucide-react';
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { format, isToday, isYesterday } from 'date-fns';

type ChatListProps = {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
};

export default function ChatList({ activeChat, setActiveChat }: ChatListProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const chatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, `users/${user.uid}/chats`),
        orderBy('lastMessage.timestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  const handleChatSelection = (chat: Chat) => {
    setActiveChat(chat);
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    if (isToday(date)) {
        return format(date, 'p');
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    return format(date, 'dd/MM/yyyy');
  }

  if (isLoading) {
    return <p className="p-4 text-center text-muted-foreground">Loading chats...</p>
  }
  
  if (!chats || chats.length === 0) {
      return <p className="p-4 text-center text-muted-foreground">No chats yet.</p>
  }

  return (
    <ScrollArea className="flex-1">
        <div className="flex flex-col">
            {chats && chats.map((chat) => (
            <button
                key={chat.id}
                onClick={() => handleChatSelection(chat)}
                className={cn(
                    "flex items-center gap-3 px-4 py-4 text-left transition-all duration-200 border-b",
                    "hover:bg-accent hover:shadow-sm active:scale-98",
                    activeChat?.id === chat.id && "bg-accent border-l-4 border-l-primary"
                )}
            >
                <div className="relative">
                    <ChatAvatar chat={chat} className="h-14 w-14" />
                    {chat.type === 'dm' && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold truncate text-lg">{chat.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {formatTimestamp(chat.lastMessage?.timestamp)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-muted-foreground flex-1">
                            {chat.lastMessage?.text || (chat.lastMessage?.imageUrl ? '📷 Image' : chat.lastMessage?.voiceUrl ? '🎤 Voice message' : chat.lastMessage?.videoUrl ? '📹 Video message' : 'Start a conversation')}
                        </p>
                        <div className="flex items-center gap-1">
                            {chat.type === 'group' && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    {chat.participantIds?.length || 0}
                                </span>
                            )}
                            <CheckCheck className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                    {chat.type === 'ai' && (
                        <div className="flex items-center gap-1 mt-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-xs text-blue-600 dark:text-blue-400">AI Assistant</span>
                        </div>
                    )}
                </div>
            </button>
            ))}
        </div>
    </ScrollArea>
  );
}
