'use client';
import { useState, useEffect } from 'react';
import type { Chat, Product, CartItem, Message } from '@/lib/types';
import AppShell from '@/components/app-shell';
import { chats as initialChats, products as initialProducts, currentUser } from '@/lib/data';
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
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          // Create a new messages array with the new message
          const updatedMessages = [...chat.messages, message];
          // Return a new chat object with the updated messages
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      })
    );
  };
  
  const updateMessageInChat = (chatId: string, messageId: string, updates: Partial<Message>) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map(msg =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          };
        }
        return chat;
      })
    );
  };

  const addProduct = (newProductData: Omit<Product, 'id' | 'seller' | 'imageUrl'>) => {
    setProducts(prevProducts => {
       const newProduct: Product = {
        id: `p${prevProducts.length + 1}`,
        ...newProductData,
        imageUrl: 'https://picsum.photos/seed/newproduct/300/200',
        seller: currentUser,
      };
      return [newProduct, ...prevProducts];
    });
  };

  useEffect(() => {
    // This logic determines which chat should be active based on the URL.
    // And handles clearing the active chat when navigating away from chat pages.
    const chatPathRegex = /^\/app\/chat\/(chat\d+)$/;
    const match = pathname.match(chatPathRegex);
    
    if (match) {
       const chatId = match[1];
       const foundChat = chats.find(c => c.id === chatId);
       if (foundChat && (!activeChat || activeChat.id !== foundChat.id)) {
           setActiveChat(foundChat);
       }
    } else if (pathname === '/app/chat' || pathname.startsWith('/app/ai-chat')) {
        if (activeChat) {
            setActiveChat(null);
        }
    } else if (!pathname.startsWith('/app/chat/')) {
        if (activeChat) {
            setActiveChat(null);
        }
    }
  }, [pathname, chats, activeChat]);

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
    activeChat,
    setActiveChat,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    chats,
    products,
    addMessageToChat,
    updateMessageInChat,
    addProduct
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <AppShell>
        {children}
      </AppShell>
    </AppContext.Provider>
  );
}
