import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import type { Chat } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import { cn } from "@/lib/utils";

type ChatListProps = {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
};

export default function ChatList({ chats, activeChat, setActiveChat }: ChatListProps) {
  const { setOpenMobile } = useSidebar();
  const regularChats = chats.filter(c => c.type !== 'ai');
  
  const handleChatSelection = (chat: Chat) => {
    setActiveChat(chat);
    setOpenMobile(false);
  }

  return (
    <ScrollArea className="h-full">
        <SidebarMenu>
            {regularChats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                onClick={() => handleChatSelection(chat)}
                isActive={activeChat?.id === chat.id}
                className="h-auto justify-start gap-3 px-2 py-2"
                >
                <ChatAvatar chat={chat} />
                <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">{chat.name}</span>
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