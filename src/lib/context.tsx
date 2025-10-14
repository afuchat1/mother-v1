'use client';
import { createContext, useState, useEffect, ReactNode } from 'react';
import type { Chat, CartItem, Product, Message } from '@/lib/types';
import type { User } from 'firebase/auth';

// App Context
type AppContextType = {
  currentUser: User | null;
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  // These are now no-ops as data is fetched from Firebase directly in components.
  // Kept to avoid prop-drilling and extensive refactoring of components that don't need to be Firebase-aware.
  chats: Chat[];
  products: Product[];
  addMessageToChat: (chatId: string, message: Message) => void;
  updateMessageInChat: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  addProduct: (product: Omit<Product, 'id' | 'seller' | 'imageUrl'>) => void;
};

export const AppContext = createContext<AppContextType | null>(null);


// Theme Context
type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
