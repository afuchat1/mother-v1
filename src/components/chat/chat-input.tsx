'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, X } from "lucide-react";

type ChatInputProps = {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading?: boolean;
    handleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    imagePreview?: string | null;
    removeImage?: () => void;
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading, handleImageChange, imagePreview, removeImage }: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t bg-background p-2 md:p-4">
       {imagePreview && removeImage && (
        <div className="p-2 relative w-24 h-24">
          <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2">
            {handleImageChange && (
              <>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" onClick={handleAttachClick} type="button">
                    <Paperclip className="h-6 w-6" />
                    <span className="sr-only">Attach file</span>
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </>
            )}
            <Textarea
                placeholder="Message"
                className="flex-1 resize-none bg-secondary border-0 rounded-full py-2 px-4 h-10 text-base"
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
            {(input || imagePreview) ? (
                <Button type="submit" size="icon" className="shrink-0 bg-primary rounded-full h-10 w-10" disabled={isLoading}>
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
            ) : (
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground" type="button">
                    <Mic className="h-6 w-6" />
                    <span className="sr-only">Record voice</span>
                </Button>
            )}
        </div>
      </form>
    </div>
  );
}
