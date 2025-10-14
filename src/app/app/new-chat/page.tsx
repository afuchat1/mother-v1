'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfilePageHeader from '@/components/profile-page-header';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, getDocs, limit, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile, Chat } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function NewChatPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !searchTerm.trim()) return null;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return query(
      collection(firestore, 'users'),
      where('name_lowercase', '>=', lowercasedSearchTerm),
      where('name_lowercase', '<=', lowercasedSearchTerm + '\uf8ff'),
      limit(10)
    );
  }, [firestore, searchTerm]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const handleSelectUser = async (selectedUser: UserProfile) => {
    if (!currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to start a chat.' });
        return;
    };
    if (currentUser.uid === selectedUser.id) {
        toast({ title: 'Chat with yourself?', description: "You can't start a chat with yourself." });
        return;
    }

    // A more robust way to create a unique DM chat ID
    const chatId = [currentUser.uid, selectedUser.id].sort().join('_');
    const chatDocRef = doc(firestore, `users/${currentUser.uid}/chats/${chatId}`);
    
    const docSnap = await getDoc(chatDocRef);

    if (docSnap.exists()) {
        // Chat already exists, navigate to it
        router.push(`/app/chat/${chatId}`);
    } else {
        // --- Create a new chat for both users ---
        const now = serverTimestamp();

        // Chat object for the current user
        const currentUserChat: Omit<Chat, 'id'> = {
            type: 'dm',
            participantIds: [currentUser.uid, selectedUser.id],
            name: selectedUser.name, 
            avatarUrl: selectedUser.avatarUrl,
            lastMessage: {
                text: 'You are now connected!',
                senderId: 'system',
                // @ts-ignore
                timestamp: now,
            }
        };

        // Chat object for the other user
        const otherUserChat: Omit<Chat, 'id'> = {
             type: 'dm',
            participantIds: [currentUser.uid, selectedUser.id],
            name: currentUser.displayName || 'New Contact',
            avatarUrl: currentUser.photoURL || '',
             lastMessage: {
                text: 'You are now connected!',
                senderId: 'system',
                // @ts-ignore
                timestamp: now,
            }
        }

        // Set the chat document in both users' subcollections
        await setDoc(chatDocRef, currentUserChat);
        await setDoc(doc(firestore, `users/${selectedUser.id}/chats/${chatId}`), otherUserChat);

        router.push(`/app/chat/${chatId}`);
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
