'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, X, Trash2, Reply, Camera, Plus, Video } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import CameraView from './camera-view';
import VideoView from './video-view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type ChatInputProps = {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'audio' | 'video'>('audio');

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const onPhotoTaken = (imageFile: File) => {
    if (handleImageFile) {
        handleImageFile(imageFile);
    }
    setShowCamera(false);
  };

  const onVideoRecorded = (videoFile: File) => {
    const videoUrl = URL.createObjectURL(videoFile);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, { videoUrl });
    setShowVideo(false);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (recordingMode === 'video') {
      setShowVideo(true);
      return;
    }
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
    // A simple tap toggles mode, but only if not recording
    if (!isRecording) {
        if (!input && !imagePreview) {
            setRecordingMode(prev => prev === 'audio' ? 'video' : 'audio');
        }
    }
  };

  const handleRecordButtonPress = () => {
    if (input || imagePreview) return;
    
    holdTimeoutRef.current = setTimeout(() => {
        startRecording();
    }, 300); // 0.3-second delay
  };

  const handleRecordButtonRelease = () => {
    if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
  };

  if (showCamera) {
    return <CameraView onCapture={onPhotoTaken} onClose={() => setShowCamera(false)} />;
  }

  if (showVideo) {
    return <VideoView onRecord={onVideoRecorded} onClose={() => setShowVideo(false)} />;
  }


  return (
    <div className="bg-background p-2 border-t">
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
             <div className="flex-1 flex items-center bg-input rounded-md h-10 px-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
               </div>
               <div className="flex-1 text-center text-sm text-muted-foreground">
                 Release to send
               </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-9 w-9" type="button" onClick={cancelRecording}>
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Cancel Recording</span>
                </Button>
             </div>
           ) : (
            <>
              {handleImageChange && handleImageFile && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground h-10 w-10">
                        <Plus className="h-5 w-5" />
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
              <Textarea
                  placeholder="Message"
                  className="flex-1 resize-none bg-input border-0 rounded-md py-2 px-3 h-10 text-base"
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
            {(input || imagePreview ) ? (
                <Button 
                  type="submit"
                  size="icon" 
                  className="shrink-0 bg-primary rounded-md h-10 w-10"
                  disabled={isLoading}
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
            ) : !isRecording ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-muted-foreground h-10 w-10" 
                  type="button" 
                  onClick={handleMicClick}
                  onMouseDown={handleRecordButtonPress}
                  onMouseUp={handleRecordButtonRelease}
                  onTouchStart={handleRecordButtonPress}
                  onTouchEnd={handleRecordButtonRelease}
                  >
                    {recordingMode === 'audio' ? <Mic className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    <span className="sr-only">{recordingMode === 'audio' ? 'Hold to record voice, tap to switch' : 'Hold to record video, tap to switch'}</span>
                </Button>
            ) : null }
        </div>
      </form>
    </div>
  );
}

    