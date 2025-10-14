'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ProfilePageHeaderProps = {
    title: string;
};

export default function ProfilePageHeader({ title }: ProfilePageHeaderProps) {
    const router = useRouter();

    return (
        <header className="flex items-center gap-2 bg-background p-2 sticky top-0 z-10 border-b shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="">
                <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold font-headline">{title}</h1>
        </header>
    );
}
