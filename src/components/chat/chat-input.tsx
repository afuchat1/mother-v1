import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic } from "lucide-react";

type ChatInputProps = {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading?: boolean;
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" disabled>
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
            </Button>
            <Textarea
            placeholder="Type a message..."
            className="flex-1 resize-none bg-secondary border-0"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                }
            }}
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={isLoading || !input.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0" disabled>
                <Mic className="h-5 w-5" />
                <span className="sr-only">Record voice</span>
            </Button>
        </div>
      </form>
    </div>
  );
}