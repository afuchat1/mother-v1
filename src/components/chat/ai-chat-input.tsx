'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send, Trash2, Paperclip, X, Camera } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import CameraView from './camera-view';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';


type AiChatInputProps = {
    handleSubmit: (text: string, options?: { voiceUrl?: string, selectedModel?: string, imageFile?: File | null }) => void;
    isLoading?: boolean;
}

export default function AiChatInput({ handleSubmit, isLoading }: AiChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('afuai-fast');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const onPhotoTaken = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const removeImage = () => {
      setImageFile(null);
      setImagePreview(null);
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            handleSubmit(input, { voiceUrl: audioUrl, selectedModel });
            setInput('');
        }
        stream.getTracks().forEach(track => track.stop());
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
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

  const cancelRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
      
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
      toast({ title: 'Recording canceled' });
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
      if (input.trim() || imageFile) {
          handleSubmit(input, { selectedModel, imageFile });
          setInput('');
          setImageFile(null);
          setImagePreview(null);
      }
  }

  if (showCamera) {
    return <CameraView onCapture={onPhotoTaken} onClose={() => setShowCamera(false)} />;
  }
  
  return (
    <form onSubmit={handleFormSubmit} className="relative bg-secondary/50 rounded-lg p-2">
      {imagePreview && (
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
      {isRecording ? (
        <div className="flex items-center gap-2 h-full min-h-[68px]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 text-muted-foreground h-10 w-10" 
            onClick={cancelRecording} 
            type="button"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="sr-only">Cancel Recording</span>
          </Button>

          <div className="flex-1 flex items-center justify-center bg-input rounded-md h-10 px-4">
            <div className="flex items-center gap-2 text-red-500">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
            </div>
          </div>
        
          <Button 
            size="icon" 
            className="shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-md"
            onClick={handleMicClick} 
            type="button"
          >
            <div className="h-4 w-4 bg-primary-foreground rounded-sm"></div>
            <span className="sr-only">Stop Recording</span>
          </Button>
        </div>
      ) : (
      <div className="flex items-start gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 mb-2">
              <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCamera(true)} type="button" className="flex flex-col h-auto p-3 gap-1">
                      <Camera className="h-5 w-5" />
                      <span className="text-xs">Camera</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} type="button" className="flex flex-col h-auto p-3 gap-1">
                      <Paperclip className="h-5 w-5" />
                      <span className="text-xs">File</span>
                  </Button>
              </div>
            </PopoverContent>
          </Popover>
          <input type="file" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" accept="image/*" />

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
              ref={textareaRef}
              placeholder="Ask anything"
              className="flex-1 resize-none bg-transparent border-0 rounded-md p-0 h-auto text-base focus-visible:ring-0 shadow-none max-h-32"
              rows={1}
              value={input}
              maxLength={1000}
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
            {(input || imageFile) && !isLoading ? (
              <Button type="submit" size="icon" className="shrink-0 h-10 w-10 bg-primary text-primary-foreground rounded-md">
                  <Send />
                  <span className="sr-only">Send</span>
              </Button>
            ) : selectedModel === 'afuai-advanced' ? (
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
            ) : (
              <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10" type="button" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M18 11v2"/><path d="M6 11v2"/><path d="M21 8.5v7"/><path d="M3 8.5v7"/></svg>
                <span className="sr-only">Audio options</span>
              </Button>
            )}
        </div>
      </div>
      )}
    </form>
  );
}
