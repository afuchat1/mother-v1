'use client';
import { useState } from 'react';
import type { Chat } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { chats as allChats } from '@/lib/data';
import { AppContext } from '@/lib/context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  return (
    <AppContext.Provider value={{ activeChat, setActiveChat }}>
      <AppShell>
        {children}
      </AppShell>
    </AppContext.Provider>
  );
}
