import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
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
  return (
    <ScrollArea className="h-full">
        <SidebarMenu>
            {regularChats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                onClick={() => setActiveChat(chat)}
                isActive={activeChat?.id === chat.id}
                className="h-auto justify-start gap-3 px-2 py-2"
                >
                <ChatAvatar chat={chat} />
                <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{chat.name}</span>
                    <span className={cn(
                        "truncate text-xs",
                        activeChat?.id === chat.id ? "text-accent-foreground/80" : "text-muted-foreground"
                    )}>
                    {chat.messages[chat.messages.length - 1].text}
                    </span>
                </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
      </SidebarMenu>
    </ScrollArea>
  );
}
