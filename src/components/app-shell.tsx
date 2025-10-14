'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContext } from 'react';
import { AppContext } from '@/lib/context.tsx';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Store,
  Bot,
  User,
  ShoppingCart,
  Menu,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '@/firebase';

const menuItems = [
  { href: '/app/mall', icon: Store, label: 'AfuMall' },
  { href: '/app/ai-chat', icon: Bot, label: 'AfuAi Assistant' },
  { href: '/app/profile', icon: User, label: 'My Profile' },
];

function SideMenu() {
    const { user } = useUser();
    
    return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
          <SheetHeader className="p-4 border-b text-left bg-secondary">
             {user && (
                <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <SheetTitle className="font-headline">{user.displayName}</SheetTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
             )}
          </SheetHeader>
          <nav className="p-4">
            <ul>
              {menuItems.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center gap-4 p-3 rounded-md hover:bg-accent">
                    <item.icon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-lg font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
      </SheetContent>
    </Sheet>
    )
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
  
  const isChatView = activePath.startsWith('/app/chat/') && activeChat;
  const isChatList = activePath === '/app/chat';
  const showFab = isChatList;

  const showCartFab = (activePath.startsWith('/app/mall') || activePath.startsWith('/app/cart') || activePath.startsWith('/app/checkout'));

  return (
    <div className={cn("h-[100dvh] w-full bg-background flex flex-col")}>
        {isChatList && (
             <header className="flex shrink-0 items-center justify-between gap-2 border-b bg-background p-2">
                <SideMenu />
                <h1 className="text-xl font-bold font-headline">Chats</h1>
                <div className="w-10"></div>
             </header>
        )}
        <main className={cn(
          "flex-1",
          isChatList ? "overflow-y-auto" : "flex flex-col overflow-hidden"
        )}>
            {children}
        </main>
        {showFab && (
             <Button size="icon" className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageCircle className="h-7 w-7" />
            </Button>
        )}
        {showCartFab && cartItemCount > 0 && (
            <Link href="/app/cart" className="fixed bottom-6 right-6 z-20">
                <Button size="icon" className="rounded-full h-14 w-14 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <ShoppingCart className="h-6 w-6" />
                    <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center rounded-full bg-destructive text-destructive-foreground p-0">{cartItemCount}</Badge>
                </Button>
            </Link>
        )}
    </div>
  );
}
