'use client';
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AfuChatLogo } from "@/components/icons";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/lib/context.tsx";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth, useUser }from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";


export default function LoginPage() {
  const themeContext = useContext(ThemeContext);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/app/chat');
    }
  }, [user, router]);

  if (!themeContext) {
    return null; // or a loading spinner
  }

  const { theme, setTheme } = themeContext;

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

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

  const handleSignUp = async () => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      // Update the user's profile display name
      await updateProfile(newUser, {
        displayName: email.split('@')[0], // Use part of email as initial name
        photoURL: `https://picsum.photos/seed/${newUser.uid}/40/40` // Assign a placeholder avatar
      });

      // Create a user profile document in Firestore
      const userDocRef = doc(firestore, "users", newUser.uid);
      await setDoc(userDocRef, {
        name: email.split('@')[0],
        email: newUser.email,
        avatarUrl: `https://picsum.photos/seed/${newUser.uid}/40/40`,
        createdAt: serverTimestamp()
      });

    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
    return (
       <div className="w-full min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen">
      <div className="flex items-center justify-center py-12 h-full">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <Card className="p-4 border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <AfuChatLogo className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold font-headline">Welcome to AfuChat</CardTitle>
              <CardDescription>
                Sign in or create an account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                   />
                   <Label htmlFor="email">Email</Label>
                </div>
                 <div className="relative">
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    />
                   <Label htmlFor="password">Password</Label>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleSignIn} disabled={isLoading || !email || !password}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                 <Button onClick={handleSignUp} variant="outline" disabled={isLoading || !email || !password}>
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </div>
               <p className="px-4 text-center text-sm text-muted-foreground">
                    This is a demo of the AfuChat MVP.
                </p>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-6">
                <Separator />
                <div className="flex items-center justify-between w-full">
                    <Label htmlFor="theme-switch" className="flex items-center gap-2 relative !-translate-y-0 !scale-100 peer-placeholder-shown:!translate-y-0 !top-0 peer-focus:!left-auto !p-0">
                       {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                       <span>Dark Mode</span>
                    </Label>
                    <Switch
                      id="theme-switch"
                      checked={theme === 'dark'}
                      onCheckedChange={handleThemeChange}
                    />
                </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
