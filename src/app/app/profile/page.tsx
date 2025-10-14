'use client';
import { useContext } from 'react';
import { currentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Moon, Sun, ChevronRight, LogOut, Bell } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ThemeContext } from '@/lib/context.tsx';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
        <div className="flex flex-col gap-8">
            {/* User Info Card */}
            <Card>
                <CardContent className="pt-6">
                     <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback>
                            {currentUser.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold font-headline">{currentUser.name}</h2>
                            <p className="text-sm text-muted-foreground">user.email@afuchat.com</p>
                        </div>
                        <Button variant="ghost" size="icon">
                            <ChevronRight />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Mall Statistics */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Earnings
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,250</div>
                        <p className="text-xs text-muted-foreground">
                            Total earnings
                        </p>
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
            </div>
            
            {/* Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme-switch" className="flex items-center gap-4 relative !-translate-y-0 !scale-100 peer-placeholder-shown:!translate-y-0 !top-0 peer-focus:!left-auto !p-0">
                               {theme === 'dark' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
                               <span>Dark Mode</span>
                            </Label>
                            <Switch
                                id="theme-switch"
                                checked={theme === 'dark'}
                                onCheckedChange={handleThemeChange}
                            />
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between">
                            <Label htmlFor="notification-switch" className="flex items-center gap-4 relative !-translate-y-0 !scale-100 peer-placeholder-shown:!translate-y-0 !top-0 peer-focus:!left-auto !p-0">
                               <Bell className="h-5 w-5 text-muted-foreground" />
                               <span>Push Notifications</span>
                            </Label>
                            <Switch
                                id="notification-switch"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logout Button */}
            <Card>
                <CardContent className="pt-6">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10">
                        <LogOut className="mr-2 h-5 w-5" />
                        Log Out
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
