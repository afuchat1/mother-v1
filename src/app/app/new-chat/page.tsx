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
        <div className="relative">
          <Input
            placeholder="Search for users to chat with..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 border-0 pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <span className="text-muted-foreground">🔍</span>
          </div>
        </div>
        {searchTerm.trim() && (
          <p className="text-xs text-muted-foreground mt-2">
            {isLoading ? 'Searching...' : `${users?.length || 0} user${users?.length !== 1 ? 's' : ''} found`}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {!searchTerm.trim() && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-sm">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">👋</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Find someone to chat with</h3>
                <p className="text-sm text-muted-foreground">
                  Search for users by name to start a new conversation
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && searchTerm.trim() && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-3">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Searching for users...</p>
            </div>
          </div>
        )}
        
        {!isLoading && searchTerm.trim() && users && users.length === 0 && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-sm">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <span className="text-2xl">😔</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  Try searching with a different name or check your spelling
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
            {users && users.filter(u => u.id !== currentUser?.uid).map((user) => (
                <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center gap-3 px-4 py-4 text-left transition-all duration-200 border-b hover:bg-accent hover:shadow-sm active:scale-98"
                >
                    <div className="relative">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {user.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">{user.name}</p>
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                Start Chat
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </main>
  );
}
