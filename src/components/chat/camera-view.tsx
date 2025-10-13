'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CameraViewProps = {
  onCapture: (file: File) => void;
  onClose: () => void;
};

export default function CameraView({ onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      cleanupStream();
    };
  }, [toast, cleanupStream]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        cleanupStream(); // Stop camera after capture
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Restart camera
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        // handle error
      }
    };
    getCameraPermission();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
        });
    }
  };

  const handleClose = () => {
      cleanupStream();
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:text-white hover:bg-white/20 rounded-full">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative w-full h-full">
        {hasCameraPermission === false && (
           <div className="w-full h-full flex items-center justify-center p-4">
             <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
            </Alert>
           </div>
        )}
        
        <video
          ref={videoRef}
          className={cn("w-full h-full object-cover", capturedImage ? "hidden" : "block")}
          autoPlay
          playsInline
          muted
        />

        {capturedImage && (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {hasCameraPermission && (
         <div className="absolute bottom-8 flex items-center justify-center gap-12">
            {capturedImage ? (
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
                        onClick={handleConfirm}
                    >
                        <Check className="h-8 w-8" />
                    </Button>
              </>
            ) : (
                <Button
                    size="lg"
                    className="rounded-full h-20 w-20 p-0 border-4 border-white/50 bg-transparent hover:bg-white/20"
                    onClick={handleCapture}
                    aria-label="Take picture"
                >
                    <div className="h-16 w-16 rounded-full bg-white"></div>
                </Button>
            )}
         </div>
      )}
    </div>
  );
}
