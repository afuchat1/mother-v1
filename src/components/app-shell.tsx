'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContext } from 'react';
import { AppContext } from '@/lib/context.tsx';
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

const navItems = [
  { href: '/app/chat', icon: Home, label: 'Home' },
  { href: '/app/mall', icon: Store, label: 'Shop' },
  { href: '/app/ai-chat', icon: Bot, label: 'AI' },
  { href: '/app/profile', icon: User, label: 'Account' },
];

function BottomNavbar({ activePath, handleNavClick }: { activePath: string, handleNavClick: (href: string) => void }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background h-16 flex items-center justify-around z-20">
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
  
  if (!context) return null;
  
  const { cart, activeChat, setActiveChat } = context;

  const handleNavClick = (href: string) => {
    if (href === '/app/chat') {
        setActiveChat(null);
    }
    router.push(href);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activePath = pathname;
  
  // An active chat is present if the context has one AND we are on a relevant chat page.
  const isChatPage = activePath.startsWith('/app/chat') || activePath.startsWith('/app/ai-chat');
  const isChatActive = isChatPage && activeChat;

  // The bottom nav should be hidden ONLY when a chat is active.
  const showBottomNav = !isChatActive;
  const showCartFab = showBottomNav && (activePath.startsWith('/app/mall') || activePath.startsWith('/app/cart') || activePath.startsWith('/app/checkout'));

  return (
    <div className={cn("h-[100dvh] w-full bg-background flex flex-col")}>
        <main className={cn(
          "flex-1",
          // The main content area should be scrollable by default
          "overflow-y-auto",
          // When the bottom nav is shown, add padding to avoid content being hidden behind it
          showBottomNav ? "pb-16" : "" ,
          // When a chat is active, we use a flex layout to contain the header/footer
          isChatActive ? "flex flex-col overflow-hidden" : ""
        )}>
            {children}
        </main>
        {showBottomNav && <BottomNavbar activePath={activePath} handleNavClick={handleNavClick} />}
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
