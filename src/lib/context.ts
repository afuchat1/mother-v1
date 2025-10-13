'use client';
import { createContext } from 'react';
import type { Chat } from '@/lib/types';

type AppContextType = {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
};

export const AppContext = createContext<AppContextType | null>(null);
