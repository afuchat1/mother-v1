'use client';
import { useContext } from 'react';
import ProfilePageHeader from '@/components/profile-page-header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeContext } from '@/lib/context.tsx';
import { Moon, Sun, Bell, Lock, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
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
            <ProfilePageHeader title="Settings" />
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-6 max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Appearance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="theme-switch" className="flex items-center gap-4 cursor-pointer relative !-translate-y-0 !scale-100 peer-placeholder-shown:!translate-y-0 !top-0 peer-focus:!left-auto !p-0">
                                {theme === 'dark' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
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
                        <CardHeader>
                            <CardTitle className="text-lg">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="notification-switch" className="flex items-center gap-4 cursor-pointer relative !-translate-y-0 !scale-100 peer-placeholder-shown:!translate-y-0 !top-0 peer-focus:!left-auto !p-0">
                                   <Bell className="h-5 w-5 text-muted-foreground" />
                                   <span>Push Notifications</span>
                                </Label>
                                <Switch
                                    id="notification-switch"
                                    defaultChecked
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Account & Security</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button variant="outline" className="w-full justify-start">
                                <UserCog className="mr-2 h-4 w-4" /> Change Email
                             </Button>
                             <Button variant="outline" className="w-full justify-start">
                                <Lock className="mr-2 h-4 w-4" /> Change Password
                             </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
