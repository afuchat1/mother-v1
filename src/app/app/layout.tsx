'use client';
import { useState } from 'react';
import type { Chat } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { chats as allChats } from '@/lib/data';
import { AppContext } from '@/lib/context';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [activeChat, setActiveChat] = useState<Chat | null>(isMobile ? null : allChats[1]);

  return (
    <AppContext.Provider value={{ activeChat, setActiveChat }}>
      <AppShell>
        {children}
      </AppShell>
    </AppContext.Provider>
  );
}
