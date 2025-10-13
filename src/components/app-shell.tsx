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
import { currentUser } from '@/lib/data';
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

function BottomNavbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => {
                    // Special handling for AI chat to be active on /app/chat
                    const isAiChatActive = item.href === '/app/ai-chat' && pathname === '/app/chat';
                    // Regular active check for other items
                    const isRegularActive = item.href !== '/app/ai-chat' && pathname.startsWith(item.href);
                    
                    const isActive = isAiChatActive || isRegularActive;

                    return (
                        <Link
                            key={item.href}
                            href={item.href === '/app/ai-chat' ? '/app/chat' : item.href}
                            className="flex flex-1 flex-col items-center justify-center gap-1 text-xs h-full"
                        >
                            <div className="relative flex flex-col items-center gap-1">
                                <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

function DesktopSidebar() {
    const pathname = usePathname();

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
                    const isAiChatActive = item.href === '/app/ai-chat' && pathname === '/app/chat';
                    const isRegularActive = item.href !== '/app/ai-chat' && pathname.startsWith(item.href);

                    const isActive = isAiChatActive || isRegularActive;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href === '/app/ai-chat' ? '/app/chat' : item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            )}
                        >
                           <item.icon className="h-5 w-5" />
                           <span>{item.label}</span>
                        </Link>
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

  if (!context) return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DesktopSidebar />
        <main className="flex-1 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNavbar />
    </div>
  );
  
  const { cart, activeChat, setActiveChat } = context;

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const showCartFab = pathname.startsWith('/app/mall') || pathname.startsWith('/app/cart') || pathname.startsWith('/app/checkout');


  return (
    <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <DesktopSidebar />
        <main className="flex-1 pb-16 md:pb-0">
            {children}
        </main>
        <BottomNavbar />
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

// Since we are using a client component, we need to add this to get the chats from the context
import { chats as allChats } from '@/lib/data';
