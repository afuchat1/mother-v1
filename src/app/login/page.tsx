'use client';
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AfuChatLogo } from "@/components/icons";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/lib/context.tsx";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth, useUser } from "@/firebase";
import { signInAnonymously } from "firebase/auth";


export default function LoginPage() {
  const themeContext = useContext(ThemeContext);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

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

  const handleSignIn = () => {
    if (auth) {
        signInAnonymously(auth);
    }
  }

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
                Talk, trade, and learn — all in one conversation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <p className="px-4 text-center text-sm text-muted-foreground">
                    This is a demo of the AfuChat MVP.
                </p>
                <Button onClick={handleSignIn} type="submit" className="w-full font-bold">
                  Continue to App <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
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
