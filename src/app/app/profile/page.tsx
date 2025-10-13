'use client';
import { useContext } from 'react';
import { currentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, BookOpen, Moon, Sun } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeContext } from '@/lib/context.tsx';

export default function ProfilePage() {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    return null;
  }

  const { theme, setTheme } = themeContext;

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  return (
    <main className="h-full flex flex-col bg-secondary">
      <header className="p-4 border-b sticky top-0 bg-background z-10 shrink-0">
        <h1 className="text-2xl font-bold font-headline">Account</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">{currentUser.name}</h1>
            <p className="text-muted-foreground">user.email@afuchat.com</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Items Sold
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                in the last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,250.00</div>
              <p className="text-xs text-muted-foreground">
                from 12 sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                in total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
