'use client';
import { useState, useEffect } from 'react';
import type { Chat, Product, CartItem } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { chats as allChats } from '@/lib/data';
import { AppContext } from '@/lib/context';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    // On initial load of the chat page, default to the first non-AI chat.
    if (pathname === '/app/chat' && !activeChat) {
        const defaultChat = allChats.find(c => c.type !== 'ai');
        if (defaultChat) {
            setActiveChat(defaultChat);
        }
    }
  }, [pathname]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppContext.Provider value={{ activeChat, setActiveChat, cart, addToCart, removeFromCart, clearCart }}>
      <AppShell>
        {children}
      </AppShell>
    </AppContext.Provider>
  );
}
