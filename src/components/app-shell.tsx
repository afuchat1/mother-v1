'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useContext } from 'react';
import { AppContext } from '@/lib/context';
import { chats as allChats } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Store,
  GraduationCap,
  Bot,
  User,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { currentUser } from '@/lib/data';

const navItems = [
  { href: '/app/chat', icon: MessageSquare, label: 'Chats' },
  { href: '/app/mall', icon: Store, label: 'AfuMall' },
  { href: '/app/learn', icon: GraduationCap, label: 'AfuLearn' },
  { href: '#', icon: Bot, label: 'AI', isAi: true },
  { href: '/app/profile', icon: User, label: 'Profile' },
];

function BottomNavbar() {
    const pathname = usePathname();
    const context = useContext(AppContext);

    if (!context) return null;

    const { activeChat, setActiveChat } = context;

    const handleAiChatClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const aiChat = allChats.find(c => c.type === 'ai');
        if (aiChat) {
            setActiveChat(aiChat);
            // If not on chat page, maybe navigate? For now, just setting active.
            // router.push('/app/chat');
        }
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => {
                    const isActive = item.isAi 
                        ? activeChat?.type === 'ai' 
                        : item.href !== '#' && pathname.startsWith(item.href);

                    const linkContent = (
                        <>
                            <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className="sr-only">{item.label}</span>
                        </>
                    );

                    if (item.isAi) {
                        return (
                            <button 
                                key={item.label}
                                onClick={handleAiChatClick}
                                className="flex flex-col items-center justify-center gap-1 text-xs"
                            >
                                {linkContent}
                            </button>
                        );
                    }
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 text-xs"
                            )}
                        >
                            {linkContent}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 pb-16">
            {children}
        </main>
        <BottomNavbar />
    </div>
  );
}
