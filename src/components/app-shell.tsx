'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContext } from 'react';
import { AppContext } from '@/lib/context';
import { cn } from '@/lib/utils';
import {
  Home,
  Store,
  Bot,
  User,
  ShoppingCart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { chats } from '@/lib/data';

const navItems = [
  { href: '/app/chat', icon: Home, label: 'Home' },
  { href: '/app/mall', icon: Store, label: 'Shop' },
  { href: '/app/ai-chat', icon: Bot, label: 'AI' },
  { href: '/app/profile', icon: User, label: 'Account' },
];

function BottomNavbar({ activePath, handleNavClick }: { activePath: string, handleNavClick: (href: string) => void }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background h-16 flex items-center justify-around">
            {navItems.map((item) => {
                 const isActive = activePath.startsWith(item.href);
                
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                };

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleClick}
                        className="flex flex-1 flex-col items-center justify-center gap-1 text-xs h-full"
                    >
                        <div className="relative flex flex-col items-center gap-1">
                            <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const context = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();
  
  if (!context) return null; // Or a loading skeleton
  
  const { cart, activeChat, setActiveChat } = context;

  const handleNavClick = (href: string) => {
    if (href === '/app/ai-chat') {
        const aiChat = chats.find(c => c.type === 'ai');
        router.push('/app/chat');
        if (aiChat) setActiveChat(aiChat);
    } else if (href === '/app/chat') {
        if(activeChat?.type === 'ai') setActiveChat(null);
        router.push(href);
    }
    else {
        router.push(href);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Determine active path, treating AI chat as a special case for highlighting
  const activePath = pathname === '/app/chat' && activeChat?.type === 'ai' ? '/app/ai-chat' : pathname;

  const showCartFab = activePath.startsWith('/app/mall') || activePath.startsWith('/app/cart') || activePath.startsWith('/app/checkout');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <main className="flex-1 pb-16">
            {children}
        </main>
        <BottomNavbar activePath={activePath} handleNavClick={handleNavClick} />
        {showCartFab && cartItemCount > 0 && (
            <Link href="/app/cart" className="fixed bottom-20 right-4 z-20">
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <ShoppingCart className="h-6 w-6" />
                    <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full bg-destructive text-destructive-foreground p-0">{cartItemCount}</Badge>
                </Button>
            </Link>
        )}
    </div>
  );
}
