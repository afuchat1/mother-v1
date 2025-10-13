'use client';
import { useState, useEffect } from 'react';
import type { Chat, Product, CartItem } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { chats as allChats } from '@/lib/data';
import { AppContext } from '@/lib/context.tsx';
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
    // This logic determines which chat should be active based on the URL.
    // And handles clearing the active chat when navigating away from chat pages.
    if (pathname === '/app/ai-chat') {
        const aiChat = allChats.find(c => c.type === 'ai');
        if (aiChat && activeChat?.id !== aiChat.id) {
            setActiveChat(aiChat);
        }
    } else if (pathname.startsWith('/app/chat/')) {
       // This is where you would load a specific chat based on ID from URL
       // For now, we do nothing to keep the active chat if one is selected
    } else if (pathname === '/app/chat') {
       // When on the main chat list page, no specific chat is active
       // We only clear it if we are on the list view.
       if (activeChat) {
         // Do not clear, so we can navigate back to it.
       }
    } else {
        // If we navigate to a non-chat page, clear the active chat
        if (activeChat) {
            setActiveChat(null);
        }
    }
  }, [pathname, activeChat]);

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
