import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Chat } from "@/lib/types";
import { Users } from "lucide-react";

type ChatAvatarProps = {
  chat: Chat;
  className?: string;
};

export default function ChatAvatar({ chat, className }: ChatAvatarProps) {
  const fallback = chat.name.charAt(0).toUpperCase();

  return (
    <Avatar className={cn("h-10 w-10 border", className)}>
      <AvatarImage src={chat.avatarUrl} alt={chat.name} />
      <AvatarFallback>
        {chat.type === "group" ? <Users className="h-5 w-5" /> : fallback}
      </AvatarFallback>
    </Avatar>
  );
}
