'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfilePageHeader from '@/components/profile-page-header';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, getDocs, limit, addDoc } from 'firebase/firestore';
import type { UserProfile, Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function NewChatPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const usersQuery = useMemoFirebase(() => {
    if (!searchTerm.trim()) return null;
    return query(
      collection(firestore, 'users'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
  }, [firestore, searchTerm]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleSelectUser = async (selectedUser: UserProfile) => {
    if (!currentUser) return;
    if (currentUser.uid === selectedUser.id) {
        router.push('/app/chat'); // Cannot chat with yourself
        return;
    }

    // Check if a DM chat already exists
    const chatsRef = collection(firestore, `users/${currentUser.uid}/chats`);
    const existingChatQuery = query(
        chatsRef, 
        where('type', '==', 'dm'),
        where('participantIds', 'array-contains', selectedUser.id)
    );

    const querySnapshot = await getDocs(existingChatQuery);
    if (!querySnapshot.empty) {
        // Chat already exists, navigate to it
        const chatId = querySnapshot.docs[0].id;
        router.push(`/app/chat/${chatId}`);
    } else {
        // Create a new chat for both users
        const newChat: Omit<Chat, 'id'> = {
            type: 'dm',
            participantIds: [currentUser.uid, selectedUser.id],
            name: selectedUser.name, // For the current user's chat list
            avatarUrl: selectedUser.avatarUrl,
            lastMessage: {
                text: 'Chat created',
                senderId: 'system',
                // @ts-ignore
                timestamp: serverTimestamp(),
            }
        };

        // Add chat to current user's subcollection
        const currentUserChatRef = await addDoc(collection(firestore, `users/${currentUser.uid}/chats`), newChat);

        // Add chat to the other user's subcollection
        const otherUserChat: Omit<Chat, 'id'> = {
             type: 'dm',
            participantIds: [currentUser.uid, selectedUser.id],
            name: currentUser.displayName || 'User',
            avatarUrl: currentUser.photoURL || '',
             lastMessage: {
                text: 'Chat created',
                senderId: 'system',
                // @ts-ignore
                timestamp: serverTimestamp(),
            }
        }
        await addDoc(collection(firestore, `users/${selectedUser.id}/chats`), otherUserChat);

        router.push(`/app/chat/${currentUserChatRef.id}`);
    }
  };

  return (
    <main className="h-full flex flex-col bg-secondary">
      <ProfilePageHeader title="New Message" />
      <div className="p-4 border-b bg-background">
        <Input
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="p-4 text-center text-muted-foreground">Searching...</p>}
        {!isLoading && users && users.length === 0 && searchTerm && (
          <p className="p-4 text-center text-muted-foreground">No users found.</p>
        )}
        <div className="flex flex-col">
            {users && users.filter(u => u.id !== currentUser?.uid).map((user) => (
                <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 px-4 py-3 text-left transition-colors border-b hover:bg-accent"
                >
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </main>
  );
}