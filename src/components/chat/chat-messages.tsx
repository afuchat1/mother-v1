'use client';
import Image from 'next/image';
import React from 'react';
import type { Message, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Play, Reply, Video, Check, CheckCheck } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ChatAvatar } from './chat-avatar';
import { format } from 'date-fns';


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
        <div className="relative w-48 h-48 rounded-lg overflow-hidden cursor-pointer" onClick={togglePlay}>
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
    const { firestore } = useFirebase();
    const senderRef = doc(firestore, 'users', message.senderId);
    const { data: sender } = useDoc<UserProfile>(senderRef);

    let previewText = message.text;
    if (message.voiceUrl) previewText = '🎤 Voice message';
    if (message.videoUrl) previewText = '📹 Video message';
    if (message.imageUrl) previewText = '📷 Image';


    return (
        <div className="p-2 border-l-2 border-primary/50 bg-secondary/30 rounded-md mb-2 opacity-80 text-xs">
            <p className="font-semibold text-primary">{sender?.name}</p>
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
  const swipeThreshold = 60;

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


const MessageBubble = React.memo(function MessageBubble({ message, onReply, isLastFromSender, isFirstFromSender }: { message: Message, onReply: (message: Message) => void, isLastFromSender: boolean, isFirstFromSender: boolean }) {
    const { user, firestore } = useFirebase();
    const isCurrentUser = message.senderId === user?.uid;
    const { data: sender, isLoading: senderLoading } = useDoc<UserProfile>(
        firestore && message.senderId ? doc(firestore, 'users', message.senderId) : null
    );

    if (senderLoading) {
        return null;
    }

    const senderName = sender?.name || '...';
    const messageTimestamp = message.timestamp ? format((message.timestamp as any).toDate(), 'p') : '';

    return (
        <div
        className={cn(
          "flex items-end gap-2",
          isCurrentUser ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn("max-w-[80%]", isCurrentUser ? "ml-auto" : "mr-auto")}>
         <SwipeToReply onReply={() => onReply(message)} isCurrentUser={isCurrentUser}>
            <div
                className={cn(
                    "relative shadow-sm group cursor-pointer text-sm",
                    "px-3 py-2",
                    isCurrentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                    isFirstFromSender && (isCurrentUser ? "rounded-t-lg rounded-bl-lg" : "rounded-t-lg rounded-br-lg"),
                    !isFirstFromSender && (isCurrentUser ? "rounded-l-lg" : "rounded-r-lg"),
                    isLastFromSender && (isCurrentUser ? "rounded-bl-lg" : "rounded-br-lg"),
                    message.voiceUrl ? "p-2" : "",
                    message.videoUrl ? "p-0 bg-transparent shadow-none" : "",
                    message.imageUrl ? "p-0" : ""
                )}
            >
            {message.imageUrl && <div className="p-2 pt-1"><ReplyContent message={message}/></div>}
            
            {(isFirstFromSender && !isCurrentUser) && <p className="mb-1 text-xs font-semibold text-primary">{senderName}</p>}
            
            {!message.imageUrl && <ReplyContent message={message} />}

            {message.imageUrl && (
                <Image 
                src={message.imageUrl} 
                alt="chat image" 
                width={400} 
                height={300} 
                className="mb-1 rounded-lg"
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
                message.text && <p className='whitespace-pre-wrap break-words'>{message.text}</p>
            )}
            
            <div className={cn("flex items-end gap-1.5 justify-end -mb-1 -mr-1.5", message.imageUrl && "absolute bottom-1 right-2 bg-black/40 text-white rounded-full px-2 py-0.5" )}>
                <span className={cn("text-xs", isCurrentUser ? "text-primary-foreground/70" : "text-secondary-foreground/70")}>{messageTimestamp}</span>
                {isCurrentUser && <CheckCheck className={cn("h-4 w-4", isCurrentUser ? "text-primary-foreground/70" : "text-blue-500")} />}
            </div>
           
            </div>
        </SwipeToReply>
        </div>
      </div>
    );
});

const ReplyContent = ({ message }: { message: Message }) => {
    if (!message.replyTo) return null;
    return <ReplyMessagePreview message={message.replyTo} />;
};


type ChatMessagesProps = {
    messages: Message[];
    onReply: (message: Message) => void;
};
  
const ChatMessages = React.memo(function ChatMessages({ messages, onReply }: ChatMessagesProps) {
    return (
        <div className="p-4">
          <div className="flex flex-col gap-1">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const nextMessage = messages[index + 1];
              const isLastFromSender = !nextMessage || nextMessage.senderId !== message.senderId;
              const isFirstFromSender = !prevMessage || prevMessage.senderId !== message.senderId;

              return (
                <MessageBubble 
                    key={message.id} 
                    message={message} 
                    onReply={onReply}
                    isLastFromSender={isLastFromSender}
                    isFirstFromSender={isFirstFromSender}
                 />
              )
            })}
          </div>
        </div>
    );
});

export default ChatMessages;
