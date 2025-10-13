'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { AppContext } from '@/lib/context';
import { cn } from '@/lib/utils';
import {
  Home,
  Store,
  Bot,
  User,
  ShoppingCart,
} from 'lucide-react';
import { AfuChatLogo } from '@/components/icons';
import { currentUser, chats as allChats } from '@/lib/data';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/app/chat', icon: Home, label: 'Home' },
  { href: '/app/mall', icon: Store, label: 'Shop' },
  { href: '/app/ai-chat', icon: Bot, label: 'AI' },
  { href: '/app/profile', icon: User, label: 'Account' },
];

function NavItem({ item, isActive, onClick, isDesktop }: { item: typeof navItems[0], isActive: boolean, onClick: (href: string) => void, isDesktop: boolean }) {
    const isAiChat = item.href === '/app/ai-chat';
    const effectiveHref = isAiChat ? '/app/chat' : item.href;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onClick(item.href);
    };

    if (isDesktop) {
        return (
             <Link
                href={effectiveHref}
                onClick={handleClick}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                )}
            >
               <item.icon className="h-5 w-5" />
               <span>{item.label}</span>
            </Link>
        )
    }

    return (
        <Link
            href={effectiveHref}
            onClick={handleClick}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-xs h-full"
        >
            <div className="relative flex flex-col items-center gap-1">
                <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
            </div>
        </Link>
    );
}

function BottomNavbar({ activePath, handleNavClick }: { activePath: string, handleNavClick: (href: string) => void }) {
    const context = useContext(AppContext);
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => {
                     const isAiChatActive = item.href === '/app/ai-chat' && activePath === '/app/chat' && context?.activeChat?.type === 'ai';
                     const isHomeActive = item.href === '/app/chat' && activePath === '/app/chat' && context?.activeChat?.type !== 'ai';
                     const isOtherActive = item.href !== '/app/chat' && item.href !== '/app/ai-chat' && activePath.startsWith(item.href);
                     const isActive = isAiChatActive || isHomeActive || isOtherActive;

                    return <NavItem key={item.href} item={item} isActive={isActive} onClick={handleNavClick} isDesktop={false} />;
                })}
            </div>
        </nav>
    );
}

function DesktopSidebar({ activePath, handleNavClick }: { activePath: string, handleNavClick: (href: string) => void }) {
    const context = useContext(AppContext);
    return (
        <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:bg-sidebar">
            <div className="flex h-16 items-center border-b px-6">
                 <Link href="/app/chat" className="flex items-center gap-2 font-semibold">
                    <AfuChatLogo className="h-6 w-6" />
                    <span className="font-headline">AfuChat</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {navItems.map((item) => {
                    const isAiChatActive = item.href === '/app/ai-chat' && activePath === '/app/chat' && context?.activeChat?.type === 'ai';
                    const isHomeActive = item.href === '/app/chat' && activePath === '/app/chat' && context?.activeChat?.type !== 'ai';
                    const isOtherActive = item.href !== '/app/chat' && item.href !== '/app/ai-chat' && activePath.startsWith(item.href);
                    const isActive = isAiChatActive || isHomeActive || isOtherActive;

                    return (
                        <NavItem key={item.href} item={item} isActive={isActive} onClick={handleNavClick} isDesktop={true} />
                    );
                })}
            </nav>
            <div className="mt-auto p-4 border-t border-sidebar-border">
                 <div
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground"
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
  const pathname = usePathname();
  const router = useRouter();
  
  if (!context) return null; // Or a loading skeleton
  
  const { cart, setActiveChat, activeChat } = context;

  const handleNavClick = (href: string) => {
    if (href === '/app/ai-chat') {
        const aiChat = allChats.find(c => c.type === 'ai');
        if (aiChat) {
            setActiveChat(aiChat);
            router.push('/app/chat');
        }
    } else if (href === '/app/chat') {
        const firstChat = allChats.find(c => c.type !== 'ai');
        if (firstChat && activeChat?.id !== firstChat.id) {
            setActiveChat(firstChat);
        }
        router.push('/app/chat');
    } else {
        router.push(href);
    }
  };

  useEffect(() => {
    if (pathname === '/app/chat' && !activeChat) {
        const defaultChat = allChats.find(c => c.type !== 'ai');
        if (defaultChat) {
            setActiveChat(defaultChat);
        }
    }
  }, [pathname, activeChat, setActiveChat]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const showCartFab = pathname.startsWith('/app/mall') || pathname.startsWith('/app/cart') || pathname.startsWith('/app/checkout');


  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DesktopSidebar activePath={pathname} handleNavClick={handleNavClick} />
        <main className="flex-1 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNavbar activePath={pathname} handleNavClick={handleNavClick} />
        {showCartFab && cartItemCount > 0 && (
            <Link href="/app/cart" className="md:hidden fixed bottom-20 right-4 z-20">
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <ShoppingCart className="h-6 w-6" />
                    <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full bg-destructive text-destructive-foreground p-0">{cartItemCount}</Badge>
                </Button>
            </Link>
        )}
    </div>
  );
}
