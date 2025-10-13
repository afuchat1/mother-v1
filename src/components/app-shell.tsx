'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
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
import { currentUser } from '@/lib/data';
import { AppContext } from '@/lib/context';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';


export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const context = useContext(AppContext);
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  if (!context) {
    return <p>App shell context not found.</p>;
  }
  
  const { activeChat, setActiveChat } = context;

  const handleAiChatClick = () => {
    const aiChat = allChats.find(c => c.type === 'ai');
    if (aiChat) {
      setActiveChat(aiChat);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  }
  
  const isChatPage = pathname.startsWith('/app/chat');
  const showSidebar = !isMobile || (isChatPage && !activeChat);

  // In Next.js, it's better to conditionally render based on a flag than to have complex CSS classes
  // that might not be applied consistently across server/client renders, especially with custom hooks like useIsMobile.
  const allChats = []; 

  return (
    <SidebarProvider>
      <div className={cn("md:grid", isChatPage ? "md:grid-cols-[auto_1fr]" : "")}>
        {isChatPage && showSidebar ? (
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
                        onClick={handleAiChatClick}
                        isActive={activeChat?.type === 'ai'}
                        tooltip="AI Assistant"
                    >
                        <Bot />
                        <span>AI Assistant</span>
                    </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

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
        ) : null}

        <SidebarInset>
            <header className={cn(
                "flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6",
                !isChatPage && "md:hidden"
            )}>
                <SidebarTrigger className="md:hidden" />
                <div className="flex-1">
                    {/* Potentially a search bar or header content */}
                </div>
            </header>
            {children}
        </SidebarInset>
    </div>
    </SidebarProvider>
  );
}
