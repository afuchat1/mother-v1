'use client';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Play } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

type ChatMessagesProps = {
  messages: Message[];
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
        <div className="flex items-center gap-2">
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
            <span className="text-xs w-10">{formatDuration(duration)}</span>
        </div>
    );
};


export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-2">
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
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "relative max-w-lg rounded-xl p-2 px-3 shadow-sm",
                     isCurrentUser
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-secondary-foreground rounded-bl-none"
                  )}
                >
                  {!isCurrentUser && <p className="mb-1 text-xs font-semibold text-primary">{message.sender.name}</p>}
                  
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

                  {message.voiceUrl ? (
                    <div className='w-64'>
                        <VoiceMessagePlayer url={message.voiceUrl} />
                    </div>
                  ) : (
                     <p className='whitespace-pre-wrap text-sm'>{message.text}</p>
                  )}
                  
                  <div className={cn("flex items-end gap-2", message.voiceUrl && 'mt-1' )}>
                     <div className="flex-1" />
                     <p className={cn("text-xs shrink-0", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{message.createdAt}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
