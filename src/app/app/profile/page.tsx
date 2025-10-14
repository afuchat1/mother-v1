'use client';
import { currentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, LogOut, User, Settings, ShoppingBag, DollarSign, HelpCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from "next/link";

const menuItems = [
  { href: '/app/profile/edit', icon: User, label: 'Edit Profile' },
  { href: '/app/profile/listings', icon: ShoppingBag, label: 'My Listings' },
  { href: '/app/profile/earnings', icon: DollarSign, label: 'Earnings' },
  { href: '/app/profile/settings', icon: Settings, label: 'Settings' },
  { href: '/app/profile/help', icon: HelpCircle, label: 'Help & Support' },
];

export default function ProfilePage() {
  return (
    <main className="h-full flex flex-col bg-secondary">
      <header className="p-4 border-b sticky top-0 bg-background z-10 shrink-0">
        <h1 className="text-2xl font-bold font-headline">Account</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-6">
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
                    </div>
                </CardContent>
            </Card>

            {/* Menu List */}
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <div className="flex items-center p-4 hover:bg-accent transition-colors cursor-pointer">
                          <item.icon className="h-5 w-5 text-muted-foreground mr-4" />
                          <span className="flex-1 font-medium">{item.label}</span>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Card>
                <CardContent className="p-2">
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10 h-auto p-3">
                        <LogOut className="mr-4 h-5 w-5" />
                        <span className="font-medium">Log Out</span>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
