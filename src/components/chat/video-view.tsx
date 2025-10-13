'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, Send, Video, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type VideoViewProps = {
  onRecord: (file: File) => void;
  onClose: () => void;
};

export default function VideoView({ onRecord, onClose }: VideoViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: true 
        });
        streamRef.current = stream;
        setHasPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasPermission(false);
        toast({
          variant: 'destructive',
          title: 'Permissions Denied',
          description: 'Please enable camera and microphone permissions to record video.',
        });
      }
    };

    if (!recordedVideo) {
        getPermissions();
    }

    return () => {
      cleanupStream();
    };
  }, [toast, cleanupStream, recordedVideo]);

  const startRecording = () => {
    if (streamRef.current) {
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        cleanupStream();
      };

      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleRecordButton = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  }

  const handleRetake = () => {
    setRecordedVideo(null);
    setIsRecording(false);
  };

  const handleSend = () => {
    if (recordedVideo) {
      fetch(recordedVideo)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
          onRecord(file);
        });
    }
  };

  const handleClose = () => {
      cleanupStream();
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-20">
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:text-white hover:bg-white/20 rounded-full">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative w-full h-full">
        {hasPermission === false && (
           <div className="w-full h-full flex items-center justify-center p-4">
             <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Camera & Mic Required</AlertTitle>
                <AlertDescription>
                  Please allow camera and microphone access to record a video note.
                </AlertDescription>
            </Alert>
           </div>
        )}
        
        <video
          ref={videoRef}
          className={cn("w-full h-full object-cover", recordedVideo ? "hidden" : "block")}
          autoPlay
          playsInline
          muted
        />

        {recordedVideo && (
            <video src={recordedVideo} className="w-full h-full object-cover" autoPlay loop playsInline />
        )}
      </div>

      {hasPermission && (
         <div className="absolute bottom-8 flex items-center justify-center gap-12 z-20">
            {recordedVideo ? (
                <>
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full bg-white/20 text-white border-white/40 hover:bg-white/30 h-16 w-16 p-0"
                        onClick={handleRetake}
                    >
                        <X className="h-8 w-8" />
                    </Button>
                    <Button
                        size="lg"
                        className="rounded-full bg-primary h-16 w-16 p-0"
                        onClick={handleSend}
                    >
                        <Send className="h-8 w-8" />
                    </Button>
              </>
            ) : (
                <Button
                    size="lg"
                    className={cn(
                        "rounded-full h-20 w-20 p-0 border-4 border-white/50 bg-transparent hover:bg-white/20 transition-all",
                        isRecording && "bg-red-500/50 border-red-500"
                    )}
                    onClick={handleRecordButton}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                    {isRecording ? <Square className="h-8 w-8 text-white" /> : <Video className="h-10 w-10 text-white" />}
                </Button>
            )}
         </div>
      )}
    </div>
  );
}
