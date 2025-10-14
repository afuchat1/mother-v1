import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Chat, UserProfile } from "@/lib/types";
import { Users } from "lucide-react";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, DocumentReference } from "firebase/firestore";

type ChatAvatarProps = {
  chat?: Chat;
  senderId?: string;
  className?: string;
};

export function ChatAvatar({ chat, senderId, className }: ChatAvatarProps) {
  const firestore = useFirestore();

  const singleUserRef = useMemoFirebase(() => {
    if (!senderId) return null;
    return doc(firestore, 'users', senderId) as DocumentReference<UserProfile>;
  }, [firestore, senderId]);

  const { data: user } = useDoc<UserProfile>(singleUserRef);

  if (chat?.type === 'group' || (chat && !senderId)) {
    return (
       <Avatar className={cn("h-10 w-10 border", className)}>
            <AvatarImage src={chat.avatarUrl} alt={chat.name} />
            <AvatarFallback>
                {chat.name ? chat.name.charAt(0).toUpperCase() : <Users />}
            </AvatarFallback>
        </Avatar>
    )
  }

  const fallback = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <Avatar className={cn("h-10 w-10 border", className)}>
      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
      <AvatarFallback>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
