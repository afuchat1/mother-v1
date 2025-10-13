'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContext } from 'react';
import { AppContext } from '@/lib/context';
import { chats as allChats } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Home,
  Store,
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
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/app/chat', icon: Home, label: 'Home' },
  { href: '/app/mall', icon: Store, label: 'Shop' },
  { href: '#', icon: Bot, label: 'AI', isAi: true },
  { href: '/app/profile', icon: User, label: 'Account' },
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
                        <div className="relative flex flex-col items-center gap-1">
                            <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-xs", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                        </div>
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
                            <span>{item.label}</span>
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
                 <div
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground"
                    )}
                >
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{currentUser.name}</span>
                </div>
            </div>
        </aside>
    );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const context = useContext(AppContext);
  if (!context) return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DesktopSidebar />
        <main className="flex-1 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNavbar />
    </div>
  );

  const { cart } = context;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DesktopSidebar />
        <main className="flex-1 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNavbar />
        {cartItemCount > 0 && (
            <Link href="/app/cart" className="md:hidden fixed bottom-20 right-4 z-20">
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
                    <Store className="h-6 w-6" />
                    <Badge variant="destructive" className="absolute top-0 right-0 h-6 w-6 justify-center rounded-full p-0">{cartItemCount}</Badge>
                </Button>
            </Link>
        )}
    </div>
  );
}
