import Image from 'next/image';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender.id === currentUser.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xs rounded-lg p-3 text-sm md:max-w-md",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-card shadow-sm"
                  )}
                >
                  {!isCurrentUser && <p className="mb-1 text-xs font-semibold text-primary">{message.sender.name}</p>}
                  {message.text}
                  {message.imageUrl && (
                    <Image 
                      src={message.imageUrl} 
                      alt="chat image" 
                      width={400} 
                      height={300} 
                      className="mt-2 rounded-lg"
                      data-ai-hint="scenery photo"
                    />
                  )}
                  <p className={cn("mt-2 text-xs", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>{message.createdAt}</p>
                </div>
                {isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
