'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, X, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

type AiChatInputProps = {
    handleSubmit: (text: string, options?: { voiceUrl?: string }) => void;
    isLoading?: boolean;
    imagePreview?: string | null;
    removeImage?: () => void;
}

export default function AiChatInput({ handleSubmit, isLoading, imagePreview, removeImage }: AiChatInputProps) {
  const [input, setInput] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleSubmit('', { voiceUrl: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      toast({ title: 'Recording started...' });
    } catch (err) {
      console.error("Error starting recording:", err);
      toast({ variant: 'destructive', title: 'Recording Error', description: 'Could not start recording. Please check microphone permissions.' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: 'Recording finished.' });
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim() || imagePreview) {
          handleSubmit(input);
          setInput('');
      }
  }
  
  return (
    <form onSubmit={handleFormSubmit} className="relative bg-secondary/50 rounded-lg p-2">
       {imagePreview && removeImage && (
        <div className="p-2 relative w-24 h-24">
          <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={removeImage}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10" onClick={handleMicClick} type="button">
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice input</span>
            </Button>
            <Select defaultValue="afuai-fast">
                <SelectTrigger className="w-auto border-0 bg-transparent focus:ring-0">
                    <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="afuai-fast">
                        <div className='flex items-center gap-2'>
                            <span>AfuAi Fast</span> <Badge variant="outline">Beta</Badge>
                        </div>
                    </SelectItem>
                    <SelectItem value="afuai-advanced">
                         <div className='flex items-center gap-2'>
                            <span>AfuAi Advanced</span> <Badge variant="outline">Advanced</Badge>
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
                  handleFormSubmit(e as any);
              }
          }}
      />
       <div className='flex justify-end items-center'>
            {(input || imagePreview) && (
              <Button type="submit" size="icon" className="shrink-0 text-muted-foreground h-10 w-10 bg-transparent hover:bg-transparent">
                  <Send />
                  <span className="sr-only">Send</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M18 11v2"/><path d="M6 11v2"/><path d="M21 8.5v7"/><path d="M3 8.5v7"/></svg>
                <span className="sr-only">Audio options</span>
            </Button>
       </div>
    </form>
  );
}
