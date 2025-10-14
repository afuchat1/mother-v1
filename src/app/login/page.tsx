'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AfuChatLogo } from "@/components/icons";
import { useAuth, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/app/chat');
    }
  }, [user, router]);

  const handleAuthError = (error: any) => {
    let title = "Authentication Error";
    let description = "An unexpected error occurred.";

    switch (error.code) {
      case "auth/invalid-email":
        title = "Invalid Email";
        description = "Please enter a valid email address.";
        break;
      case "auth/user-not-found":
        title = "User Not Found";
        description = "No account found with this email. Please sign up.";
        break;
      case "auth/wrong-password":
        title = "Incorrect Password";
        description = "The password you entered is incorrect. Please try again.";
        break;
      case "auth/email-already-in-use":
        title = "Email In Use";
        description = "This email is already associated with an account. Please sign in.";
        break;
      case "auth/weak-password":
        title = "Weak Password";
        description = "Password should be at least 6 characters long.";
        break;
      case "auth/invalid-credential":
        title = "Invalid Credentials";
        description = "The email or password you entered is incorrect. Please try again.";
        break;
      default:
        console.error(error);
        break;
    }

    toast({
      variant: "destructive",
      title,
      description,
    });
  };

  const handleAuthAction = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        const displayName = email.split('@')[0];
        
        await updateProfile(newUser, {
          displayName,
          photoURL: `https://picsum.photos/seed/${newUser.uid}/100/100`
        });

        const userDocRef = doc(firestore, "users", newUser.uid);
        await setDoc(userDocRef, {
          id: newUser.uid,
          name: displayName,
          email: newUser.email,
          avatarUrl: `https://picsum.photos/seed/${newUser.uid}/100/100`,
          createdAt: serverTimestamp()
        });
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
    return (
       <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="max-w-sm w-full text-center">
        <AfuChatLogo className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold font-headline mb-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-muted-foreground mb-8">
          Welcome to AfuChat Messenger
        </p>

        <div className="flex flex-col gap-4">
          <Input 
            type="email" 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-12 text-center text-lg"
          />
          <Input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-12 text-center text-lg"
          />
        </div>
        
        <Button 
          onClick={handleAuthAction} 
          disabled={isLoading || !email || !password}
          className="w-full mt-6 h-12 text-lg"
        >
          {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Button>

        <p className="mt-8 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-primary">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </p>
      </div>
    </div>
  );
}
