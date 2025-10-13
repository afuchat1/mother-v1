'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { MessageSquare, PlusCircle } from 'lucide-react';

const chatHistory = [
    { id: 1, title: 'How to make a button component?' },
    { id: 2, title: 'Next.js server vs client components' },
    { id: 3, title: 'Image generation prompt ideas' },
    { id: 4, title: 'Best practices for Tailwind CSS' },
    { id: 5, title: 'Fixing a weird bug in my code' },
];

type SideMenuProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function SideMenu({ isOpen, setIsOpen }: SideMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[80vw] max-w-sm p-0">
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle className="font-headline">Chat History</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1">
                <div className="py-2">
                    {chatHistory.map((chat) => (
                        <Button key={chat.id} variant="ghost" className="w-full justify-start gap-2 px-4 text-sm font-normal text-muted-foreground truncate">
                            <MessageSquare className="h-4 w-4" />
                            <span className="truncate flex-1 text-left">{chat.title}</span>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <Button className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Chat
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
