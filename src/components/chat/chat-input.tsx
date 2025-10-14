'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, X, Reply, Camera } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import CameraView from './camera-view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type ChatInputProps = {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string, videoUrl?: string }) => void;
    isLoading?: boolean;
    handleImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageFile?: (file: File) => void;
    imagePreview?: string | null;
    removeImage?: () => void;
    replyTo?: Message | null;
    cancelReply?: () => void;
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading, handleImageChange, handleImageFile, imagePreview, removeImage, replyTo, cancelReply }: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const onLocalInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const onPhotoTaken = (imageFile: File) => {
    if (handleImageFile) {
        handleImageFile(imageFile);
    }
    setShowCamera(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      
      const audioChunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, { voiceUrl: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };


  if (showCamera) {
    return <CameraView onCapture={onPhotoTaken} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="bg-background p-2 border-t">
       {replyTo && cancelReply && (
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between rounded-md bg-secondary p-2 pl-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <Reply className="h-4 w-4 text-primary shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-primary text-sm truncate">{replyTo.senderId}</p>
                  <p className="text-muted-foreground text-sm truncate">{replyTo.text || (replyTo.imageUrl ? 'Image' : replyTo.voiceUrl ? 'Voice message' : 'Video message')}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelReply}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
        <div className="flex items-end gap-2">
            <Textarea
                ref={textareaRef}
                placeholder="Message"
                className="flex-1 resize-none bg-secondary border-0 rounded-full py-2 px-4 h-10 text-base max-h-32"
                rows={1}
                value={input}
                onChange={onLocalInputChange}
                maxLength={1000}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                    }
                }}
            />
            {handleImageChange && handleImageFile && (
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
                          <Button variant="outline" size="sm" onClick={handleAttachClick} type="button" className="flex flex-col h-auto p-3 gap-1">
                              <Paperclip className="h-5 w-5" />
                              <span className="text-xs">File</span>
                          </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
              )}
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            
            {(input || imagePreview ) ? (
                <Button 
                  type="submit"
                  size="icon" 
                  className="shrink-0 bg-primary rounded-full h-10 w-10"
                  disabled={isLoading}
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
            ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-muted-foreground rounded-full h-10 w-10" 
                  type="button" 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  >
                    <Mic className="h-5 w-5" />
                    <span className="sr-only">Hold to record voice</span>
                </Button>
            )}
        </div>
      </form>
    </div>
  );
}
