'use client';
import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send } from "lucide-react";
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
    handleSubmit: (text: string, options?: { voiceUrl?: string, selectedModel?: string }) => void;
    isLoading?: boolean;
}

export default function AiChatInput({ handleSubmit, isLoading }: AiChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('afuai-fast');
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
        // Call handleSubmit with the voice URL and selected model.
        handleSubmit(input, { voiceUrl: audioUrl, selectedModel });
        setInput('');
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
      if (input.trim()) {
          handleSubmit(input, { selectedModel });
          setInput('');
      }
  }
  
  return (
    <form onSubmit={handleFormSubmit} className="relative bg-secondary/50 rounded-lg p-2">
      <div className="flex items-start gap-2">
        <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 text-muted-foreground h-10 w-10" 
            onClick={handleMicClick} 
            type="button"
            disabled={isLoading}
        >
          <Mic className="h-5 w-5" />
          <span className="sr-only">Voice input</span>
        </Button>
        <div className='flex-1 flex flex-col gap-2'>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
                <SelectTrigger className="w-auto border-0 bg-transparent focus:ring-0 h-auto p-0 text-base">
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
                            <span>AfuAi Advanced</span> <Badge variant="default">Advanced</Badge>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Textarea
              placeholder="Ask anything"
              className="flex-1 resize-none bg-transparent border-0 rounded-md p-0 h-auto text-base focus-visible:ring-0 shadow-none"
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleFormSubmit(e as any);
                  }
              }}
              disabled={isLoading}
            />
        </div>
        <div className='flex items-end h-full'>
            {input && !isLoading ? (
              <Button type="submit" size="icon" className="shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-md">
                  <Send />
                  <span className="sr-only">Send</span>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10" type="button" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M18 11v2"/><path d="M6 11v2"/><path d="M21 8.5v7"/><path d="M3 8.5v7"/></svg>
                <span className="sr-only">Audio options</span>
              </Button>
            )}
        </div>
      </div>
    </form>
  );
}
