'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, X, Trash2, Reply, Camera } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import CameraView from './camera-view';

type ChatInputProps = {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, options?: { voiceUrl?: string }) => void;
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const onPhotoTaken = (imageFile: File) => {
    if (handleImageFile) {
        handleImageFile(imageFile);
    }
    setShowCamera(false);
  };
  
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
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, { voiceUrl: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      // You might want to show a toast to the user here
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
      // Don't call stop(), just clean up
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (showCamera) {
    return <CameraView onCapture={onPhotoTaken} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-background p-2 border-t">
       {replyTo && cancelReply && (
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between rounded-lg bg-secondary p-2 pl-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <Reply className="h-4 w-4 text-primary shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-primary text-sm truncate">{replyTo.sender.name}</p>
                  <p className="text-muted-foreground text-sm truncate">{replyTo.text || 'Voice message'}</p>
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
        <div className="flex items-center gap-2">
           {isRecording ? (
             <div className="flex-1 flex items-center bg-input rounded-full h-9 px-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
               </div>
               <div className="flex-1"></div>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-9 w-9" type="button" onClick={cancelRecording}>
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Cancel Recording</span>
                </Button>
             </div>
           ) : (
            <>
              {handleImageChange && (
                <>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-9 w-9" onClick={() => setShowCamera(true)} type="button">
                      <Camera className="h-5 w-5" />
                      <span className="sr-only">Take photo</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-9 w-9" onClick={handleAttachClick} type="button">
                      <Paperclip className="h-5 w-5" />
                      <span className="sr-only">Attach file</span>
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </>
              )}
              <Textarea
                  placeholder="Message"
                  className="flex-1 resize-none bg-input border-0 rounded-full py-1.5 px-4 h-9 text-base"
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
            </>
           )}
            {(input || imagePreview || isRecording) ? (
                <Button 
                  type={isRecording ? "button" : "submit"} 
                  size="icon" 
                  className={cn(
                    "shrink-0 bg-primary rounded-full h-9 w-9",
                    isRecording && "bg-red-500 hover:bg-red-600"
                  )} 
                  disabled={isLoading}
                  onClick={isRecording ? stopRecording : undefined}
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">{isRecording ? "Stop and Send" : "Send"}</span>
                </Button>
            ) : (
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-9 w-9" type="button" onClick={handleMicClick}>
                    <Mic className="h-5 w-5" />
                    <span className="sr-only">Record voice</span>
                </Button>
            )}
        </div>
      </form>
    </div>
  );
}
