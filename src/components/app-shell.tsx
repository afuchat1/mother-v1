'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { AfuChatLogo } from '@/components/icons';
import { currentUser } from '@/lib/data';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

const navItems = [
  { href: '/app/chat', icon: MessageSquare, label: 'Chats' },
  { href: '/app/mall', icon: Store, label: 'AfuMall' },
  { href: '#', icon: Bot, label: 'AI', isAi: true },
];

function BottomNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) return null;

    const { activeChat, setActiveChat } = context;

    const handleAiChatClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const aiChat = allChats.find(c => c.type === 'ai');
        if (aiChat) {
            setActiveChat(aiChat);
            if (pathname !== '/app/chat') {
                router.push('/app/chat');
            }
        }
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => {
                    const isAiActive = item.isAi && activeChat?.type === 'ai' && pathname.startsWith('/app/chat');
                    const isLinkActive = !item.isAi && item.href !== '#' && pathname.startsWith(item.href);
                    const isActive = isAiActive || isLinkActive;

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
                            className="flex flex-col items-center justify-center gap-1 text-xs"
                        >
                            {linkContent}
                        </Link>
                    );
                })}
                 <Link href="/app/profile" className="flex flex-col items-center justify-center gap-1 text-xs">
                    <Avatar className="h-7 w-7 border">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <span className="sr-only">Profile</span>
                 </Link>
            </div>
        </nav>
    );
}

function DesktopSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const context = useContext(AppContext);

    if (!context) return null;

    const { activeChat, setActiveChat } = context;

    const handleAiChatClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const aiChat = allChats.find(c => c.type === 'ai');
        if (aiChat) {
            setActiveChat(aiChat);
             if (pathname !== '/app/chat') {
                router.push('/app/chat');
            }
        }
    }

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:bg-background">
            <div className="flex h-16 items-center border-b px-6">
                 <Link href="/app/chat" className="flex items-center gap-2 font-semibold">
                    <AfuChatLogo className="h-6 w-6" />
                    <span className="font-headline">AfuChat</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => {
                    const isAiActive = item.isAi && activeChat?.type === 'ai' && pathname.startsWith('/app/chat');
                    const isLinkActive = !item.isAi && item.href !== '#' && pathname.startsWith(item.href);
                    const isActive = isAiActive || isLinkActive;

                     const linkContent = (
                        <>
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </>
                    );

                    if (item.isAi) {
                         return (
                            <button 
                                key={item.label}
                                onClick={handleAiChatClick}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
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
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                            )}
                        >
                           {linkContent}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto p-4 border-t">
                 <Link
                    href="/app/profile"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        pathname.startsWith('/app/profile') ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                >
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{currentUser.name}</span>
                </Link>
            </div>
        </aside>
    );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DesktopSidebar />
        <main className="flex-1 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNavbar />
    </div>
  );
}
