'use client';
import { useState, useEffect } from 'react';
import type { Chat, Product, CartItem, Message } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { AppContext } from '@/lib/context.tsx';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isUserLoading, router]);

  useEffect(() => {
    const chatPathRegex = /^\/app\/chat\/(chat\d+)$/;
    const match = pathname.match(chatPathRegex);
    
    if (!match) {
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

  const appContextValue = {
    currentUser,
    activeChat,
    setActiveChat,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    chats: [], 
    products: [],
    addMessageToChat: () => {},
    updateMessageInChat: () => {},
    addProduct: () => {},
  };

  if (isUserLoading || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
      <AppContext.Provider value={appContextValue}>
        <AppShell>
          {children}
        </AppShell>
      </AppContext.Provider>
  );
}
