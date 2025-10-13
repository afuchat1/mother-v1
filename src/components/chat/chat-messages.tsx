'use client';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Play, Reply, Video } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

type ChatMessagesProps = {
  messages: Message[];
  onReply: (message: Message) => void;
};

const VoiceMessagePlayer = ({ url }: { url: string }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (audio.duration > 0) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            setIsPlaying(!isPlaying);
        }
    };
    
    const formatDuration = (seconds: number) => {
        if (isNaN(seconds) || seconds === 0) return "0:00";
        const floorSeconds = Math.floor(seconds);
        const minutes = Math.floor(floorSeconds / 60);
        const remainingSeconds = floorSeconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className="flex items-center gap-2 text-primary-foreground">
            <audio ref={audioRef} src={url} preload="metadata" />
            <button onClick={togglePlay} className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-foreground/20 text-primary-foreground">
                <Play className={cn("h-4 w-4", isPlaying ? 'hidden' : 'block')} />
                 <div className={cn("h-3 w-3 bg-primary-foreground rounded-sm", isPlaying ? 'block' : 'hidden')}></div>
            </button>
            <div className="flex-1 h-1 bg-primary-foreground/30 rounded-full">
                <div 
                    className="h-1 bg-primary-foreground rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <span className="text-xs w-10 text-primary-foreground/80">{formatDuration(duration)}</span>
        </div>
    );
};

const VideoMessagePlayer = ({ url }: { url: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => setIsPlaying(false);
        video.addEventListener('ended', handleEnded);

        return () => video.removeEventListener('ended', handleEnded);
    }, []);


    return (
        <div className="relative w-64 h-64 rounded-lg overflow-hidden cursor-pointer" onClick={togglePlay}>
            <video ref={videoRef} src={url} className="w-full h-full object-cover" playsInline />
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/30 backdrop-blur-sm">
                       <Play className="h-6 w-6 text-white" />
                    </div>
                </div>
            )}
        </div>
    );
}

const ReplyMessagePreview = ({ message }: { message: Message }) => {
    let previewText = message.text;
    if (message.voiceUrl) previewText = 'Voice message';
    if (message.videoUrl) previewText = 'Video message';

    return (
        <div className="p-2 border-l-2 border-primary/50 bg-secondary/30 rounded-md mb-2 opacity-80 text-xs">
            <p className="font-semibold text-primary">{message.sender.name}</p>
            <p className="text-muted-foreground truncate">{previewText}</p>
        </div>
    );
};

const SwipeToReply = ({
  children,
  onReply,
  isCurrentUser
}: {
  children: React.ReactNode;
  onReply: () => void;
  isCurrentUser: boolean;
}) => {
  const [touchStartX, setTouchStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const swipeThreshold = 60; // How far user needs to swipe

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX;
    
    if ((isCurrentUser && diff < 0) || (!isCurrentUser && diff > 0)) {
        const newTranslateX = Math.min(Math.abs(diff), swipeThreshold + 20) * (isCurrentUser ? -1 : 1);
        setTranslateX(newTranslateX);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(translateX) > swipeThreshold) {
      onReply();
    }
    setTranslateX(0);
    setTouchStartX(0);
  };

  return (
    <div className="relative w-full">
      <div className="absolute top-0 bottom-0 h-full flex items-center" style={isCurrentUser ? { right: '100%' } : { left: '100%' }}>
         <Reply className={cn("h-5 w-5 text-muted-foreground transition-opacity", Math.abs(translateX) > swipeThreshold / 2 ? 'opacity-100' : 'opacity-0')} />
      </div>
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${translateX}px)`, transition: 'transform 0.1s ease-out' }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
};


export default function ChatMessages({ messages, onReply }: ChatMessagesProps) {
  return (
      <div className="p-4">
        <div className="flex flex-col gap-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender.id === currentUser.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                    <Avatar className="h-8 w-8 self-end">
                        <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                <div className={cn("max-w-[80%]", isCurrentUser ? "ml-auto" : "mr-auto")}>
                 <SwipeToReply onReply={() => onReply(message)} isCurrentUser={isCurrentUser}>
                    <div
                        className={cn(
                            "relative rounded-xl shadow-sm group cursor-pointer",
                            isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-secondary text-secondary-foreground rounded-bl-none",
                            message.voiceUrl || message.videoUrl ? "p-2" : "p-3",
                             message.imageUrl ? "p-0 overflow-hidden" : ""
                        )}
                    >
                        <div className={cn("absolute w-3 h-3 -bottom-[1px] transform z-[-1]", message.imageUrl && "hidden")}
                            style={{
                                clipPath: 'path("M 0 12 C 4.666666666666666 12 8.333333333333332 8.666666666666666 10 5 C 10.666666666666666 3.333333333333333 11.333333333333332 1.6666666666666667 12 0 L 12 12 L 0 12 Z")',
                                ...isCurrentUser ? { right: '-5px', transform: 'scaleX(-1)' } : { left: '-5px' }
                            }}
                        >
                            <div className={cn("w-full h-full", isCurrentUser ? "bg-primary" : "bg-secondary")}></div>
                        </div>
                    
                    <div className={cn(message.imageUrl && "p-3")}>
                        {!isCurrentUser && message.sender.name && <p className="mb-1 text-xs font-semibold text-primary">{message.sender.name}</p>}
                        {message.replyTo && <ReplyMessagePreview message={message.replyTo} />}
                    </div>

                    {message.imageUrl && (
                        <Image 
                        src={message.imageUrl} 
                        alt="chat image" 
                        width={400} 
                        height={300} 
                        className="mb-1"
                        data-ai-hint="scenery photo"
                        />
                    )}

                    {message.videoUrl && (
                        <VideoMessagePlayer url={message.videoUrl} />
                    )}

                    {message.voiceUrl ? (
                        <div className='w-64 max-w-full'>
                            <VoiceMessagePlayer url={message.voiceUrl} />
                        </div>
                    ) : (
                        message.text && <p className={cn('whitespace-pre-wrap break-words text-sm', message.imageUrl && 'p-3')}>{message.text}</p>
                    )}
                    
                    <div className={cn("flex items-end gap-2", message.voiceUrl && 'mt-1', message.imageUrl && 'p-3' )}>
                        <div className="flex-1" />
                        <p className={cn("text-xs shrink-0", isCurrentUser ? "text-primary-foreground/70" : "text-secondary-foreground/70")}>{message.createdAt}</p>
                    </div>
                   
                    </div>
                </SwipeToReply>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
