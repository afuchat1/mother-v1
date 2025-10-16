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
import Link from "next/link";
import { usePathname } from "next/navigation";

type ChatListProps = {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
};

export default function ChatList({ activeChat, setActiveChat }: ChatListProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const pathname = usePathname();

  const chatsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, `users/${user.uid}/chats`),
        orderBy('lastMessage.timestamp', 'desc')
    );
  }, [firestore, user]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

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
            <Link
                key={chat.id}
                href={`/app/chat/${chat.id}`}
                onClick={() => setActiveChat(chat)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 text-left transition-colors border-b",
                    pathname === `/app/chat/${chat.id}` ? "bg-accent" : "hover:bg-accent"
                )}
            >
                <ChatAvatar chat={chat} className="h-14 w-14" />
                <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold truncate text-lg">{chat.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                            {formatTimestamp(chat.lastMessage?.timestamp)}
                        </span>
                    </div>
                    <div className="flex items-start justify-between">
                        <p className="truncate text-sm text-muted-foreground w-11/12">
                            {chat.lastMessage?.text || (chat.lastMessage?.imageUrl ? '📷 Image' : chat.lastMessage?.voiceUrl ? '🎤 Voice message' : '📹 Video message')}
                        </p>
                         <div className="flex flex-col items-end">
                            <CheckCheck className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </div>
            </Link>
            ))}
        </div>
    </ScrollArea>
  );
}
