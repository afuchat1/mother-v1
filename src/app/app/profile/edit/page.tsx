'use client';
import { useState, useContext, useEffect } from 'react';
import { AppContext } from "@/lib/context.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProfilePageHeader from '@/components/profile-page-header';
import { Camera } from 'lucide-react';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

export default function EditProfilePage() {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();

    const userDocRef = authUser ? doc(firestore, 'users', authUser.uid) : null;
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || authUser?.displayName || '');
            setBio(userProfile.bio || '');
        }
    }, [userProfile, authUser]);

    const handleSaveChanges = () => {
        if (!userDocRef) return;
        setDoc(userDocRef, {
            name: name,
            bio: bio,
        }, { merge: true });
        toast({ title: "Profile updated!"});
    };

    if (!authUser) {
        return <p>Loading...</p>
    }

    return (
        <main className="h-full flex flex-col bg-secondary">
            <ProfilePageHeader title="Edit Profile" />
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-8 w-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-primary/50">
                                <AvatarImage src={authUser.photoURL || undefined} alt={name} />
                                <AvatarFallback>
                                {name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                             <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8 border-2 border-background">
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                         <div className="relative">
                            <Input id="name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <Label htmlFor="name">Name</Label>
                        </div>
                         <div className="relative">
                            <Textarea 
                                id="bio" 
                                placeholder="Tell us about yourself" 
                                className="min-h-[80px] peer"
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                            />
                            <Label htmlFor="bio" className='-translate-y-3 top-3 peer-placeholder-shown:top-1/2'>Bio</Label>
                        </div>
                    </div>

                    <Button size="lg" onClick={handleSaveChanges} className="w-full">Save Changes</Button>
                </div>
            </div>
        </main>
    );
}
