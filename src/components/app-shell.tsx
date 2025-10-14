'use client';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Store,
  Bot,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/app/chat', icon: MessageCircle, label: 'Chats' },
  { href: '/app/mall', icon: Store, label: 'Mall' },
  { href: '/app/ai-chat', icon: Bot, label: 'AfuAi' },
  { href: '/app/profile', icon: User, label: 'Profile' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-[100dvh] w-full bg-background flex flex-col">
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
        
        <nav className="shrink-0 border-t bg-background">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-md text-sm font-medium w-16",
                            pathname.startsWith(item.href)
                            ? "text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <item.icon className="h-6 w-6" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    </div>
  );
}
