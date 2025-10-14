import { Timestamp } from "firebase/firestore";

export type UserProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
};

export const aiUser: UserProfile = {
  id: 'ai',
  name: 'AfuAi',
  avatarUrl: 'https://picsum.photos/seed/ai/40/40',
};

export type Message = {
  id: string;
  text: string;
  timestamp: Timestamp;
  senderId: string;
  imageUrl?: string;
  voiceUrl?: string;
  videoUrl?: string;
  replyTo?: Message;
};

export type Chat = {
  id: string;
  type: 'dm' | 'group';
  name: string;
  avatarUrl?: string;
  participantIds?: string[];
  lastMessage?: Message; 
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  seller?: UserProfile; // Denormalized seller info
};

export type CartItem = {
  product: Product;
  quantity: number;
};
