'use client';
import { useState } from 'react';
import type { Chat } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { chats as allChats } from '@/lib/data';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeChat, setActiveChat] = useState<Chat | null>(allChats[1]);

  return (
      <AppShell activeChat={activeChat} setActiveChat={setActiveChat}>
        {children}
      </AppShell>
  );
}
