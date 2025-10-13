'use client';
import { createContext } from 'react';
import type { Chat, CartItem } from '@/lib/types';

type AppContextType = {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);
