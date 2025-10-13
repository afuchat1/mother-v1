import type { Chat } from "@/lib/types";
import ChatAvatar from "./chat-avatar";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import AiChatHandler from "./ai-chat-handler";

type ChatViewProps = {
  chat: Chat;
  setActiveChat: (chat: Chat | null) => void;
};

export default function ChatView({ chat, setActiveChat }: ChatViewProps) {
  if (chat.type === 'ai') {
    return <AiChatHandler chat={chat} />;
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b bg-card p-4">
        <ChatAvatar chat={chat} />
        <div className="flex-1">
          <h2 className="font-semibold font-headline">{chat.name}</h2>
          <p className="text-sm text-muted-foreground">
            {chat.type === 'dm' ? 'Direct Message' : 'Group Chat'}
          </p>
        </div>
      </header>
      <ChatMessages messages={chat.messages} />
      <ChatInput />
    </div>
  );
}
