'use client';
import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '../ui/badge';


type AiChatInputProps = {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading?: boolean;
}

export default function AiChatInput({ input, handleInputChange, handleSubmit, isLoading }: AiChatInputProps) {
  
  return (
    <form onSubmit={handleSubmit} className="relative bg-secondary/50 rounded-lg p-2">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10">
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice input</span>
            </Button>
            <Select defaultValue="grok-fast">
                <SelectTrigger className="w-auto border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="grok-fast">
                        <div className='flex items-center gap-2'>
                            <span>Grok 4 Fast</span> <Badge variant="outline">Beta</Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="grok-slow">
                         <div className='flex items-center gap-2'>
                            <span>Grok 4 Slow</span> <Badge variant="outline">Advanced</Badge>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

        </div>
      <Textarea
          placeholder="Ask anything"
          className="flex-1 resize-none bg-transparent border-0 rounded-md py-2 px-3 h-auto text-base focus-visible:ring-0"
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
       <div className='flex justify-end'>
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M18 11v2"/><path d="M6 11v2"/><path d="M21 8.5v7"/><path d="M3 8.5v7"/></svg>
                <span className="sr-only">Audio options</span>
            </Button>
       </div>
    </form>
  );
}
