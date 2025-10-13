export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  productsSold?: Product[];
};

export type Message = {
  id: string;
  text: string;
  createdAt: string;
  sender: User;
  imageUrl?: string;
  voiceUrl?: string;
  videoUrl?: string;
  replyTo?: Message;
};

export type Chat = {
  id: string;
  type: 'dm' | 'group' | 'ai';
  name: string;
  avatarUrl?: string;
  members?: User[];
  messages: Message[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  seller: User;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
