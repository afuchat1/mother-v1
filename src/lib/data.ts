import type { User, Chat, Product, Message } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const users: User[] = [
  { id: 'user1', name: 'You', avatarUrl: findImage('avatar1'), bio: 'The protagonist of this app.' },
  { id: 'user2', name: 'Alice', avatarUrl: findImage('avatar2'), bio: 'An aspiring photographer and designer.' },
  { id: 'user3', name: 'Bob', avatarUrl: findImage('avatar3'), bio: 'A craftsman specializing in handmade goods.' },
  { id: 'user4', name: 'Charlie', avatarUrl: findImage('avatar4'), bio: 'A vintage collector and tech enthusiast.' },
  { id: 'user5', name: 'Diana', avatarUrl: findImage('avatar5'), bio: 'A fashion lover and sports enthusiast.' },
  { id: 'user6', name: 'Ethan', avatarUrl: findImage('avatar6'), bio: 'A student and bookworm.' },
];

export const currentUser = users[0];

export const aiUser: User = { id: 'ai', name: 'AfuAi', avatarUrl: findImage('avatarAi') };

export const products: Product[] = [
  { id: 'p1', name: 'Handmade Jewelry', description: 'Beautifully crafted jewelry for every occasion.', price: 49.99, imageUrl: findImage('product1'), seller: users[2] },
  { id: 'p2', name: 'Leather Wallet', description: 'A stylish and durable leather wallet.', price: 79.99, imageUrl: findImage('product2'), seller: users[3] },
  { id: 'p3', name: 'Vintage Camera', description: 'A classic camera for photography enthusiasts.', price: 250.00, imageUrl: findImage('product3'), seller: users[4] },
  { id: 'p4', name: 'Sports Shoes', description: 'Comfortable and high-performance sports shoes.', price: 120.00, imageUrl: findImage('product4'), seller: users[5] },
  { id: 'p5', name: 'Modern Watch', description: 'An elegant watch that combines style and function.', price: 350.00, imageUrl: findImage('product5'), seller: users[1] },
];

// Assign products to users
users[1].productsSold = products.filter(p => p.seller.id === 'user2');
users[2].productsSold = products.filter(p => p.seller.id === 'user2');
users[3].productsSold = products.filter(p => p.seller.id === 'user3');
users[4].productsSold = products.filter(p => p.seller.id === 'user4');
users[5].productsSold = products.filter(p => p.seller.id === 'user5');


const initialMessages: Message[] = [
  { id: 'm1', text: 'Hey Alice! How are you?', createdAt: '10:00 AM', sender: currentUser },
  { id: 'm2', text: 'I am good, thanks! Just checking out AfuChat.', createdAt: '10:01 AM', sender: users[1] },
  { id: 'm3', text: 'Awesome! It is pretty cool.', createdAt: '10:01 AM', sender: currentUser },
  { id: 'm4', text: 'Did you see the new products on AfuMall?', createdAt: '10:02 AM', sender: currentUser, imageUrl: findImage('chatImage1') },
  { id: 'm5', text: 'Wow, looks amazing! I will check it out.', createdAt: '10:03 AM', sender: users[1] },
];

const groupMessages: Message[] = [
    { id: 'gm1', text: 'Hi team, welcome to our business group!', createdAt: 'Yesterday', sender: users[2] },
    { id: 'gm2', text: 'Glad to be here!', createdAt: 'Yesterday', sender: users[3] },
    { id: 'gm3', text: 'Let\'s discuss the Q3 strategy.', createdAt: 'Today', sender: users[2] },
];

export const chats: Chat[] = [
  {
    id: 'chat1',
    type: 'ai',
    name: 'AfuAi',
    avatarUrl: aiUser.avatarUrl,
    messages: [
      { id: 'ai_m1', text: 'Hello! I am AfuAi. How can I help you today?', createdAt: 'Just now', sender: aiUser },
    ],
  },
  {
    id: 'chat2',
    type: 'dm',
    name: 'Alice',
    avatarUrl: users[1].avatarUrl,
    messages: initialMessages,
  },
  {
    id: 'chat3',
    type: 'group',
    name: 'Business Collab',
    avatarUrl: findImage('groupAvatar1'),
    members: [users[0], users[2], users[3]],
    messages: groupMessages,
  },
  {
    id: 'chat4',
    type: 'dm',
    name: 'Bob',
    avatarUrl: users[2].avatarUrl,
    messages: [
      { id: 'm6', text: 'Can we meet tomorrow?', createdAt: '1:30 PM', sender: users[2] },
    ],
  },
  {
    id: 'chat5',
    type: 'group',
    name: 'AfuLearn Study Group',
    avatarUrl: findImage('groupAvatar2'),
    members: [users[0], users[4], users[5]],
    messages: [
        { id: 'lgm1', text: 'Anyone finished the first module?', createdAt: 'Yesterday', sender: users[4] },
    ],
  },
];
