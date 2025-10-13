'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AfuChatLogo } from '@/components/icons';
import {
  Bot,
  GraduationCap,
  MessageSquare,
  Settings,
  Store,
  LogOut,
} from 'lucide-react';
import { currentUser, chats as allChats } from '@/lib/data';
import type { Chat } from '@/lib/types';
import ChatList from '@/components/chat/chat-list';

type AppShellProps = {
  children: ReactNode;
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
};

export default function AppShell({ children, activeChat, setActiveChat }: AppShellProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <AfuChatLogo className="size-7 text-primary" />
            <h1 className="text-xl font-semibold font-headline">AfuChat</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/app/chat')}
                tooltip="Chats"
              >
                <Link href="/app/chat">
                  <MessageSquare />
                  <span>Chats</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/app/mall')}
                tooltip="AfuMall"
              >
                <Link href="/app/mall">
                  <Store />
                  <span>AfuMall</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                disabled
                tooltip="AfuLearn"
              >
                <Link href="#">
                  <GraduationCap />
                  <span>AfuLearn</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveChat(allChats.find(c => c.type === 'ai') || null)}
                isActive={activeChat?.type === 'ai'}
                tooltip="AI Assistant"
              >
                  <Bot />
                  <span>AI Assistant</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarGroup className="mt-4 flex-grow">
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <ChatList
                chats={allChats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
            />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton disabled tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/login">
                        <LogOut />
                        <span>Logout</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">{currentUser.name}</span>
                  <span className="text-muted-foreground">Online</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Potentially a search bar or header content */}
            </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
