'use client';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2">
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
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "relative max-w-lg rounded-xl p-2 px-3 shadow-sm",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none"
                  )}
                >
                  {!isCurrentUser && <p className="mb-1 text-xs font-semibold text-primary">{message.sender.name}</p>}
                  
                  {message.imageUrl && (
                    <Image 
                      src={message.imageUrl} 
                      alt="chat image" 
                      width={400} 
                      height={300} 
                      className="mb-1 rounded-lg"
                      data-ai-hint="scenery photo"
                    />
                  )}
                  
                  <div className="flex items-end gap-2">
                     <p className='whitespace-pre-wrap text-sm'>{message.text}</p>
                     <p className={cn("text-xs shrink-0", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{message.createdAt}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
